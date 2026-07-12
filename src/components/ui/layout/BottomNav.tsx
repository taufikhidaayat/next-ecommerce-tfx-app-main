"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LuHouse, LuClipboardList, LuUser } from "react-icons/lu";
import { AiOutlineProduct } from "react-icons/ai";
import { RiShoppingBasket2Fill } from "react-icons/ri";
import { IconType } from "react-icons";
import { stripLocale } from "@/lib/i18n";
import { useTranslations } from "next-intl";
import { useCartsByUserId } from "@/satelite/services/cartService";
import { useAuth } from "@/satelite/services/authService";
import CartModal from "@/components/modal/Cart";

type SideItem = {
    href: string;
    icon: IconType;
    key: "home" | "products" | "orders" | "profile";
};

const leftItems: SideItem[] = [
    { href: "/", icon: LuHouse, key: "home" },
    { href: "/products", icon: AiOutlineProduct, key: "products" },
];

const rightItems: SideItem[] = [
    { href: "/orders", icon: LuClipboardList, key: "orders" },
    { href: "/profile", icon: LuUser, key: "profile" },
];

// Navigasi bawah khusus HP (ikon: Beranda, Kategori, Pesanan, Profil) yang menempel
// di bawah layar, pola umum aplikasi mobile.
export default function BottomNav() {
    const t = useTranslations("bottomNav");
    const pathname = usePathname();
    const router = useRouter();
    const path = stripLocale(pathname || "/");

    const [isCartOpen, setIsCartOpen] = useState(false);

    const { data: user } = useAuth();
    const { data } = useCartsByUserId();
    const count = data?.data?.itemOrder?.length ?? 0;

    const handleCartClick = () => {
        if (!user) {
            router.push("/login");
            return;
        }
        setIsCartOpen(true);
    };

    useEffect(() => {
        document.body.classList.toggle("overflow-hidden", isCartOpen);
        return () => document.body.classList.remove("overflow-hidden");
    }, [isCartOpen]);


    const isActive = (href: string) =>
        href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);

    const renderItem = ({ href, icon: Icon, key }: SideItem) => {
        const active = isActive(href);
        return (
            <Link
                key={key}
                href={href}
                className={`group relative flex flex-1 flex-col items-center justify-center gap-0.5 mx-1 my-1 rounded-full py-1 transition-colors duration-200 ${
                    active ? "bg-emerald-100" : "hover:bg-emerald-100/60"
                }`}
                aria-current={active ? "page" : undefined}
            >
                <Icon
                    className={`text-[22px] transition-colors duration-200 ${
                        active ? "text-emerald-600" : "text-gray-400 group-hover:text-emerald-500"
                    }`}
                />
                <span
                    className={`text-[10px] font-medium transition-colors duration-200 ${
                        active ? "text-emerald-600" : "text-gray-400 group-hover:text-emerald-500"
                    }`}
                >
                    {t(key)}
                </span>
            </Link>
        );
    };

    return (
        <>
            <div
                className="fixed inset-x-0 bottom-0 z-[39] pointer-events-none md:hidden"
                style={{
                    height: "calc(env(safe-area-inset-bottom) + 5rem)",
                    background: "linear-gradient(to bottom, transparent 0%, white 100%)",
                }}
            />

            <nav
                className="fixed inset-x-0 bottom-0 z-40 px-4 md:hidden"
                style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
                aria-label="Bottom navigation"
            >
<div className="relative mx-auto flex max-w-md items-stretch overflow-hidden rounded-full border border-gray-200 bg-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.15)]">
                    {leftItems.map(renderItem)}

                    {/* Center slot, same width as items for even spacing; FAB floats above */}
                    <div className="flex flex-1 flex-col items-center justify-center py-1.5">
                        <span className="flex flex-col items-center gap-0.5 px-3 py-1.5">
                            <span className="h-[22px]" aria-hidden />
                            <span className="text-[10px] font-medium text-gray-400">{t("cart")}</span>
                        </span>
                    </div>

                    {rightItems.map(renderItem)}
                </div>

                {/* Floating Cart button (FAB), outside the pill so overflow-hidden doesn't clip it */}
                <button
                    type="button"
                    onClick={handleCartClick}
                    aria-label={t("cart")}
                    className="absolute left-1/2 -top-6 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#0B4540] text-white shadow-lg shadow-[#0B4540]/30 ring-4 ring-white transition-colors hover:bg-[#0a5b54]"
                >
                    <RiShoppingBasket2Fill className="text-[30px]" />
                    {count > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white">
                            {count > 99 ? "99+" : count}
                        </span>
                    )}
                </button>
            </nav>

            {isCartOpen && (
                <CartModal onClose={() => setIsCartOpen(false)} isCartOpen={isCartOpen} />
            )}
        </>
    );
}
