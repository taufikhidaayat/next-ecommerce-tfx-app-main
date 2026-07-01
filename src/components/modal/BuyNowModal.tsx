"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CartPaymentInfo from "../ui/layout/CartPaymentInfo";
import { toast } from "react-toastify";
import { useAddOrder } from "@/satelite/services/orderService";
import { useQueryClient } from "@tanstack/react-query";
import { PaymentMethod } from "@/enum/paymentMethod";
import { OrderType } from "@/enum/orderType";
import { Product } from "@/types/product/product";
import BuyNowCard from "../card/BuyNowCard";
import { useRouter } from "next/navigation";
import { calculateTotalPrice } from "@/utils/productPricing";
import { calculateEuclideanDistance } from "@/utils/distance";
import { useTranslations } from "next-intl";
import ModalBox from "./ModalBox";
import CheckoutConfirmModal from "./CheckoutConfirmModal";
import { useStoreSettings } from "@/satelite/services/storeSettingsService";
import { DeliveryData } from "../ui/layout/OrderTypeSelector";
import { useUserAddresses } from "@/satelite/services/userAddressService";

interface BuyNowModalProps {
    userId: string;
    onClose: () => void;
    isCartOpen: boolean;
    product?: Product;
    quantityData: number;
}

export default function BuyNowModal({
    userId,
    onClose,
    isCartOpen,
    product,
    quantityData,
}: BuyNowModalProps) {
    const [quantity, setQuantity] = useState(quantityData);
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

    const { mutate: createOrder, isPending } = useAddOrder();
    const { data: storeSettingsData } = useStoreSettings();
    const { data: addressesData, isPending: isLoadingAddresses } = useUserAddresses();
    const queryClient = useQueryClient();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);
    const [showConfirmCheckout, setShowConfirmCheckout] = useState(false);
    const t = useTranslations("buyNow");

    const storeSettings = storeSettingsData?.data ?? null;
    const savedAddresses = addressesData?.data ?? [];

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted || !isCartOpen || !product) return null;

    const initialTotalPrice = product.price * quantity;
    const actualTotalPrice = calculateTotalPrice([
        {
            quantity: quantity,
            product: product,
        },
    ]);

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

    const handleCheckout = () => {
        if (isPending) return;

        const orderData: Record<string, unknown> = {
            userId,
            paymentMethod: paymentMethod,
            note: note,
            orderType: orderType,
            pointsToRedeem: pointsToRedeem,
            items: [
                {
                    productId: product.id,
                    quantity: quantity,
                },
            ],
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
                toast.success(t("success"));
                queryClient.invalidateQueries({ queryKey: ["orders", userId] });
                queryClient.invalidateQueries({ queryKey: ["point-balance"] });
                queryClient.invalidateQueries({ queryKey: ["point-history"] });
                setPointsToRedeem(0);
                onClose?.();
                router.push(`/orders/${data.id}`);
            },
            onError: () => {
                toast.error(t("failed"));
            },
        });
    };

    const onIncrease = () => {
        const stock = product.stock ?? 0;
        if (quantity >= stock) {
            toast.error(t("exceedStock"));
            return;
        }
        setQuantity((prev) => prev + 1);
    };

    const onDecrease = () => {
        if (quantity <= 1) {
            toast.error(t("minQuantity"));
            return;
        }
        setQuantity((prev) => prev - 1);
    };

    const onQuantityChange = (_id: string, newQuantity: number) => {
        const stock = product.stock ?? 0;
        if (newQuantity < 1) {
            toast.error(t("minQuantity"));
            return;
        }
        if (newQuantity > stock) {
            toast.error(t("exceedStock"));
            setQuantity(stock);
            return;
        }
        setQuantity(newQuantity);
    };

    const portal = createPortal(
        <ModalBox
            isOpen={isCartOpen}
            onClose={onClose}
            maxWidth="max-w-6xl"
            modalHeight="sm:max-h-screen"
        >
            <ModalBox.Header>
                <h2 className="text-xl font-bold text-green-700 text-center pb-2">
                    {t("title")}
                </h2>
            </ModalBox.Header>
            <ModalBox.Body className="!p-0">
                <div className="flex flex-col sm:flex-row sm:gap-6 gap-2 sm:px-8 py-3 sm:py-6">
                    <div className="w-full sm:w-2/3 sm:h-full">
                        <div className="space-y-4 overflow-y-auto h-full pr-1 sm:pr-2">
                            <BuyNowCard
                                onIncrease={onIncrease}
                                onDecrease={onDecrease}
                                onQuantityChange={onQuantityChange}
                                isPending={isPending}
                                productData={product}
                                quantity={quantity}
                                isDisable={isPending}
                            />
                        </div>
                    </div>
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
                            pointsToRedeem={pointsToRedeem}
                            onPointsRedeemChange={setPointsToRedeem}
                        />
                    </div>
                </div>
            </ModalBox.Body>
        </ModalBox>,
        document.body
    );

    return (
        <>
            {portal}
            <CheckoutConfirmModal
                open={showConfirmCheckout}
                loading={isPending}
                itemCount={1}
                productName={product?.name}
                finalTotal={Math.max(0, Number(actualTotalPrice) - pointsToRedeem)}
                paymentMethod={paymentMethod}
                orderType={orderType}
                deliveryAddress={orderType === "DELIVERY" ? deliveryData.address : undefined}
                onConfirm={handleCheckout}
                onCancel={() => !isPending && setShowConfirmCheckout(false)}
            />
        </>
    );
}
