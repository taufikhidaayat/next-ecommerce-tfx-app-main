"use client";

import Breadcrumbs from "@/components/ui/layout/Breadcrumb";
import ErrorComponent from "@/components/ui/feedback/Error";
import { DataNotFound } from "@/components/ui/feedback/DataNotFound";
import ProductCard from "@/components/card/ProductCard";
import { ProductListSkeleton } from "@/components/skeletons/product/ProductListSkeleton";
import { useWishlist } from "@/satelite/services/wishlistService";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { GrFavorite } from "react-icons/gr";

export default function WishlistPage() {
    const t = useTranslations("wishlist");
    const router = useRouter();
    const { data, isPending, isError } = useWishlist();

    if (isError) return <ErrorComponent />;

    const items = data?.data ?? [];

    return (
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full pt-3 pb-5">
                <Breadcrumbs
                    items={[
                        { label: t("breadcrumb.dashboard"), href: "/" },
                        { label: t("breadcrumb.profile"), href: "/profile" },
                        { label: t("breadcrumb.wishlist") },
                    ]}
                />

                <div className="mb-6 mt-3">
                    <h2
                        className="text-4xl font-extrabold mb-2"
                        style={{ background: "linear-gradient(135deg, #EE0979 0%, #8E2DE2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                    >
                        {t("pageTitle")}
                    </h2>
                    <p className="text-gray-600">{t("pageSubtitle")}</p>
                </div>

                {isPending ? (
                    <ProductListSkeleton />
                ) : items.length === 0 ? (
                    <DataNotFound
                        notFoundImage="/images/empty_wishlist.png"
                        title={t("emptyTitle")}
                        description={t.rich("emptyDescription", {
                            heart: () => (
                                <GrFavorite
                                    className="inline-block align-middle mx-0.5"
                                    style={{ color: "#EE0979" }}
                                    size={16}
                                />
                            ),
                        })}
                        action={
                            <button
                                onClick={() => router.push("/products")}
                                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                            >
                                {t("browseProducts")}
                            </button>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
                        {items.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
