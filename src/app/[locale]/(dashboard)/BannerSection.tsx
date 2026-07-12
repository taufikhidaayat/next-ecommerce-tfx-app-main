'use client';

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Banner } from "@/types/banner/banner";

type BannerSectionProps = {
    banners?: Banner[];
    isPending?: boolean;
};

type StaticSlide = {
    bgImage: string;
    innerBg: string;
    heroImage: string;
    glowColor: string;
    type: 'static';
    variant: 'default' | 'galeri-maduku';
};

type DynamicSlide = {
    bgImage: string;
    innerBg: string;
    heroImage: string;
    glowColor: string;
    type: 'dynamic';
    link: string;
    name: string;
    description: string;
};

type Slide = StaticSlide | DynamicSlide;

const STATIC_SLIDE: StaticSlide = {
    bgImage: '/images/background-banner-background.jpg',
    innerBg: '/images/banner-background.jpg',
    heroImage: '/images/banner.png',
    glowColor: 'bg-green-500',
    type: 'static',
    variant: 'default',
};

const GALERI_MADUKU_SLIDE: StaticSlide = {
    bgImage: '/images/background-banner-background.jpg',
    innerBg: '/images/banner-background.jpg',
    heroImage: '/images/madukucarousel.png',
    glowColor: 'bg-yellow-400',
    type: 'static',
    variant: 'galeri-maduku',
};

const GLOW_COLORS = ['bg-orange-400', 'bg-emerald-400', 'bg-violet-400'];

const SLIDE_MS = 3500; // auto-advance interval; the active dot fills over this time

// Slide 1: desain asli web (sama persis seperti banner awal sebelum ada carousel).
function OriginalSlide({ isTransitioning, t }: { isTransitioning: boolean; t: (key: string) => string }) {
    return (
        <div className="group bg-white rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 flex flex-row sm:flex-col md:flex-row items-center justify-start sm:justify-center md:justify-start gap-3 sm:gap-6 md:gap-12 transform relative overflow-hidden h-[180px] sm:h-[340px] md:h-[380px]">
            {/* transform wajib ada agar CSS stacking context terbentuk → -z-10 background tampil */}
            <div
                className="absolute inset-0 -z-10"
                style={{
                    backgroundImage: 'url("/images/banner-background.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.7,
                }}
            />

            {/* Text Section */}
            <div
                className="w-3/5 sm:w-full md:w-1/2 min-w-0 text-left sm:text-center md:text-left text-gray-800 z-10 transition-all duration-500"
                style={{
                    opacity: isTransitioning ? 0 : 1,
                    transform: isTransitioning ? 'translateY(16px)' : 'translateY(0)',
                }}
            >
                <p className="bg-green-700 px-2 py-0.5 sm:px-4 sm:py-1 inline-block max-w-full truncate rounded-full text-[8px] sm:text-sm mb-1 sm:mb-4 shadow-md text-white">
                    {t("badge")}
                </p>
                <h1 className="text-[15px] sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-1 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                    {t("title")}
                </h1>
                <p className="text-[10px] leading-snug sm:text-lg mb-2 sm:mb-6 text-gray-600 line-clamp-2 sm:line-clamp-none">
                    {t("description")}
                </p>
                <Link
                    href="/products"
                    className="group/cta bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1 sm:px-6 sm:py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 focus:ring-2 sm:focus:ring-4 focus:ring-orange-300 inline-flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-base"
                >
                    {t("cta")}
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover/cta:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>

            {/* Image Section */}
            <div
                className="w-2/5 sm:w-full md:w-1/2 relative z-10 shrink-0 flex justify-center transition-all duration-500"
                style={{
                    opacity: isTransitioning ? 0 : 1,
                    transform: isTransitioning ? 'scale(0.9)' : 'scale(1)',
                }}
            >
                <div className="absolute inset-0 flex justify-center items-center -z-10">
                    <div className="bg-green-500 opacity-60 rounded-full blur-3xl w-28 h-28 sm:w-96 sm:h-96" />
                </div>
                <Image
                    src="/images/banner.png"
                    alt={t("imageAlt")}
                    width={180}
                    height={180}
                    className="w-full max-w-[90px] sm:max-w-xs mx-auto rounded-2xl transition-transform duration-500 sm:group-hover:scale-110"
                />
            </div>
        </div>
    );
}

function GaleriMadukuSlide({ isTransitioning, t }: { isTransitioning: boolean; t: (key: string) => string }) {
    return (
        <div className="group rounded-3xl shadow-xl flex flex-row sm:flex-col md:flex-row relative overflow-hidden h-[180px] sm:h-[340px] md:h-[380px] bg-white">
            {/* Left: Product showcase stage with radial gold backdrop */}
            <div
                className="w-2/5 sm:w-full md:w-[45%] relative flex items-center justify-center p-2 sm:p-10 md:p-12 transition-all duration-500 overflow-hidden shrink-0"
                style={{
                    background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.25) 0%, rgba(251, 191, 36, 0.10) 40%, rgba(255, 255, 255, 0) 75%)',
                    opacity: isTransitioning ? 0 : 1,
                    transform: isTransitioning ? 'scale(0.9)' : 'scale(1)',
                }}
            >
                {/* Bold solid amber circle stage */}
                <div className="absolute w-24 h-24 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-amber-100 to-amber-200/60" />

                {/* Thin decorative ring */}
                <div className="absolute w-28 h-28 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full border border-amber-300/50" />

                {/* Product image */}
                <Image
                    src="/images/madukucarousel.png"
                    alt="Galeri Maduku"
                    width={649}
                    height={675}
                    className="relative z-10 w-full max-w-[90px] sm:max-w-[220px] md:max-w-[260px] object-contain drop-shadow-[0_20px_40px_rgba(180,120,20,0.3)] transition-transform duration-500 sm:group-hover:scale-110"
                />

                {/* Floating product label tag */}
                <div className="absolute bottom-2 sm:bottom-8 right-2 sm:right-8 bg-white px-2 py-1 sm:px-4 sm:py-2 rounded-full shadow-lg border border-amber-100 flex items-center gap-1 sm:gap-2">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[9px] sm:text-xs font-semibold text-gray-700">Premium</span>
                </div>
            </div>

            {/* Vertical divider with gold accent */}
            <div className="hidden md:block absolute left-[45%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-px h-3/4 bg-gradient-to-b from-transparent via-amber-200 to-transparent" />

            {/* Right: Content section */}
            <div
                className="w-3/5 sm:w-full md:w-[55%] flex-1 min-h-0 flex flex-col justify-center px-3 py-2 sm:px-8 sm:py-10 md:px-12 md:py-12 text-left sm:text-center md:text-left transition-all duration-500 relative"
                style={{
                    opacity: isTransitioning ? 0 : 1,
                    transform: isTransitioning ? 'translateX(16px)' : 'translateX(0)',
                }}
            >
                {/* Brand text watermark, editorial style */}
                <div className="hidden sm:block absolute top-1 right-4 sm:top-2 sm:right-6 text-amber-500/20 text-3xl sm:text-5xl font-black tracking-tighter select-none pointer-events-none italic">
                    MADUKU
                </div>

                {/* Category label with line */}
                <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-5 justify-start sm:justify-center md:justify-start">
                    <span className="w-5 sm:w-10 h-px bg-amber-500" />
                    <span className="text-amber-600 text-[9px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.25em] uppercase">
                        {t("galeriMaduku.badge")}
                    </span>
                </div>

                <h1 className="text-[15px] sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight sm:leading-[1.05] tracking-tight mb-1 sm:mb-4 text-gray-900 line-clamp-2 sm:line-clamp-none">
                    {t("galeriMaduku.title").split("Galeri Maduku").map((part, i, arr) =>
                        i < arr.length - 1 ? (
                            <span key={i}>
                                {part}
                                <span className="italic font-serif bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">Galeri Maduku</span>
                            </span>
                        ) : (
                            <span key={i}>{part}</span>
                        )
                    )}
                </h1>

                <p className="text-[10px] sm:text-base mb-2 sm:mb-7 text-gray-500 leading-snug sm:leading-relaxed max-w-md mx-0 sm:mx-auto md:mx-0 line-clamp-2 sm:line-clamp-none">
                    {t("galeriMaduku.description")}
                </p>

                <div className="flex items-center gap-3 sm:gap-4 justify-start sm:justify-center md:justify-start">
                    <Link
                        href="/products?category=galeri maduku"
                        className="group/cta inline-flex items-center gap-2 bg-gray-900 hover:bg-amber-600 text-white px-3 py-1.5 sm:px-6 sm:py-3 rounded-full font-semibold text-[11px] sm:text-base transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-amber-500/30"
                    >
                        {t("galeriMaduku.cta")}
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover/cta:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>

                    {/* Decorative dots */}
                    <div className="hidden sm:flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-200" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DefaultSlide({ slide, isTransitioning, t }: { slide: Slide; isTransitioning: boolean; t: (key: string) => string }) {
    return (
        <div className="group bg-white rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 flex flex-row sm:flex-col md:flex-row items-center justify-start sm:justify-center md:justify-start gap-3 sm:gap-6 md:gap-12 relative overflow-hidden h-[180px] sm:h-[340px] md:h-[380px]">
            {/* Background */}
            <div
                className="absolute inset-0 -z-10 transition-opacity duration-500"
                style={{
                    backgroundImage: `url("${slide.innerBg}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.7,
                }}
            />

            {/* Text Section */}
            <div
                className="w-3/5 sm:w-full md:w-1/2 min-w-0 text-left sm:text-center md:text-left text-gray-800 z-10 transition-all duration-500"
                style={{
                    opacity: isTransitioning ? 0 : 1,
                    transform: isTransitioning ? 'translateY(16px)' : 'translateY(0)',
                }}
            >
                <p className="bg-green-700 px-2 py-0.5 sm:px-4 sm:py-1 inline-block max-w-full truncate rounded-full text-[8px] sm:text-sm mb-1 sm:mb-4 shadow-md text-white">
                    {t("badge")}
                </p>
                <h1 className="text-[15px] sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-1 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                    {slide.type === 'dynamic' && slide.name ? slide.name : t("title")}
                </h1>
                <p className="text-[10px] leading-snug sm:text-lg mb-2 sm:mb-6 text-gray-600 line-clamp-2 sm:line-clamp-none">
                    {slide.type === 'dynamic' && slide.description ? slide.description : t("description")}
                </p>
                <Link
                    href={slide.type === 'dynamic' && slide.link ? slide.link : "/products"}
                    className="group/cta bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1 sm:px-6 sm:py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 focus:ring-2 sm:focus:ring-4 focus:ring-orange-300 inline-flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-base"
                >
                    {t("cta")}
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover/cta:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>

            {/* Image Section */}
            <div
                className="w-2/5 sm:w-full md:w-1/2 relative z-10 shrink-0 flex justify-center transition-all duration-500"
                style={{
                    opacity: isTransitioning ? 0 : 1,
                    transform: isTransitioning ? 'scale(0.9)' : 'scale(1)',
                }}
            >
                <div className="absolute inset-0 flex justify-center items-center -z-10">
                    <div className={`${slide.glowColor} opacity-50 rounded-full blur-3xl w-28 h-28 sm:w-96 sm:h-96 transition-colors duration-700`} />
                </div>
                <Image
                    src={slide.heroImage}
                    alt={slide.type === 'dynamic' && slide.name ? slide.name : t("imageAlt")}
                    width={180}
                    height={180}
                    className="w-full max-w-[90px] sm:max-w-xs mx-auto rounded-2xl transition-transform duration-500 sm:group-hover:scale-110"
                />
            </div>
        </div>
    );
}

// Banner utama di paling atas beranda berupa CAROUSEL (slider) yang berganti otomatis.
// `current` = indeks slide yang sedang tampil; isTransitioning menjaga animasi geser
// tidak tumpang-tindih. Bisa digeser manual dan otomatis maju setiap beberapa detik.
export default function BannerSection({ banners = [] }: BannerSectionProps) {
    const t = useTranslations("home.banner");
    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Slide 1: statis default (desain asli), Slide 2: Galeri Maduku, Slide 3+: dari API (banner index 6, 7, dst.)
    const slides = useMemo(() => {
        const dynamicBanners = banners.slice(6, 8);
        const dynamicSlides: DynamicSlide[] = dynamicBanners.map((banner, i) => ({
            bgImage: '/images/background-banner-background.jpg',
            innerBg: '/images/banner-background.jpg',
            heroImage: banner.url,
            glowColor: GLOW_COLORS[i % GLOW_COLORS.length],
            type: 'dynamic',
            link: banner.path || '/products',
            name: banner.name,
            description: banner.description,
        }));
        return [STATIC_SLIDE, GALERI_MADUKU_SLIDE, ...dynamicSlides] as Slide[];
    }, [banners]);

    const goTo = useCallback((index: number) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrent(index);
        setTimeout(() => setIsTransitioning(false), 600);
    }, [isTransitioning]);

    // Swipe-to-change (mobile): a clear horizontal flick advances/rewinds without
    // waiting for the auto-slide. Diagonal/vertical gestures are left to the page
    // scroll (and the pull-to-refresh).
    const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
    const onSwipeStart = (e: React.TouchEvent) => {
        swipeStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onSwipeEnd = (e: React.TouchEvent) => {
        const start = swipeStartRef.current;
        swipeStartRef.current = null;
        if (!start || slides.length <= 1) return;
        const dx = e.changedTouches[0].clientX - start.x;
        const dy = e.changedTouches[0].clientY - start.y;
        if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return; // not a clear horizontal swipe
        if (dx < 0) goTo((current + 1) % slides.length);
        else goTo((current - 1 + slides.length) % slides.length);
    };

    // Auto-advance: a self-arming timer that resets on every slide change (manual
    // or auto). Each slide is shown for exactly SLIDE_MS, so the active dot's fill
    // bar (same duration, keyed on `current`) completes right as it advances.
    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setTimeout(() => {
            setIsTransitioning(true);
            setCurrent((c) => (c + 1) % slides.length);
            setTimeout(() => setIsTransitioning(false), 600);
        }, SLIDE_MS);
        return () => clearTimeout(timer);
    }, [current, slides.length]);

    const slide = slides[current];

    let slideContent;
    if (slide.type === 'static' && slide.variant === 'galeri-maduku') {
        slideContent = <GaleriMadukuSlide isTransitioning={isTransitioning} t={t} />;
    } else if (slide.type === 'static' && slide.variant === 'default') {
        slideContent = <OriginalSlide isTransitioning={isTransitioning} t={t} />;
    } else {
        slideContent = <DefaultSlide slide={slide} isTransitioning={isTransitioning} t={t} />;
    }

    return (
        <>
            <section className="relative w-full overflow-hidden text-white py-1 sm:py-5 sm:px-0 rounded-3xl bg-[url('/images/background-banner-background.jpg')] bg-cover bg-center">
                <div
                    className="w-full max-w-full mx-auto sm:px-6 lg:px-16"
                    onTouchStart={onSwipeStart}
                    onTouchEnd={onSwipeEnd}
                >
                    {slideContent}

                    {/* Dots, desktop only (inside green section) */}
                    {slides.length > 1 && (
                        <div className="hidden sm:flex justify-center gap-2 mt-4">
                            {slides.map((_, idx) => {
                                const isActive = idx === current;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => goTo(idx)}
                                        className={`relative h-2 overflow-hidden rounded-full transition-all duration-300 ${
                                            isActive
                                                ? 'w-12 bg-white/40'
                                                : 'w-2 bg-white/50 hover:bg-white/70'
                                        }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    >
                                        {isActive && (
                                            <span
                                                key={current}
                                                className="absolute inset-y-0 left-0 block rounded-full bg-white"
                                                style={{ width: 0, animation: `dotProgress ${SLIDE_MS}ms linear forwards` }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Dots, mobile only (outside green section) */}
            {slides.length > 1 && (
                <div className="flex sm:hidden justify-center gap-2 mt-3">
                    {slides.map((_, idx) => {
                        const isActive = idx === current;
                        return (
                            <button
                                key={idx}
                                onClick={() => goTo(idx)}
                                className={`relative h-2 overflow-hidden rounded-full transition-all duration-300 ${
                                    isActive
                                        ? 'w-12 bg-emerald-500/25'
                                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            >
                                {isActive && (
                                    <span
                                        key={current}
                                        className="absolute inset-y-0 left-0 block rounded-full bg-emerald-500"
                                        style={{ width: 0, animation: `dotProgress ${SLIDE_MS}ms linear forwards` }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </>
    );
}
