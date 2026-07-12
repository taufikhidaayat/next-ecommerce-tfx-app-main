import { Brand } from "@/types/brand/brand";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface BrandCardProps {
    brand: Brand;
    isList?: boolean;
}

// Kartu satu merek (logo + nama). isList mengubah tata letak (grid vs baris daftar).
export default function BrandCard({ brand, isList = false }: BrandCardProps) {
    const t = useTranslations("brandCard");

    return (
        <Link href={`/products?brand=${encodeURIComponent(brand.name).toLowerCase()}`} className="no-underline">
            <div className="relative group flex flex-col items-center justify-center bg-green-50 border border-green-200 p-3 sm:p-5 rounded-xl cursor-pointer hover:shadow-md hover:border-green-400 hover:bg-green-100 transition-all duration-300 min-h-[160px] sm:min-h-[220px]">
                <div className="w-16 h-16 sm:w-28 sm:h-28 flex items-center justify-center mb-3 sm:mb-4 bg-white rounded-full shadow-sm border border-green-100 overflow-hidden">
                    <Image
                        src={brand.logoUrl || "/images/sample-brand.png"}
                        alt={brand.name}
                        width={112}
                        height={112}
                        className="h-10 w-10 sm:h-20 sm:w-20 object-contain"
                    />
                </div>
                <p className="text-base sm:text-lg font-semibold text-green-800 group-hover:text-green-900 text-center">
                    {brand.name}
                </p>
                {isList && brand.description && (
                    <div className="absolute z-20 hidden group-hover:block w-52 sm:w-64 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm bg-white border border-gray-200 rounded-md shadow-md bottom-full mb-2 sm:mb-3 left-1/2 -translate-x-1/2 space-y-1 sm:space-y-2">
                        <p className="text-gray-600">{brand.description}</p>
                        <p className="text-[10px] sm:text-xs text-gray-400 italic">
                            {t("tooltip")}
                        </p>
                    </div>
                )}
            </div>
        </Link>
    );
}
