"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/client/axios-client";
import { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { HiSpeakerphone } from "react-icons/hi";

interface Announcement {
    id: string;
    title: string;
    content: string;
}

interface AnnouncementsResponse {
    status: string;
    message: string;
    data: Announcement[];
}

export default function AnnouncementBar() {
    const [dismissed, setDismissed] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [overflowing, setOverflowing] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLSpanElement>(null);

    const { data, isLoading } = useQuery<AnnouncementsResponse>({
        queryKey: ["active-announcements"],
        queryFn: async () => {
            const response = await apiClient.get<AnnouncementsResponse>("/announcements");
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const announcements = data?.data || [];

    useEffect(() => {
        if (announcements.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % announcements.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [announcements.length]);

    // Deteksi apakah teks melebihi lebar yang tersedia. Kalau ya → jalan (marquee);
    // kalau muat (mis. di desktop) → diam. Diukur ulang saat konten/ukuran berubah.
    useEffect(() => {
        const measure = () => {
            const c = containerRef.current;
            const m = measureRef.current;
            if (!c || !m) return;
            setOverflowing(m.scrollWidth > c.clientWidth + 1);
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (containerRef.current) ro.observe(containerRef.current);
        window.addEventListener("resize", measure);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [currentIndex, announcements]);

    if (dismissed || isLoading || announcements.length === 0) return null;

    const current = announcements[currentIndex];

    const inner = (
        <>
            <span className="font-semibold">{current.title}</span>
            <span className="mx-1.5 text-white/50">|</span>
            <span className="text-white/90">{current.content}</span>
        </>
    );

    return (
        <div className="w-full overflow-hidden bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 text-white shadow-sm">
            <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="flex-shrink-0 bg-white/15 rounded-full p-1.5">
                        <HiSpeakerphone className="text-white text-xs" />
                    </div>
                    <div ref={containerRef} className="relative flex-1 min-w-0 overflow-hidden">
                        {/* Pengukur tersembunyi: deteksi apakah teks melebihi lebar tersedia */}
                        <span
                            ref={measureRef}
                            aria-hidden
                            className="invisible absolute whitespace-nowrap text-[13px] leading-snug"
                        >
                            {inner}
                        </span>

                        {overflowing ? (
                            // Teks kepanjangan (mis. di mobile) → jalan. Dua salinan agar mulus.
                            <div className="flex w-max whitespace-nowrap text-[13px] leading-snug animate-marquee motion-reduce:animate-none hover:[animation-play-state:paused]">
                                <span className="pr-12">{inner}</span>
                                <span className="pr-12" aria-hidden>{inner}</span>
                            </div>
                        ) : (
                            <p className="text-[13px] leading-snug truncate">{inner}</p>
                        )}
                    </div>
                    {announcements.length > 1 && (
                        <div className="flex-shrink-0 flex items-center gap-1 ml-2">
                            {announcements.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                        i === currentIndex
                                            ? "bg-white w-4"
                                            : "bg-white/40 hover:bg-white/60"
                                    }`}
                                    aria-label={`Pengumuman ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="flex-shrink-0 text-white/60 hover:text-white p-1 rounded-full hover:bg-white/15 transition"
                    aria-label="Tutup pengumuman"
                >
                    <FaTimes className="text-xs" />
                </button>
            </div>
        </div>
    );
}
