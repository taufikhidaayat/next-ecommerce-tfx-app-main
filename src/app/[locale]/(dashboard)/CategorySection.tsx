'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from "next-intl";

// Explicit mapping: visual card → DB category name (lowercase, must match DB)
const categoryVisuals = [
    { key: "galeriMaduku", dbCategory: "galeri maduku", icon: '/images/categories/madukucardcategories.png', bgColor: 'bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]', accent: 'border border-yellow-400/30' },
    { key: "bread", dbCategory: "roti & selai", icon: '/images/categories/bread.png', bgColor: 'bg-gradient-to-br from-[#0a5b54] to-[#05433E]' },
    { key: "beverages", dbCategory: "minuman ringan & isotonik", icon: '/images/categories/beverages.png', bgColor: 'bg-gradient-to-br from-[#166088] to-[#0D4A6B]' },
    { key: "instantFood", dbCategory: "mie instan", icon: '/images/categories/instant-food.png', bgColor: 'bg-gradient-to-br from-[#A04D1A] to-[#833A0E]' },
    { key: "snacks", dbCategory: "snack & cemilan", icon: '/images/categories/snacks.png', bgColor: 'bg-gradient-to-br from-[#943838] to-[#742A2A]' },
    { key: "homeEssentials", dbCategory: "peralatan & rumah tangga", icon: '/images/categories/household.png', bgColor: 'bg-gradient-to-br from-[#0B663B] to-[#064D2B]' },
    { key: "personalCare", dbCategory: "skincare & kosmetik", icon: '/images/categories/personal-care.png', bgColor: 'bg-gradient-to-br from-[#5B3875] to-[#452A59]' },
    { key: "dairyProducts", dbCategory: "susu cair & bubuk", icon: '/images/categories/milk.png', bgColor: 'bg-gradient-to-br from-[#8C4C2B] to-[#6E371C]' },
];

// Bagian "Kategori" di beranda: deretan kategori sebagai pintu jelajah produk per kategori.
export default function CategorySection() {
    const t = useTranslations("home.categories");
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        checkScroll();
        el.addEventListener('scroll', checkScroll, { passive: true });
        window.addEventListener('resize', checkScroll);
        return () => {
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        const { current } = scrollRef;
        if (current) {
            const scrollAmount = 220;
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <section className="w-full px-2 sm:px-4">
            <div className="container mx-auto">
                {/* Header */}
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div>
                        <h2 className="text-xl sm:text-3xl font-extrabold text-green-800 mb-1 sm:mb-2">{t("title")}</h2>
                        <p className="text-sm sm:text-base text-gray-600">{t("subtitle")}</p>
                    </div>
                    <Link href="/categories">
                        <button className="border border-green-800 text-green-800 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg hover:bg-green-800 hover:text-white transition-all duration-300 mt-2 sm:mt-0 text-sm sm:text-base font-medium">
                            {t("viewAll")}
                        </button>
                    </Link>
                </div>

                {/* Carousel Container */}
                <div className="relative group/carousel">
                    {/* Scroll Buttons - positioned outside content, visible on hover */}
                    {canScrollLeft && (
                        <button
                            aria-label={t("scrollLeft")}
                            className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 bg-white p-2 sm:p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10 border border-gray-200 hidden sm:block sm:opacity-0 sm:group-hover/carousel:opacity-100 hover:scale-110"
                            onClick={() => scroll('left')}
                        >
                            <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                        </button>
                    )}
                    {canScrollRight && (
                        <button
                            aria-label={t("scrollRight")}
                            className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 bg-white p-2 sm:p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10 border border-gray-200 hidden sm:block sm:opacity-0 sm:group-hover/carousel:opacity-100 hover:scale-110"
                            onClick={() => scroll('right')}
                        >
                            <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                        </button>
                    )}

                    {/* Category Cards */}
                    <div
                        className="flex gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden no-scrollbar px-1 py-2 scroll-fade-edges"
                        ref={scrollRef}
                        style={{
                            WebkitOverflowScrolling: 'touch',
                            scrollbarWidth: 'none',
                        }}
                    >
                        {categoryVisuals.map((category, index) => {
                            const isGaleriMaduku = category.key === 'galeriMaduku';
                            return (
                                <div
                                    key={index}
                                    className={`group relative min-w-[120px] sm:min-w-[165px] md:min-w-[192px] h-40 sm:h-52 md:h-64 flex-shrink-0 rounded-2xl ${category.bgColor} ${'accent' in category && category.accent ? category.accent : ''} overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer`}
                                    onClick={() => router.push(`/products?category=${encodeURIComponent(category.dbCategory)}`)}
                                >
                                    {isGaleriMaduku ? (
                                        <>
                                            {/* Gold bubble polkadot pattern (matches neighbour cards) */}
                                            <div className="absolute inset-0 opacity-25 bg-cover bg-center"
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fbbf24'%3E%3Ccircle cx='30' cy='30' r='5' fill-opacity='0.4'/%3E%3Ccircle cx='120' cy='50' r='8' fill-opacity='0.3'/%3E%3Ccircle cx='70' cy='100' r='6' fill-opacity='0.38'/%3E%3Ccircle cx='150' cy='120' r='5' fill-opacity='0.28'/%3E%3Ccircle cx='40' cy='160' r='9' fill-opacity='0.45'/%3E%3Ccircle cx='110' cy='180' r='6' fill-opacity='0.3'/%3E%3Ccircle cx='180' cy='70' r='8' fill-opacity='0.4'/%3E%3Ccircle cx='90' cy='30' r='6' fill-opacity='0.38'/%3E%3Ccircle cx='25' cy='140' r='10' fill-opacity='0.28'/%3E%3Ccircle cx='160' cy='30' r='6' fill-opacity='0.32'/%3E%3Ccircle cx='50' cy='50' r='8' fill-opacity='0.4'/%3E%3Ccircle cx='140' cy='80' r='9' fill-opacity='0.3'/%3E%3Ccircle cx='90' cy='160' r='6' fill-opacity='0.38'/%3E%3Ccircle cx='70' cy='55' r='8' fill-opacity='0.28'/%3E%3Ccircle cx='130' cy='170' r='6' fill-opacity='0.32'/%3E%3Ccircle cx='20' cy='50' r='5' fill-opacity='0.38'/%3E%3Ccircle cx='160' cy='150' r='8' fill-opacity='0.45'/%3E%3Ccircle cx='110' cy='70' r='9' fill-opacity='0.38'/%3E%3Ccircle cx='180' cy='140' r='6' fill-opacity='0.32'/%3E%3Ccircle cx='50' cy='130' r='9' fill-opacity='0.38'/%3E%3Ccircle cx='135' cy='90' r='6' fill-opacity='0.3'/%3E%3Ccircle cx='75' cy='160' r='8' fill-opacity='0.3'/%3E%3Ccircle cx='155' cy='80' r='9' fill-opacity='0.28'/%3E%3Ccircle cx='120' cy='130' r='8' fill-opacity='0.38'/%3E%3Ccircle cx='60' cy='40' r='5' fill-opacity='0.3'/%3E%3Ccircle cx='100' cy='50' r='6' fill-opacity='0.32'/%3E%3Ccircle cx='140' cy='110' r='9' fill-opacity='0.28'/%3E%3Ccircle cx='30' cy='80' r='8' fill-opacity='0.32'/%3E%3C/g%3E%3C/svg%3E")`,
                                                }}
                                            />
                                            {/* Gold accent lines top & bottom */}
                                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
                                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
                                            {/* Soft gold glow blobs */}
                                            <div className="absolute -top-8 -right-8 w-28 h-28 bg-yellow-400/10 rounded-full blur-2xl" />
                                            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl" />
                                            {/* Inner frame */}
                                            <div className="absolute inset-2 sm:inset-3 border border-yellow-400/15 rounded-xl pointer-events-none" />
                                        </>
                                    ) : (
                                        <div className='absolute inset-0 bg-[url("/images/patterns/contour.svg")] bg-cover z-0 opacity-30'></div>
                                    )}
                                    <div className="absolute inset-0 flex flex-col justify-between items-center p-3 sm:p-4">
                                        <div className="text-center mt-1 sm:mt-2">
                                            <h3 className={`text-sm sm:text-lg font-bold ${isGaleriMaduku ? 'text-yellow-400' : 'text-white'}`}>{t(`${category.key}.title`)}</h3>
                                            <p className={`text-[10px] sm:text-sm mt-0.5 ${isGaleriMaduku ? 'text-yellow-400/60' : 'text-white/70'}`}>{t(`${category.key}.subtitle`)}</p>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                                            <Image
                                                src={category.icon}
                                                alt={t(`${category.key}.title`)}
                                                width={70}
                                                height={70}
                                                className={`object-contain mb-[-7px] sm:mb-[-12px] md:mb-[-15px] w-[70px] sm:w-[130px] md:w-[170px] transition-transform duration-500 group-hover:scale-110 ${isGaleriMaduku ? '-translate-x-[6%] drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'drop-shadow-lg'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
