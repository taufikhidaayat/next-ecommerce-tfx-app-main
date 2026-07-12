'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
    threshold?: number;
    rootMargin?: string;
    once?: boolean;
}

// Hook animasi "muncul saat di-scroll": elemen jadi terlihat (isVisible=true) begitu
// masuk area layar. Dipakai untuk efek fade-in bagian halaman ketika pengguna menggulir.
// Memakai IntersectionObserver (deteksi elemen masuk viewport) + pengecekan manual
// sebagai cadangan untuk kasus layout yang berubah setelah data selesai dimuat.
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
    options: ScrollRevealOptions = {}
) {
    const { threshold = 0.15, rootMargin = '0px 0px -50px 0px', once = true } = options;
    const ref = useRef<T>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Cek langsung: kalau elemen sudah di viewport saat mount, langsung tampilkan.
        // Mencegah race condition saat client-side navigation + layout shift
        // (mis. banner data masih loading) yang bikin IntersectionObserver miss timing-nya.
        const checkInitialVisibility = () => {
            const rect = element.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            const isInViewport = rect.top < viewportHeight && rect.bottom > 0;
            if (isInViewport) {
                setIsVisible(true);
                return true;
            }
            return false;
        };

        if (checkInitialVisibility() && once) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) {
                        observer.unobserve(element);
                    }
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        // Re-check setelah layout settle (mis. banner data baru selesai load)
        // untuk menangkap kasus dimana elemen masuk viewport karena layout shift
        // tapi observer miss timing-nya.
        const settleTimeout = window.setTimeout(() => {
            if (checkInitialVisibility() && once) {
                observer.disconnect();
            }
        }, 150);

        return () => {
            window.clearTimeout(settleTimeout);
            observer.disconnect();
        };
    }, [threshold, rootMargin, once]);

    return { ref, isVisible };
}
