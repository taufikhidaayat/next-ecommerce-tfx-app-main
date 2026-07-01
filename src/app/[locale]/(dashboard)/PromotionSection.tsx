"use client";

import PromoCard from "@/components/card/PromoCard";
import PromoSkeleton from "@/components/skeletons/dashboard/PromoSkeleton";
import { PromoPosition } from "@/enum/promoPosition";
import { DEFAULT_PROMO_IMAGE } from "@/lib/constant";
import { Banner } from "@/types/banner/banner";

type PromotionsSectionProps = {
    banners?: Banner[];
    isPending?: boolean;
};

export default function PromotionsSection({
    banners = [],
    isPending = false,
}: PromotionsSectionProps) {
    if (isPending) {
        return (
            <section className="w-full px-2 sm:px-4">
                <PromoSkeleton />
            </section>
        );
    }

    const topRow = [
        { position: PromoPosition.MAIN, slot: "sm:h-72" },
        { position: PromoPosition.SIDE_TOP, slot: "sm:h-72 sm:w-72" },
    ];
    const bottomRow = [
        { position: PromoPosition.BOTTOM_1, slot: "sm:h-48" },
        { position: PromoPosition.BOTTOM_2, slot: "sm:h-48" },
    ];

    return (
        <section className="w-full px-2 sm:px-4 space-y-2 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_18rem] gap-2 sm:gap-4">
                {topRow.map((item, i) => (
                    <div key={item.position} className={item.slot}>
                        <PromoCard
                            backgroundImage={banners?.[i]?.url || DEFAULT_PROMO_IMAGE}
                            link={banners?.[i]?.path || "#"}
                            altText={banners?.[i]?.name || "Promo"}
                            position={item.position}
                        />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                {bottomRow.map((item, i) => (
                    <div key={item.position} className={item.slot}>
                        <PromoCard
                            backgroundImage={banners?.[i + 2]?.url || DEFAULT_PROMO_IMAGE}
                            link={banners?.[i + 2]?.path || "#"}
                            altText={banners?.[i + 2]?.name || "Promo"}
                            position={item.position}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
