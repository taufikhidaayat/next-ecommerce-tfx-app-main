import OfferSectionSkeleton from "@/components/skeletons/dashboard/OfferSectionSkeleton";
import { DEFAULT_PROMO_IMAGE } from "@/lib/constant";
import { Banner } from "@/types/banner/banner";
import Image from "next/image";
import Link from "next/link";

type OfferSectionProps = {
    banners?: Banner[];
    isPending?: boolean;
};

export default function OfferSection({ banners = [], isPending = false }: OfferSectionProps) {
    if (isPending) {
        return <OfferSectionSkeleton />;
    }

    const banner = banners?.[4] ?? {
        url: DEFAULT_PROMO_IMAGE,
        name: "Special Offer",
    };

    return (
        <section className="w-full px-2 sm:px-4">
            <Link href={banner.path || "#"} className="block">
                <div className="max-h-[200px] sm:max-h-[400px] overflow-hidden group relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                    <Image
                        src={banner.url}
                        alt={banner.name}
                        width={1600}
                        height={450}
                        className="object-cover w-full h-full rounded-2xl group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                </div>
            </Link>
        </section>
    );
}
