"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import { useCartsByUserId, useDeleteCartById, useUpdateCart } from "@/satelite/services/cartService";
import StateIndicator from "../ui/feedback/StateIndicator";
import { DataNotFound } from "../ui/feedback/DataNotFound";
import Link from "next/link";
import CartCard from "../card/CartCard";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import CartPaymentInfo from "../ui/layout/CartPaymentInfo";
import { useAddOrder, useFirstPurchaseCheck } from "@/satelite/services/orderService";
import { PaymentMethod } from "@/enum/paymentMethod";
import { OrderType } from "@/enum/orderType";
import { useRouter } from "next/navigation";
import { calculateTotalPrice } from "@/utils/productPricing";
import { calculateEuclideanDistance } from "@/utils/distance";
import { useTranslations } from "next-intl";
import { useStoreSettings } from "@/satelite/services/storeSettingsService";
import { DeliveryData } from "../ui/layout/OrderTypeSelector";
import { useUserAddresses } from "@/satelite/services/userAddressService";
import ConfirmModal from "./ConfirmModal";
import CheckoutConfirmModal from "./CheckoutConfirmModal";
import RoundCheckbox from "../ui/RoundCheckbox";

interface CartModalProps {
  onClose: () => void;
  isCartOpen: boolean;
}

// Mobile bottom-sheet heights, as a fraction of the viewport height.
const SHEET_FULL_VH = 0.92; // height when fully expanded
const SHEET_PEEK_VH = 0.62; // height on first open (the "peek" snap point)

// Panel keranjang belanja (muncul dari samping/bawah). Komponen kompleks yang jadi
// pintu CHECKOUT: menampilkan isi keranjang, mengatur jumlah, memilih metode bayar,
// alamat pengiriman/ambil sendiri, catatan, poin, lalu membuat order.
// Mengumpulkan banyak data sekaligus: isi keranjang, pengaturan toko (ongkir),
// alamat user, dan status diskon pembelian pertama.
export default function CartModal({ onClose, isCartOpen }: CartModalProps) {
  const t = useTranslations("cart");
  const { data: itemsOrder, isPending: isLoading, isError, refetch } = useCartsByUserId();
  const { data: storeSettingsData } = useStoreSettings();
  const { data: addressesData, isPending: isLoadingAddresses } = useUserAddresses();
  const { data: firstPurchaseData } = useFirstPurchaseCheck();

  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.QRIS);
  const [note, setNote] = useState<string>("");
  const [orderType, setOrderType] = useState<OrderType>(OrderType.PICKUP);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [deliveryData, setDeliveryData] = useState<DeliveryData>({
    address: "",
    phone: "",
    notes: "",
    latitude: null,
    longitude: null,
  });

  const { mutate: updateCart } = useUpdateCart();
  const { mutate: deleteCart, mutateAsync: deleteCartAsync } = useDeleteCartById();
  const { mutate: createOrder, isPending } = useAddOrder();

  const cartItems = itemsOrder?.data?.itemOrder ?? [];

  // --- Selection mode ---
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);
  const [showConfirmDeleteSelected, setShowConfirmDeleteSelected] = useState(false);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [showConfirmCheckout, setShowConfirmCheckout] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isAllSelected = cartItems.length > 0 && selectedIds.size === cartItems.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cartItems.map(i => i.id!).filter(Boolean)));
    }
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = async () => {
    setIsDeletingBatch(true);
    try {
      await Promise.all([...selectedIds].map(id => deleteCartAsync(id)));
      await queryClient.invalidateQueries({ queryKey: ["carts"] });
      await refetch();
      setSelectedIds(new Set());
      setIsSelectMode(false);
    } catch {
      toast.error(t("deleteSelectedFailed"));
    } finally {
      setIsDeletingBatch(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeletingBatch(true);
    try {
      await Promise.all(cartItems.map(i => deleteCartAsync(i.id!)));
      await queryClient.invalidateQueries({ queryKey: ["carts"] });
      await refetch();
      setIsSelectMode(false);
      setSelectedIds(new Set());
    } catch {
      toast.error(t("deleteSelectedFailed"));
    } finally {
      setIsDeletingBatch(false);
    }
  };

  const queryClient = useQueryClient();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  // --- Mobile bottom-sheet drag state (HEIGHT-based: the sheet's actual height is
  // the visible area, so the body scrolls reliably at both peek and full). ---
  const [isMobile, setIsMobile] = useState(false);
  const [viewportH, setViewportH] = useState(0);
  const [sheetH, setSheetH] = useState<number | null>(null); // current height in px
  const [isDragging, setIsDragging] = useState(false);
  const currentHRef = useRef(0);
  const dragStartRef = useRef<{ startY: number; startH: number } | null>(null);
  const rafIdRef = useRef(0); // batasi penulisan height ke 1x per frame (anti-jank)
  const sheetRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const peekPx = () => window.innerHeight * SHEET_PEEK_VH;
  const fullPx = () => window.innerHeight * SHEET_FULL_VH;

  useEffect(() => {
    setMounted(true);
    const update = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind `sm` breakpoint
      setViewportH(window.innerHeight);
    };
    update();
    window.addEventListener("resize", update);
    return () => {
      setMounted(false);
      window.removeEventListener("resize", update);
    };
  }, []);

  useScrollLock(isCartOpen);

  // Entrance: start at height 0, then grow straight up to FULL (slides up).
  // Snap peek (tengah) tetap tersedia saat di-drag, ini hanya posisi default
  // ketika keranjang pertama dibuka.
  useEffect(() => {
    if (!isCartOpen || !isMobile) return;
    setIsDragging(true); // no transition while positioning at 0
    setSheetH(0);
    currentHRef.current = 0;
    const id = window.setTimeout(() => {
      setIsDragging(false); // re-enable transition, then grow to full
      setSheetH(fullPx());
      currentHRef.current = fullPx();
    }, 30);
    return () => window.clearTimeout(id);
  }, [isCartOpen, isMobile]);

  const beginDrag = (clientY: number) => {
    if (!isMobile) return;
    cancelAnimationFrame(rafIdRef.current);
    setIsDragging(true);
    dragStartRef.current = { startY: clientY, startH: currentHRef.current };
  };

  const moveDrag = (clientY: number) => {
    if (!isMobile || !dragStartRef.current) return;
    // Drag ke atas → tinggi bertambah, ke bawah → tinggi berkurang.
    let next = dragStartRef.current.startH + (dragStartRef.current.startY - clientY);
    const max = fullPx();
    if (next > max) next = max; // tidak boleh lebih tinggi dari full
    if (next < 0) next = 0;
    currentHRef.current = next;
    // Tulis height 1x per frame supaya tidak reflow berkali-kali (mulus seperti
    // useBottomSheetDrag pada modal alamat).
    cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      if (sheetRef.current) sheetRef.current.style.height = `${next}px`;
    });
  };

  // Animasikan ke tinggi target. Set juga imperatif supaya tetap bergerak walau
  // nilai state sama (React melewati update saat string-nya identik).
  const snapTo = (target: number) => {
    cancelAnimationFrame(rafIdRef.current); // jangan biarkan frame drag menimpa snap
    setIsDragging(false);
    setSheetH(target);
    currentHRef.current = target;
    const el = sheetRef.current;
    if (el) {
      el.style.transition = "height 0.32s cubic-bezier(0.32, 0.72, 0, 1)";
      el.style.height = `${target}px`;
    }
  };

  const endDrag = () => {
    if (!isMobile || !dragStartRef.current) return;
    cancelAnimationFrame(rafIdRef.current);
    dragStartRef.current = null;
    const cur = currentHRef.current;
    const peek = peekPx();
    const full = fullPx();
    if (cur < peek * 0.5) {
      setIsDragging(false);
      onClose(); // ditarik turun cukup jauh → tutup
    } else if (cur < (peek + full) / 2) {
      snapTo(peek); // balik ke peek
    } else {
      snapTo(full); // naik ke full
    }
  };

  // Pull-to-dismiss dari area konten (body): hanya aktif saat scroll di paling
  // atas dan ditarik ke bawah, supaya geser-tutup juga bisa dari tengah modal.
  useEffect(() => {
    const el = bodyRef.current;
    if (!isCartOpen || !isMobile || !el) return;

    let state: { startY: number; startH: number; active: boolean } | null = null;
    let rafId = 0;

    const onStart = (e: TouchEvent) => {
      state = { startY: e.touches[0].clientY, startH: currentHRef.current, active: false };
    };
    const onMove = (e: TouchEvent) => {
      if (!state) return;
      const atTop = el.scrollTop <= 0;
      if (!state.active) {
        const delta = e.touches[0].clientY - state.startY;
        if (atTop && delta > 0) {
          state.active = true;
          state.startY = e.touches[0].clientY; // rebase agar tidak melompat
          state.startH = currentHRef.current;
          setIsDragging(true);
        } else {
          return; // biarkan body scroll seperti biasa
        }
      }
      // Tarik ke bawah → tinggi sheet mengecil (gestur tutup).
      let next = state.startH - (e.touches[0].clientY - state.startY);
      if (next < 0) next = 0;
      const max = fullPx();
      if (next > max) next = max;
      e.preventDefault(); // hentikan scroll bawaan selagi menyeret sheet
      currentHRef.current = next;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (sheetRef.current) sheetRef.current.style.height = `${next}px`;
      });
    };
    const onEnd = () => {
      cancelAnimationFrame(rafId);
      if (state?.active) {
        const cur = currentHRef.current;
        const peek = peekPx();
        const full = fullPx();
        if (cur < peek * 0.5) {
          setIsDragging(false);
          onCloseRef.current(); // ditarik turun cukup jauh → tutup
        } else {
          const target = cur < (peek + full) / 2 ? peek : full;
          setIsDragging(false);
          setSheetH(target);
          currentHRef.current = target;
          if (sheetRef.current) {
            sheetRef.current.style.transition = "height 0.32s cubic-bezier(0.32, 0.72, 0, 1)";
            sheetRef.current.style.height = `${target}px`;
          }
        }
      }
      state = null;
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [isCartOpen, isMobile]);

  const storeSettings = storeSettingsData?.data ?? null;

  const firstPurchaseDiscount = firstPurchaseData?.data ?? null;

  const savedAddresses = addressesData?.data ?? [];

  // Only addresses within the store's delivery range are selectable.
  const isAddressWithinRadius = (lat: number, lng: number) => {
    if (!storeSettings) return true;
    const d = calculateEuclideanDistance(
      storeSettings.storeLatitude,
      storeSettings.storeLongitude,
      lat,
      lng
    );
    return d <= storeSettings.maxDeliveryRadius;
  };

  // Pre-fill delivery data when switching to delivery, prefer the default
  // address, but only if it is within range; otherwise the first in-range one.
  const handleOrderTypeChange = (type: OrderType) => {
    setOrderType(type);
    if (type === OrderType.DELIVERY) {
      const inRange = savedAddresses.filter((a) => isAddressWithinRadius(a.latitude, a.longitude));
      const chosen = inRange.find((a) => a.isDefault) ?? inRange[0];
      if (chosen) {
        setDeliveryData((prev) => ({
          ...prev,
          phone: prev.phone || chosen.phone || "",
          address: prev.address || chosen.address || "",
          latitude: prev.latitude ?? chosen.latitude ?? null,
          longitude: prev.longitude ?? chosen.longitude ?? null,
        }));
      }
    }
  };

  const initialTotalPrice = cartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  const actualTotalPrice = calculateTotalPrice(cartItems.map(item => ({
    quantity: item.quantity,
    product: item.product,
  })));

  const handleCheckout = () => {
    if (isPending) return;

    if (!cartItems.length) {
      toast.error(t("cartEmpty"));
      return;
    }

    const orderData: Record<string, unknown> = {
      paymentMethod: paymentMethod,
      note: note,
      orderType: orderType,
      pointsToRedeem: pointsToRedeem,
    };

    if (orderType === OrderType.DELIVERY) {
      orderData.deliveryAddress = deliveryData.address;
      orderData.deliveryPhone = deliveryData.phone;
      orderData.deliveryNotes = deliveryData.notes;
      orderData.deliveryLatitude = deliveryData.latitude;
      orderData.deliveryLongitude = deliveryData.longitude;
    }

    createOrder(orderData as never, {
      onSuccess: (data) => {
        toast.success(t("checkoutSuccess"));
        queryClient.invalidateQueries({ queryKey: ["carts"] });
        queryClient.invalidateQueries({ queryKey: ["point-balance"] });
        queryClient.invalidateQueries({ queryKey: ["point-history"] });
        setPointsToRedeem(0);
        onClose();
        router.push(`/orders/${data.id}`);
      },
      onError: () => {
        toast.error(t("checkoutFailed"));
      },
    });
  };

  const findCartItem = (itemId: string) => {
    return itemsOrder?.data?.itemOrder.find((item) => item.id === itemId);
  };

  const afterMutationSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ["carts"] });
    const result = await refetch();
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (!result.isFetching && !result.isLoading) {
      setPendingItemId(null);
    }
  };

  const onDecrease = (itemId: string) => {
    if (pendingItemId) return;

    const cartItem = findCartItem(itemId);
    if (!cartItem) return;

    const updatedQuantity = cartItem.quantity - 1;
    if (updatedQuantity <= 0) {
      onDelete(itemId);
      return;
    }

    setPendingItemId(itemId);

    updateCart(
      { id: cartItem.id, quantity: updatedQuantity },
      {
        onSuccess: afterMutationSuccess,
        onError: () => {
          toast.error(t("updateFailed"));
          setPendingItemId(null);
        },
      }
    );
  };

  const onIncrease = (itemId: string) => {
    if (pendingItemId) return;

    const cartItem = findCartItem(itemId);
    if (!cartItem) return;

    const updatedQuantity = cartItem.quantity + 1;
    const stock = cartItem.product?.stock ?? 0;

    if (updatedQuantity > stock) {
      toast.error(t("exceedsStock"));
      return;
    }

    setPendingItemId(itemId);

    updateCart(
      { id: cartItem.id, quantity: updatedQuantity },
      {
        onSuccess: afterMutationSuccess,
        onError: () => {
          toast.error(t("updateFailed"));
          setPendingItemId(null);
        },
      }
    );
  };

  const onDelete = (itemId: string) => {
    if (pendingItemId) return;

    const cartItem = findCartItem(itemId);
    if (!cartItem) return;

    setPendingItemId(itemId);

    deleteCart(cartItem.id!, {
      onSuccess: afterMutationSuccess,
      onError: () => {
        toast.error(t("deleteFailed"));
        setPendingItemId(null);
      },
    });
  };

  const onQuantityChange = (itemId: string, newQuantity: number) => {
    if (pendingItemId) return;

    const cartItem = findCartItem(itemId);
    if (!cartItem) return;

    if (newQuantity === cartItem.quantity) return;

    if (newQuantity <= 0) {
      onDelete(itemId);
      return;
    }

    const stock = cartItem.product?.stock ?? 0;
    if (newQuantity > stock) {
      toast.error(t("exceedsStock"));
      return;
    }

    setPendingItemId(itemId);

    updateCart(
      { id: cartItem.id, quantity: newQuantity },
      {
        onSuccess: afterMutationSuccess,
        onError: () => {
          toast.error(t("updateFailed"));
          setPendingItemId(null);
        },
      }
    );
  };

  if (!mounted || !isCartOpen) return null;

  // On mobile the sheet's HEIGHT is the visible area (driven by drag state); on
  // desktop it falls back to the centered-modal classes.
  const sheetStyle: CSSProperties = isMobile
    ? {
        // Saat sheetH belum di-set, biarkan CSS (max-h-[92dvh]) yang membatasi
        // tinggi, supaya body tetap ter-constrain & bisa di-scroll.
        height: sheetH != null ? sheetH : undefined,
        transition: isDragging ? "none" : "height 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
      }
    : {};

  const portal = createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4 animate-backdrop-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={sheetRef}
        className="flex w-full max-w-7xl flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden max-h-[92dvh] sm:h-[94vh] sm:max-h-none sm:animate-zoom-in"
        style={{ ...sheetStyle, willChange: "height" }}
      >
        {/* Grab zone */}
        <div
          className="shrink-0 touch-none select-none"
          onTouchStart={(e) => beginDrag(e.touches[0].clientY)}
          onTouchMove={(e) => moveDrag(e.touches[0].clientY)}
          onTouchEnd={endDrag}
        >
          {/* Header */}
          <div className="relative flex items-center justify-center bg-white px-5 pt-6 pb-3 sm:pt-5 sm:pb-5 border-b border-gray-100">
            {/* Drag pill */}
            <div className="sm:hidden absolute top-2.5 left-1/2 -translate-x-1/2">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-emerald-700 tracking-wide">{t("title")}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-500 text-gray-500 hover:text-white transition"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain sm:overflow-hidden bg-gray-50">
          <div className={`flex flex-col sm:flex-row sm:gap-6 gap-2 px-3 sm:px-8 py-4 sm:py-6 sm:h-full ${!cartItems.length ? "h-full" : ""}`}>
          <div
            className={
              !cartItems.length
                ? "w-full h-full flex flex-col items-center justify-center text-center sm:my-0"
                : "w-full sm:w-2/3 sm:h-full"
            }
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-10 h-10 border-t-4 border-b-4 border-gray-500 rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">{t("loading")}</p>
              </div>
            ) : isError ? (
              <StateIndicator isLoading={false} isError={isError} />
            ) : !cartItems.length ? (
              <>
                <DataNotFound
                  title={t("emptyTitle")}
                  description={t("emptyDesc")}
                  notFoundImage="/images/icons/empty-cart.png"
                  className="max-w-md w-full mx-auto flex flex-col items-center justify-center text-center gap-4 p-4 sm:p-6"
                />
                <Link href="/products">
                  <span
                    className="inline-block mt-4 bg-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:bg-emerald-700 transition font-semibold shadow-md"
                    onClick={onClose}
                  >
                    {t("browseProducts")}
                  </span>
                </Link>
              </>
            ) : (
              <div className="flex flex-col h-full min-h-0">
                {/* Header */}
                {isSelectMode ? (
                  <div className="flex items-center justify-between px-1 pb-2 shrink-0 h-10">
                    <div className="flex items-center gap-2 cursor-pointer select-none" onClick={toggleSelectAll}>
                      <RoundCheckbox
                        checked={isAllSelected}
                        onToggle={toggleSelectAll}
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        {selectedIds.size > 0 ? t("selectedCount", { count: selectedIds.size }) : t("selectAll")}
                      </span>
                    </div>
                    <button onClick={exitSelectMode} className="text-base font-normal text-red-500 hover:text-red-700 transition">
                      {t("cancelSelect")}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-1 pb-2 shrink-0 h-10">
                    <span className="text-sm text-gray-500 font-semibold">{cartItems.length} produk</span>
                    <button
                      onClick={() => setIsSelectMode(true)}
                      className="text-sm font-semibold text-orange-500 hover:bg-orange-100 hover:text-orange-600 px-3 py-1.5 rounded-lg transition"
                    >
                      {t("edit")}
                    </button>
                  </div>
                )}

                {/* Items list, scroll internal HANYA di desktop; di mobile biar body
                    yang scroll (kalau list ini juga overflow-y-auto, sentuhan di tengah
                    "terjebak" di sini sehingga hanya bisa scroll dari pinggir). */}
                <div className="space-y-3 sm:space-y-4 sm:overflow-y-auto sm:overscroll-y-contain flex-1 min-h-0 px-1.5 sm:px-2 py-1">
                  {/* First Purchase Promo Banner */}
                  {firstPurchaseDiscount?.eligible && firstPurchaseDiscount.discountPercent > 0 && (
                    <div className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl">
                      <span className="text-xl sm:text-2xl">🎉</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-amber-700">{t("firstPurchaseBanner")}</p>
                        <p className="text-[10px] sm:text-xs text-amber-600">{t("firstPurchaseBannerDesc", { percent: firstPurchaseDiscount.discountPercent })}</p>
                      </div>
                      <span className="shrink-0 bg-amber-500 text-white font-bold text-xs sm:text-sm px-2 py-1 rounded-lg">
                        {firstPurchaseDiscount.discountPercent}%
                      </span>
                    </div>
                  )}
                  {cartItems.map((item) => (
                    <CartCard
                      key={item.id}
                      item={item}
                      onDecrease={onDecrease}
                      onIncrease={onIncrease}
                      onDelete={onDelete}
                      onQuantityChange={onQuantityChange}
                      onNavigate={onClose}
                      isPending={pendingItemId === item.id}
                      isDisable={isPending || isDeletingBatch}
                      isSelectMode={isSelectMode}
                      isSelected={selectedIds.has(item.id!)}
                      onSelect={toggleSelect}
                    />
                  ))}
                  {firstPurchaseDiscount?.eligible && firstPurchaseDiscount.discountPercent > 0 && (
                    <p className="flex items-start gap-1.5 text-[10px] sm:text-xs text-red-600 px-1">
                      <span className="shrink-0">⚠️</span>
                      <span>{t("firstPurchaseWarning")}</span>
                    </p>
                  )}
                </div>

                {/* Select mode action bar */}
                {isSelectMode && (
                  <div className="shrink-0 pt-3 mt-1 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={() => { if (cartItems.length > 0) setShowConfirmDeleteAll(true); }}
                      disabled={cartItems.length === 0 || isDeletingBatch}
                      className="flex-1 py-2.5 rounded-xl border-2 border-red-300 text-red-500 hover:bg-red-50 font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {t("deleteAll")}
                    </button>
                    <button
                      onClick={() => { if (selectedIds.size > 0) setShowConfirmDeleteSelected(true); }}
                      disabled={selectedIds.size === 0 || isDeletingBatch}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isDeletingBatch ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : null}
                      {t("deleteSelected", { count: selectedIds.size })}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="w-full sm:w-1/3 sm:h-full flex flex-col">
              <CartPaymentInfo
                initialTotalPrice={initialTotalPrice}
                actualTotalPrice={actualTotalPrice}
                onCheckout={() => setShowConfirmCheckout(true)}
                isPending={isPending}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                note={note}
                setNote={setNote}
                isDisable={isPending}
                orderType={orderType}
                onOrderTypeChange={handleOrderTypeChange}
                deliveryData={deliveryData}
                onDeliveryDataChange={setDeliveryData}
                storeSettings={storeSettings}
                savedAddresses={savedAddresses}
                isLoadingAddresses={isLoadingAddresses}
                firstPurchaseDiscount={firstPurchaseDiscount}
                onNavigateAway={onClose}
                pointsToRedeem={pointsToRedeem}
                onPointsRedeemChange={setPointsToRedeem}
              />
            </div>
          )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      {portal}
      <ConfirmModal
        open={showConfirmDeleteSelected}
        loading={isDeletingBatch}
        title={t("confirmDeleteSelectedTitle")}
        message={t("confirmDeleteSelectedMessage")}
        confirmButtonText={t("deleteSelected", { count: selectedIds.size })}
        confirmVariant="danger"
        onConfirm={() => { setShowConfirmDeleteSelected(false); handleDeleteSelected(); }}
        onCancel={() => setShowConfirmDeleteSelected(false)}
      />
      <ConfirmModal
        open={showConfirmDeleteAll}
        loading={isDeletingBatch}
        title={t("confirmDeleteAllTitle")}
        message={t("confirmDeleteAllMessage")}
        confirmButtonText={t("deleteAll")}
        confirmVariant="danger"
        onConfirm={() => { setShowConfirmDeleteAll(false); handleDeleteAll(); }}
        onCancel={() => setShowConfirmDeleteAll(false)}
      />
      <CheckoutConfirmModal
        open={showConfirmCheckout}
        loading={isPending}
        itemCount={cartItems.length}
        finalTotal={Math.max(
          0,
          Number(actualTotalPrice) -
            (firstPurchaseDiscount?.eligible && firstPurchaseDiscount.discountPercent > 0
              ? Math.round(Number(actualTotalPrice) * (firstPurchaseDiscount.discountPercent / 100))
              : 0) -
            pointsToRedeem
        )}
        paymentMethod={paymentMethod}
        orderType={orderType}
        deliveryAddress={orderType === "DELIVERY" ? deliveryData.address : undefined}
        onConfirm={handleCheckout}
        onCancel={() => !isPending && setShowConfirmCheckout(false)}
      />
    </>
  );
}
