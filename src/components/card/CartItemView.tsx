import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import CartItemsViewCard from "./CartItemViewCard";
import { CartItems } from "@/types/order/cartItems";
import { useTranslations } from "next-intl";

type Props = {
    cartItems: CartItems[];
    onIncrease?: (id: string) => void;
    onDecrease?: (id: string) => void;
    onDelete?: (id: string) => void;
    onQuantityChange?: (id: string, qty: number) => void;
    onNavigate?: () => void;
    isBuyNow?: boolean;
    showLess?: boolean;
    isSelectMode?: boolean;
    isSelected?: boolean;
};

export default function CartItemView({ cartItems, onIncrease, onDecrease, onDelete, onQuantityChange, onNavigate, showLess = false, isBuyNow = false, isSelectMode = false, isSelected = false }: Props) {
    const [showAll, setShowAll] = useState(false);
    const t = useTranslations("cartItem");

    const itemsToShow = showLess && !showAll ? cartItems.slice(0, 1) : cartItems;

    return (
        <div className="space-y-4 pr-2 min-w-0 overflow-hidden">
            {itemsToShow.map((item) => (
                <CartItemsViewCard
                    key={item.id}
                    cartItems={item}
                    onIncrease={onIncrease}
                    onDecrease={onDecrease}
                    onDelete={onDelete}
                    onQuantityChange={onQuantityChange}
                    onNavigate={onNavigate}
                    isBuyNow={isBuyNow}
                    isSelectMode={isSelectMode}
                    isSelected={isSelected}
                />
            ))}

            {showLess && !showAll && cartItems.length > 1 && (
                <div className="flex justify-center pt-2">
                    <button
                        className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors
                                   bg-transparent font-bold text-sm px-3 py-1 rounded focus:outline-none"
                        onClick={() => setShowAll(true)}
                        aria-label={t("seeAll")}
                    >
                        {t("seeAll", { count: cartItems.length - 1 })}
                        <FiChevronDown className="text-lg" />
                    </button>
                </div>
            )}
        </div>
    );
}