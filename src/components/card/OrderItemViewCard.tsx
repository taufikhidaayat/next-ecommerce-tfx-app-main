import { PriceType } from "@/enum/priceType";
import { DEFAULT_PRODUCT_URL } from "@/lib/constant";
import { OrderItems } from "@/types/order/orderItems";
import { formatCurrency } from "@/utils/formatCurrency";
import Image from "next/image";
import Link from "next/link";
import { FaTrashCan } from "react-icons/fa6";
import { FiChevronRight } from "react-icons/fi";
import { useTranslations } from "next-intl";

type OrderItemViewCardProps = {
    orderItem: OrderItems;
    withQuantity: boolean;
};

export default function OrderItemViewCard({ orderItem, withQuantity }: OrderItemViewCardProps) {
    const t = useTranslations("orders.item");

    const initalPrice = orderItem.priceAtOrder;
    const actualPrice = orderItem.actualPriceAtOrder;

    const initialSubTotalPrice = orderItem.subtotal;
    const actualSubtotalPrice = orderItem.actualSubtotal;

    const getPriceLabel = () => {
        switch (orderItem.priceType) {
            case PriceType.REGULAR:
                return t("priceLabel.retail");
            case PriceType.WHOLESALE:
                return t("priceLabel.wholesale");
            default:
                return t("priceLabel.default");
        }
    };

    const tag = getPriceLabel();

    // Kartu bisa diklik ke detail produk hanya saat bukan mode edit kuantitas
    // (mode itu punya tombol +/- & hapus yang tidak boleh berada di dalam <a>).
    const isLinkable = !withQuantity && !!orderItem.productId;

    const cardClass = `group flex flex-wrap items-center gap-3 md:flex-nowrap md:gap-4 bg-white p-3 md:p-4 rounded-xl shadow-md border border-gray-200 md:px-8 transition-all duration-300 ${
        isLinkable ? "hover:border-emerald-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer" : ""
    }`;

    const cardInner = (
        <>
            {/* Product Image */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border border-gray-300 shrink-0">
                <Image
                    src={orderItem.productImageUrl || DEFAULT_PRODUCT_URL}
                    alt={orderItem.productName || t("unnamed")}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            {/* Product Details */}
            <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-semibold text-gray-800 line-clamp-1 transition-colors group-hover:text-emerald-700">
                    {orderItem.productName ?? t("unnamed")}
                </h3>
                <div className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                    <span>{orderItem.quantity} x</span>
                    <div className="flex items-center gap-1">
                        {Number(initalPrice) > Number(actualPrice) && (
                            <span className="line-through text-red-400 text-xs">
                                {formatCurrency(Number(initalPrice))}
                            </span>
                        )}
                        <span className="text-gray-800 font-medium">
                            {formatCurrency(Number(actualPrice))}
                        </span>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-bold">{tag}</p>
            </div>
            {/* Quantity Controls */}
            {withQuantity && (
                <div className="flex items-center space-x-2">
                    <>
                        <button
                            className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled
                        >
                            -
                        </button>
                        <span className="text-gray-900 font-semibold">{orderItem.quantity}</span>
                        <button
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled
                        >
                            +
                        </button>
                    </>
                </div>
            )}
            <div className="w-full md:w-28 md:ml-3 mt-1 md:mt-0 flex items-center justify-between gap-2 border-t border-gray-100 pt-2 md:border-0 md:pt-0 md:flex-col md:items-center md:justify-center md:text-center">
                <p className="text-xs md:text-sm text-gray-500">{t("subtotal")}</p>
                <div className="flex flex-col items-end md:items-center gap-0.5 md:mt-1">
                    <span className="text-base font-bold text-gray-900">
                        {formatCurrency(Number(actualSubtotalPrice))}
                    </span>
                    {Number(initialSubTotalPrice) > Number(actualSubtotalPrice) && (
                        <span className="text-xs line-through text-red-400">
                            {formatCurrency(Number(initialSubTotalPrice))}
                        </span>
                    )}
                </div>
            </div>
            {/* Chevron affordance — muncul saat hover untuk menandakan kartu bisa diklik */}
            {isLinkable && (
                <FiChevronRight
                    className="hidden md:block shrink-0 text-gray-300 transition-all duration-300 group-hover:text-emerald-500 group-hover:translate-x-0.5"
                    size={18}
                />
            )}
            {/* Delete Icon */}
            {withQuantity && (
                <div className="flex flex-col justify-start items-end ml-0 md:ml-4">
                    <button
                        className="cursor-pointer text-red-700 hover:text-red-400 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={t("delete")}
                        type="button"
                        disabled
                    >
                        <FaTrashCan size={20} />
                    </button>
                </div>
            )}
        </>
    );

    return (
        <div className="relative">
            {isLinkable ? (
                <Link href={`/products/${orderItem.productId}`} className={cardClass}>
                    {cardInner}
                </Link>
            ) : (
                <div className={cardClass}>{cardInner}</div>
            )}
        </div>
    );
}
