'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { BiChevronDown } from "react-icons/bi";
import { Banner } from "@/types/banner/banner";
import FAQImageSkeleton from "@/components/skeletons/dashboard/FAQImageSkeleton";
import StoreLocationCard from "@/components/maps/StoreLocationCard";
import { DEFAULT_BANNER_FAQ } from "@/lib/constant";
import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/utils/useScrollReveal";

type FAQSectionProps = {
    banners?: Banner[];
    isPending?: boolean;
};

function AccordionItem({ question, answer, isOpen, onToggle }: {
    question: string;
    answer: string;
    isOpen: boolean;
    onToggle: () => void;
}) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [maxHeight, setMaxHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            setMaxHeight(isOpen ? contentRef.current.scrollHeight : 0);
        }
    }, [isOpen]);

    return (
        <div className="border-b border-gray-200 last:border-b-0">
            <button
                className="flex justify-between items-center w-full text-left py-3 sm:py-5 text-base sm:text-lg font-semibold focus-visible:outline-none group"
                onClick={onToggle}
            >
                <span className="font-semibold text-green-900 group-hover:text-green-700 transition-colors pr-4">
                    {question}
                </span>
                <span className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'bg-green-700 rotate-180' : 'bg-gray-100 rotate-0'
                }`}>
                    <BiChevronDown className={`transition-colors duration-300 ${
                        isOpen ? 'text-white' : 'text-gray-500'
                    }`} size={20} />
                </span>
            </button>
            <div
                ref={contentRef}
                className="overflow-hidden transition-all duration-350"
                style={{
                    maxHeight: `${maxHeight}px`,
                    opacity: isOpen ? 1 : 0,
                    transition: 'max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
                }}
            >
                <div className="pl-2 sm:pl-4 pb-3 sm:pb-5 text-gray-600 text-sm sm:text-base leading-relaxed">
                    <p>{answer}</p>
                </div>
            </div>
        </div>
    );
}

// Bagian "FAQ" (tanya-jawab) di beranda: daftar pertanyaan yang bisa dibuka-tutup (accordion).
export default function FAQSection({ banners = [], isPending = false }: FAQSectionProps) {
    const t = useTranslations("home.faq");
    const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set([0]));
    const { ref: imageRef, isVisible: imageVisible } = useScrollReveal({ threshold: 0.2 });
    const { ref: listRef, isVisible: listVisible } = useScrollReveal({ threshold: 0.2 });

    const faqData = t.raw("items") as { question: string; answer: string }[];

    const handleToggle = useCallback((index: number) => {
        setActiveIndices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }, []);

    const imageSrc = banners?.[5]?.url || DEFAULT_BANNER_FAQ;
    const imageAlt = banners?.[5]?.name || "FAQ Image";

    return (
        <section className="w-full px-2 sm:px-4">
            <div className="container mx-auto flex flex-col lg:flex-row items-start gap-6 sm:gap-12">
                {/* Left Image */}
                <div
                    ref={imageRef}
                    className={`scroll-reveal-left ${imageVisible ? 'visible' : ''} relative flex-shrink-0 w-full lg:w-[40%] flex flex-col mb-2 lg:mb-0`}
                >
                    {isPending ? (
                        <FAQImageSkeleton />
                    ) : (
                        <div className="relative w-full h-auto bg-white rounded-2xl shadow-lg overflow-hidden group">
                            <Image
                                src={imageSrc}
                                alt={imageAlt}
                                width={300}
                                height={320}
                                className="w-full h-auto max-h-64 sm:max-h-[420px] object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                        </div>
                    )}

                    {/* Store location, auto-syncs with coordinates from Store Settings */}
                    <StoreLocationCard />
                </div>

                {/* FAQ List */}
                <div
                    ref={listRef}
                    className={`scroll-reveal-right ${listVisible ? 'visible' : ''} w-full lg:w-[60%]`}
                >
                    <div className="mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-3xl font-extrabold text-green-800 mb-1 sm:mb-2">
                            FAQ
                        </h2>
                        <p className="text-sm sm:text-base text-gray-500">
                            Pertanyaan yang sering diajukan
                        </p>
                    </div>
                    <div className="space-y-0 text-green-900 bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-gray-100">
                        {faqData.map((faq, idx) => (
                            <AccordionItem
                                key={idx}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={activeIndices.has(idx)}
                                onToggle={() => handleToggle(idx)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
