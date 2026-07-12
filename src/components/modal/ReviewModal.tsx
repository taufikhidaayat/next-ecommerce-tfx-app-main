"use client";

import { useState, useEffect, useMemo, useRef, type CSSProperties } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { createPortal } from "react-dom";
import RatingStars from "../ui/layout/RatingStar";
import Image from "next/image";
import { OrderItems } from "@/types/order/orderItems";
import CustomSelect from "../ui/forms/CustomSelect";
import FormField from "../ui/forms/FormField";
import { DEFAULT_PRODUCT_URL } from "@/lib/constant";
import { useAddRating, useUpdateRating } from "@/satelite/services/productService";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "../ui/button/Checkbox";
import { useTranslations } from "next-intl";
import { FiAward, FiCheckCircle } from "react-icons/fi";
import { FaSpinner, FaTimes } from "react-icons/fa";

const MIN_CHARS_FOR_POINTS = 10;
const POINT_EARN_RATE = 0.01;

type ReviewModalProps = {
    isOpen: boolean;
    onClose: () => void;
    orderItem: OrderItems[];
    isResult?: boolean;
};

type RatingMutationResponse = {
    data?: {
        pointsAwarded?: number;
    };
};

// Modal tulis ulasan: pilih bintang + tulis komentar untuk sebuah produk yang dibeli.
// Bisa dapat poin (lihat aturan poin di backend). Juga dipakai untuk mengedit ulasan.
export default function ReviewModal({
    orderItem,
    isOpen,
    onClose,
}: ReviewModalProps) {
    const t = useTranslations("reviewModal");
    const queryClient = useQueryClient();

    const [selectedItem, setSelectedItem] = useState<OrderItems | undefined>();
    const [reviews, setReviews] = useState<string>("");
    const [rating, setRating] = useState<number>(0);
    const [isPublic, setIsPublic] = useState<boolean>(true);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useScrollLock(isOpen);

    // --- Drag bottom-sheet (mobile), tarik handle/header ke bawah untuk menutup ---
    const [isMobile, setIsMobile] = useState(false);
    const [viewportH, setViewportH] = useState(0);
    const [translateY, setTranslateY] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const currentTranslateRef = useRef(0);
    const dragStartRef = useRef<{ startY: number; startTranslate: number } | null>(null);
    const sheetRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const hasEnteredRef = useRef(false);
    const onCloseRef = useRef<() => void>(() => {});
    const isPendingRef = useRef(false);

    useEffect(() => {
        const update = () => {
            setIsMobile(window.innerWidth < 640);
            setViewportH(window.innerHeight);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    // JS-driven entrance (mobile): posisikan off-screen lalu slide ke 0.
    useEffect(() => {
        if (!isOpen || !isMobile || hasEnteredRef.current) return;
        hasEnteredRef.current = true;
        const ih = window.innerHeight;
        setIsDragging(true);
        setTranslateY(ih);
        currentTranslateRef.current = ih;
        const id = window.setTimeout(() => {
            setIsDragging(false);
            setTranslateY(0);
            currentTranslateRef.current = 0;
        }, 30);
        return () => window.clearTimeout(id);
    }, [isMobile, isOpen]);

    // Saat modal ditutup, reset agar animasi masuk berjalan lagi saat dibuka kembali.
    useEffect(() => {
        if (!isOpen) {
            hasEnteredRef.current = false;
            setTranslateY(null);
            currentTranslateRef.current = 0;
        }
    }, [isOpen]);

    // Pull-to-dismiss dari area konten: hanya aktif saat scroll di paling atas lalu ditarik ke bawah.
    useEffect(() => {
        const el = bodyRef.current;
        if (!isMobile || !el) return;

        let state: { startY: number; active: boolean } | null = null;

        const onStart = (e: TouchEvent) => {
            state = { startY: e.touches[0].clientY, active: false };
        };
        const onMove = (e: TouchEvent) => {
            if (!state) return;
            const atTop = el.scrollTop <= 0;
            if (!state.active) {
                const delta = e.touches[0].clientY - state.startY;
                if (atTop && delta > 0) {
                    state.active = true;
                    state.startY = e.touches[0].clientY;
                    setIsDragging(true);
                } else {
                    return;
                }
            }
            let next = e.touches[0].clientY - state.startY;
            if (next < 0) next = 0;
            e.preventDefault();
            currentTranslateRef.current = next;
            if (sheetRef.current) sheetRef.current.style.transform = `translateY(${next}px)`;
        };
        const onEnd = () => {
            if (state?.active) {
                setIsDragging(false);
                const cur = currentTranslateRef.current;
                if (cur > window.innerHeight * 0.25 && !isPendingRef.current) {
                    onCloseRef.current();
                } else {
                    setTranslateY(0);
                    currentTranslateRef.current = 0;
                    if (sheetRef.current) {
                        sheetRef.current.style.transition = "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)";
                        sheetRef.current.style.transform = "translateY(0px)";
                    }
                }
            }
            state = null;
        };

        el.addEventListener("touchstart", onStart, { passive: true });
        el.addEventListener("touchmove", onMove, { passive: false });
        el.addEventListener("touchend", onEnd, { passive: true });
        return () => {
            el.removeEventListener("touchstart", onStart);
            el.removeEventListener("touchmove", onMove);
            el.removeEventListener("touchend", onEnd);
        };
    }, [isMobile, isOpen]);

    const beginDrag = (clientY: number) => {
        if (!isMobile) return;
        setIsDragging(true);
        dragStartRef.current = { startY: clientY, startTranslate: currentTranslateRef.current };
    };

    const moveDrag = (clientY: number) => {
        if (!isMobile || !dragStartRef.current) return;
        let next = dragStartRef.current.startTranslate + (clientY - dragStartRef.current.startY);
        if (next < 0) next = 0;
        currentTranslateRef.current = next;
        if (sheetRef.current) sheetRef.current.style.transform = `translateY(${next}px)`;
    };

    const endDrag = () => {
        if (!isMobile || !dragStartRef.current) return;
        dragStartRef.current = null;
        setIsDragging(false);
        const cur = currentTranslateRef.current;
        if (cur > window.innerHeight * 0.25 && !isPendingRef.current) {
            onCloseRef.current();
        } else {
            setTranslateY(0);
            currentTranslateRef.current = 0;
            if (sheetRef.current) {
                sheetRef.current.style.transition = "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)";
                sheetRef.current.style.transform = "translateY(0px)";
            }
        }
    };

    const { mutate: addReview, isPending: isAdding } = useAddRating();
    const { mutate: updateReview, isPending: isUpdating } = useUpdateRating();

    const isSubmitting = isAdding || isUpdating;

    const hasUnreviewed = orderItem?.some(item => !item.isReviewed) ?? false;
    const mode: "write" | "edit" = hasUnreviewed ? "write" : "edit";

    const selectableItems = useMemo(() => {
        if (!orderItem) return [];
        if (mode === "write") {
            return orderItem.filter(item => !item.isReviewed);
        }
        return orderItem.filter(
            item => item.isReviewed && (item.productRating?.editCount ?? 0) === 0,
        );
    }, [orderItem, mode]);

    useEffect(() => {
        if (isOpen && selectableItems.length > 0) {
            const firstItem = selectableItems[0];
            setSelectedItem(firstItem);

            if (firstItem.productRating) {
                setReviews(firstItem.productRating.comment ?? "");
                setRating(firstItem.productRating.rating ?? 0);
                setIsPublic(firstItem.productRating.isPublic ?? true);
            } else {
                setReviews("");
                setRating(0);
                setIsPublic(true);
            }
        }
    }, [selectableItems, isOpen]);

    const isEditing = !!(selectedItem?.isReviewed && selectedItem?.productRating);
    const alreadyAwarded = (selectedItem?.productRating?.pointsAwarded ?? 0) > 0;

    const trimmedLength = reviews.trim().length;
    const hasEnoughChars = trimmedLength >= MIN_CHARS_FOR_POINTS;
    const hasRating = rating > 0;
    const isPointEligible = !alreadyAwarded && hasRating && hasEnoughChars;

    const estimatedPoints = useMemo(() => {
        if (!selectedItem || !isPointEligible) return 0;
        const price = Number(selectedItem.priceAtOrder ?? 0);
        const qty = Number(selectedItem.quantity ?? 0);
        return Math.floor(price * qty * POINT_EARN_RATE);
    }, [selectedItem, isPointEligible]);

    const handleSuccess = (data: RatingMutationResponse | undefined, mode: "create" | "update") => {
        const points = data?.data?.pointsAwarded ?? 0;
        if (points > 0) {
            const key = mode === "update" ? "pointsUpdatedToast" : "pointsEarnedToast";
            toast.success(t(key, { points: points.toLocaleString("id-ID") }));
        } else {
            toast.success(t(mode === "update" ? "updateSuccess" : "addSuccess"));
        }
        queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        if (selectedItem) {
            queryClient.invalidateQueries({ queryKey: ['order', selectedItem.orderId] });
            queryClient.invalidateQueries({ queryKey: ['point-balance'] });
            queryClient.invalidateQueries({ queryKey: ['point-history'] });
        }
        handleClose();
    };

    const handleSubmit = () => {
        if (!selectedItem) return;

        if (isEditing) {
            updateReview(
                {
                    reviewId: selectedItem.productRating!.id,
                    rating,
                    comment: reviews,
                    productId: selectedItem.productId,
                    orderItemId: selectedItem.id,
                    isPublic: isPublic,
                },
                {
                    onSuccess: (data) => handleSuccess(data as RatingMutationResponse, "update"),
                    onError: () => {
                        toast.error(t("updateFailed"));
                    },
                }
            );
        } else {
            addReview(
                {
                    productId: selectedItem.productId,
                    rating,
                    comment: reviews,
                    orderItemId: selectedItem.id,
                    isPublic: isPublic,
                },
                {
                    onSuccess: (data) => handleSuccess(data as RatingMutationResponse, "create"),
                    onError: () => {
                        toast.error(t("addFailed"));
                    },
                }
            );
        }
    };

    const handleClose = () => {
        setSelectedItem(undefined);
        setReviews("");
        setRating(0);
        setIsPublic(true);
        onClose();
    };

    onCloseRef.current = handleClose;
    isPendingRef.current = isSubmitting;

    if (!isOpen || !mounted) return null;

    const progressPercent = Math.min(100, (trimmedLength / MIN_CHARS_FOR_POINTS) * 100);

    const isUnchanged =
        isEditing &&
        !!selectedItem?.productRating &&
        reviews === selectedItem.productRating.comment &&
        rating === selectedItem.productRating.rating &&
        isPublic === selectedItem.productRating.isPublic;

    const SHEET_VH = 0.92;
    const sheetStyle: CSSProperties = isMobile
        ? {
            height: (viewportH || window.innerHeight) * SHEET_VH,
            transform: translateY !== null ? `translateY(${translateY}px)` : undefined,
            transition: isDragging ? "none" : "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
            willChange: "transform",
        }
        : {};

    return createPortal(
        <>
            {/* Backdrop: penuhi lebar window termasuk gutter scrollbar (hindari sliver terang) */}
            <div className="fixed top-0 left-0 w-screen h-[100dvh] z-[60] bg-black/40 animate-backdrop-in" />
            {/* Lapis pemusat: inset-0 mengecualikan gutter → modal tetap center secara visual */}
            <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <div
                    ref={sheetRef}
                    style={sheetStyle}
                    className="flex w-full max-w-md flex-col rounded-t-3xl sm:rounded-3xl bg-gray-50 shadow-2xl sm:max-h-[94vh] overflow-hidden sm:animate-zoom-in"
                >
                {/* Grab zone, tarik untuk menutup di mobile (handle + header) */}
                <div
                    className="shrink-0 touch-none select-none"
                    onTouchStart={(e) => beginDrag(e.touches[0].clientY)}
                    onTouchMove={(e) => moveDrag(e.touches[0].clientY)}
                    onTouchEnd={endDrag}
                >
                    {/* Drag handle, affordance bottom-sheet (mobile only) */}
                    <div className="sm:hidden flex justify-center bg-white pt-3 pb-2">
                        <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                    </div>
                    {/* Header */}
                    <div className="relative flex items-center justify-center bg-white px-5 pt-3 pb-4 sm:pt-6 sm:pb-5 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-green-700 text-center">
                            {isEditing ? t("updateTitle") : t("reviewTitle")}
                        </h3>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Close"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                    {/* Card: Product select */}
                    <section className="rounded-2xl bg-white p-4 shadow-sm">
                        <CustomSelect
                            label={t("selectProduct")}
                            id="selectedItem"
                            value={selectedItem?.id || ""}
                            onChange={(value) => {
                                const item = orderItem.find((i) => i.id === value);
                                if (!item) return;
                                setSelectedItem(item);

                                if (item.isReviewed && item.productRating) {
                                    setReviews(item.productRating.comment ?? "");
                                    setRating(item.productRating.rating ?? 0);
                                    setIsPublic(item.productRating.isPublic ?? true);
                                } else {
                                    setReviews("");
                                    setRating(0);
                                    setIsPublic(true);
                                }
                            }}
                            options={orderItem.map((r) => {
                                const isDone = mode === "write"
                                    ? r.isReviewed
                                    : (r.productRating?.editCount ?? 0) > 0;
                                return {
                                    value: r.id,
                                    label: r.productName,
                                    disabled: isDone,
                                    badge: isDone ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 ring-1 ring-gray-200 whitespace-nowrap">
                                            <FiCheckCircle size={11} />
                                            {mode === "write" ? t("reviewed") : t("edited")}
                                        </span>
                                    ) : undefined,
                                };
                            })}
                            required
                            placeholder={t("selectProductPlaceholder")}
                        />
                    </section>

                    {/* Card: Rating + review */}
                    <section className="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
                        {/* Product image */}
                        <div className="flex justify-center">
                            <Image
                                src={selectedItem?.productImageUrl || DEFAULT_PRODUCT_URL}
                                alt={t("productImage")}
                                width={112}
                                height={112}
                                className="h-28 w-28 rounded-2xl object-cover shadow-sm ring-1 ring-gray-100"
                            />
                        </div>

                        {/* Rating prompt + stars */}
                        <div className="text-center">
                            <p className="font-semibold text-gray-800">
                                {isEditing ? t("updateRating") : t("rateProduct")}
                            </p>
                            <div className="mt-3 flex justify-center">
                                <RatingStars value={rating} onChange={setRating} className="flex w-full max-w-[240px] gap-2" />
                            </div>
                        </div>

                        {/* Points info banner */}
                        {alreadyAwarded ? (
                            <div className="flex items-start gap-2.5 rounded-xl border border-gray-200 bg-gray-50 p-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-200">
                                    <FiCheckCircle className="h-4 w-4 text-gray-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-gray-700">
                                        {t("pointsAlreadyAwardedTitle")}
                                    </p>
                                    <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500">
                                        {t("pointsAlreadyAwardedBody", {
                                            points: (selectedItem?.productRating?.pointsAwarded ?? 0).toLocaleString("id-ID"),
                                        })}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                                    <FiAward className="h-4 w-4 text-amber-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-amber-900">
                                        {t("pointsBannerTitle")}
                                    </p>
                                    <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700">
                                        {t("pointsBannerBody", { min: MIN_CHARS_FOR_POINTS })}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Review textarea */}
                        <FormField
                            label={t("review")}
                            id="productRating"
                            value={reviews}
                            onChange={(e) => setReviews(e.target.value)}
                            placeholder={t("reviewPlaceholder")}
                            rows={4}
                            type="textarea"
                        />

                        {/* Char counter + progress (only when points are still earnable) */}
                        {!alreadyAwarded && (
                            <div className="px-1">
                                <div className="flex items-center justify-between gap-2 text-[11px]">
                                    <div className="flex items-center gap-1.5">
                                        {isPointEligible ? (
                                            <>
                                                <FiCheckCircle className="h-3.5 w-3.5 text-green-600" />
                                                <span className="font-medium text-green-700">
                                                    {t("charReady")}
                                                </span>
                                            </>
                                        ) : !hasEnoughChars ? (
                                            <span className="text-gray-500">
                                                {t("charCountForPoints", {
                                                    current: trimmedLength,
                                                    min: MIN_CHARS_FOR_POINTS,
                                                })}
                                            </span>
                                        ) : (
                                            <span className="font-medium text-amber-700">
                                                {t("needRatingForPoints")}
                                            </span>
                                        )}
                                    </div>
                                    {isPointEligible && estimatedPoints > 0 && (
                                        <span className="font-bold tabular-nums text-amber-600">
                                            {t("estimatedPoints", {
                                                points: estimatedPoints.toLocaleString("id-ID"),
                                            })}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className={`h-full transition-all duration-300 ${isPointEligible ? "bg-green-500" : "bg-amber-400"}`}
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Public toggle */}
                        <div className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                            <Checkbox
                                checked={isPublic}
                                onChange={(checked) => setIsPublic(checked)}
                                disabled={isSubmitting}
                            />
                            <span className="text-sm font-medium text-gray-700">
                                {t("shareProfile")}
                            </span>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-gray-100 bg-white px-4 py-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !rating || isUnchanged}
                        className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                {isEditing ? t("updating") : t("submitting")}
                            </>
                        ) : (
                            isEditing ? t("updateBtn") : t("submitBtn")
                        )}
                    </button>
                </div>
                </div>
            </div>
        </>,
        document.body
    );
}
