import { Product } from "@/types/product/product";
import { ProductPriceInput } from "@/types/statistics/productPriceInput";
import CartItemView from "./CartItemView";
import { CartItems } from "@/types/order/cartItems";
import { calculateSubtotalPrice } from "@/utils/productPricing";

type BuyNowCardProps = {
    onIncrease?: (id: string) => void;
    onDecrease?: (id: string) => void;
    onQuantityChange?: (id: string, qty: number) => void;
    isPending?: boolean;
    productData: Product;
    quantity: number;
    isDisable?: boolean;
};

export default function BuyNowCard({
    onIncrease,
    onDecrease,
    onQuantityChange,
    isPending,
    productData,
    quantity,
    isDisable,
}: BuyNowCardProps) {
    const product = productData;

    const productPriceInput: ProductPriceInput = {
        quantity: quantity,
        product: productData,
    };

    const cartItems: CartItems[] = [
        {
            id: product.id || "",
            product: product,
            quantity: quantity,
            subtotal: calculateSubtotalPrice(productPriceInput).toString(),
            createdAt: product.createdAt || "",
            updatedAt: product.updatedAt || "",
        },
    ];

    const handleIncrease = isDisable ? undefined : onIncrease;
    const handleDecrease = isDisable ? undefined : onDecrease;
    const handleQuantityChange = isDisable ? undefined : onQuantityChange;

    return (
        <div className="relative">
            {/* Overlay Loading */}
            {isPending && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-xl">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" />
                </div>
            )}

            {/* Disabled state wrapper */}
            <div
                className={`transition-opacity duration-200 rounded-xl ${isDisable ? "opacity-50 cursor-not-allowed" : ""
                    }`}
            >
                {product && (
                    <CartItemView
                        onIncrease={handleIncrease}
                        onDecrease={handleDecrease}
                        onQuantityChange={handleQuantityChange}
                        cartItems={cartItems}
                        showLess={true}
                        isBuyNow={true}
                    />
                )}
            </div>
        </div>
    );
}
