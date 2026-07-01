import { Cart } from "@/types/cart/cart"
import CartItemView from "./CartItemView";
import { CartItems } from "@/types/order/cartItems";
import { calculateSubtotalPrice } from "@/utils/productPricing";
import { ProductPriceInput } from "@/types/statistics/productPriceInput";
import RoundCheckbox from "../ui/RoundCheckbox";

type CartCardProps = {
    item: Cart;
    onDelete?: (id: string) => void;
    onIncrease?: (id: string) => void;
    onDecrease?: (id: string) => void;
    onQuantityChange?: (id: string, qty: number) => void;
    onNavigate?: () => void;
    isPending?: boolean;
    isDisable?: boolean;
    isSelectMode?: boolean;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
};

export default function CartCard({
    item,
    onDelete,
    onIncrease,
    onDecrease,
    onQuantityChange,
    onNavigate,
    isPending,
    isDisable,
    isSelectMode = false,
    isSelected = false,
    onSelect,
}: CartCardProps) {
    const productPriceInput: ProductPriceInput = {
        quantity: item.quantity,
        product: item.product
    };

    const cartItems: CartItems[] = [
        {
            id: item.id || "",
            // product.id kadang tidak ikut di response cart → fallback ke item.productId (selalu ada)
            product: { ...item.product, id: item.product?.id || item.productId },
            quantity: item.quantity,
            subtotal: calculateSubtotalPrice(productPriceInput).toString(),
            createdAt: item.createdAt || "",
            updatedAt: item.updatedAt || ""
        }
    ];

    const handleIncrease = isDisable ? undefined : onIncrease;
    const handleDecrease = isDisable ? undefined : onDecrease;
    const handleDelete = isDisable ? undefined : onDelete;
    const handleQuantityChange = isDisable ? undefined : onQuantityChange;

    return (
        <div
            className={`relative flex items-center transition-all duration-200 ${isSelectMode ? "cursor-pointer" : ""}`}
            onClick={isSelectMode ? () => onSelect?.(item.id!) : undefined}
        >
            {/* Checkbox — slide in saat select mode */}
            <div className={`shrink-0 overflow-hidden ${isSelectMode ? "w-6 ml-1 mr-3 opacity-100" : "w-0 opacity-0"}`}>
                <RoundCheckbox checked={isSelected} onToggle={() => onSelect?.(item.id!)} />
            </div>

            {/* Card content */}
            <div className="flex-1 min-w-0 relative transition-all duration-200 rounded-2xl">
                {/* Overlay Loading */}
                {isPending && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20 rounded-2xl">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" />
                    </div>
                )}
                <div className={`transition-opacity duration-200 rounded-2xl ${isDisable ? "opacity-50 cursor-not-allowed" : ""} ${isSelectMode ? "pointer-events-none" : ""}`}>
                    {item.product && (
                        <CartItemView
                            onIncrease={handleIncrease}
                            onDecrease={handleDecrease}
                            onDelete={handleDelete}
                            onQuantityChange={handleQuantityChange}
                            onNavigate={onNavigate}
                            cartItems={cartItems}
                            showLess={true}
                            isSelectMode={isSelectMode}
                            isSelected={isSelected}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
