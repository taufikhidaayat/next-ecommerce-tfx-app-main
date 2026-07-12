'use client';

import Navbar from "@/components/ui/layout/Navbar";
import BannerSection from "./BannerSection";
import PromotionsSection from "./PromotionSection";
import ProductSection from "./ProductSection";
import OfferSection from "./OfferSection";
import BrandSection from "./BrandSection";
import FAQSection from "./FAQSection";
import CategorySection from "./CategorySection";
import Footer from "@/components/ui/layout/Footer";
import { useBanners } from "@/satelite/services/bannerService";
import { useScrollReveal } from "@/utils/useScrollReveal";

function RevealSection({ children, className = "scroll-reveal", id }: {
    children: React.ReactNode;
    className?: string;
    id?: string;
}) {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
    return (
        <div ref={ref} className={`${className} ${isVisible ? 'visible' : ''}`} id={id}>
            {children}
        </div>
    );
}

// Penyusun isi beranda toko: mengambil data banner sekali di sini, lalu merangkai
// semua bagian (banner, kategori, brand, produk, promo, penawaran, FAQ) berurutan.
export default function DashboardWrapper() {

    const { data: banners, isPending } = useBanners({
        mediaType: 'Banner',
    });

    return (
        <div className="flex flex-col gap-6 sm:gap-10">
            <Navbar />
            <div className="-mt-3 sm:-mt-6">
                <BannerSection banners={banners?.data} isPending={isPending} />
            </div>

            <RevealSection id="categories">
                <CategorySection />
            </RevealSection>

            <PromotionsSection
                banners={banners?.data}
                isPending={isPending}
            />

            <div id="products">
                <ProductSection />
            </div>

            <RevealSection className="scroll-reveal-scale">
                <OfferSection
                    banners={banners?.data}
                    isPending={isPending}
                />
            </RevealSection>

            <RevealSection id="brands">
                <BrandSection />
            </RevealSection>

            <RevealSection id="faqs">
                <FAQSection
                    banners={banners?.data}
                    isPending={isPending}
                />
            </RevealSection>

            <Footer />
        </div>
    )
}
