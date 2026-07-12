import { PromoPosition } from "@/enum/promoPosition";
import { DEFAULT_PROMO_IMAGE } from "@/lib/constant";
import Image from "next/image";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface PromoCardProps {
    backgroundImage?: string;
    link?: string;
    altText?: string;
    position?: PromoPosition;
    isPending?: boolean;
}

// Kartu promo/banner kecil yang bisa diklik menuju tujuannya (produk/kategori/dll).
export default function PromoCard({
    backgroundImage,
    link = "#",
    altText = "Promo Image",
    position = PromoPosition.MAIN,
    isPending = false,
}: PromoCardProps) {
    const getSizeByPosition = () => {
        switch (position) {
            case PromoPosition.MAIN:
                return "(max-width: 640px) 100vw, (max-width: 1200px) 75vw, 50vw";
            case PromoPosition.SIDE_TOP:
            case PromoPosition.BOTTOM_1:
            case PromoPosition.BOTTOM_2:
            case PromoPosition.BOTTOM:
                return "(max-width: 640px) 50vw, (max-width: 1200px) 25vw, 25vw";
            default:
                return "100vw";
        }
    };

    return (
        <div className="relative flex w-full h-full rounded-md sm:rounded-lg overflow-hidden">
            {isPending ? (
                <Skeleton className="w-full h-full rounded-md sm:rounded-lg" />
            ) : (
                <a
                    href={link}
                    className="relative flex w-full h-full rounded-md sm:rounded-lg overflow-hidden group"
                >
                    {/* Mobile: gambar penuh sesuai rasio asli (tanpa terpotong) */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={backgroundImage || DEFAULT_PROMO_IMAGE}
                        alt={altText}
                        className="block w-full h-auto rounded-md sm:hidden"
                    />
                    {/* Desktop: isi penuh slot (cover) untuk tata letak grid */}
                    <Image
                        src={backgroundImage || DEFAULT_PROMO_IMAGE}
                        alt={altText}
                        fill
                        sizes={getSizeByPosition()}
                        className="hidden object-cover transition-transform duration-300 group-hover:scale-105 sm:block"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-25 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </a>
            )}
        </div>
    );
}