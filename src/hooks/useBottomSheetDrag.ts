"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type Options = {
    isOpen: boolean;
    onClose: () => void;
    /** Return false to block dismiss-by-drag (e.g. while submitting). */
    canClose?: () => boolean;
    /** Sheet height as a fraction of the viewport on mobile. Default 0.92. */
    sheetVh?: number;
};

/**
 * Perilaku "bottom sheet" (panel yang muncul dari bawah layar) untuk modal di HP,
 * rasanya sama seperti panel keranjang & bukti bayar:
 * - Muncul meluncur dari bawah saat dibuka (digerakkan JS agar tidak bentrok dengan drag).
 * - Seret gagang/header ke bawah untuk menutup.
 * - Bisa ditarik-tutup dari isi panel saat sudah di-scroll paling atas.
 *
 * Cara pakai: sambungkan `sheetRef`/`sheetStyle` ke wadah panel, `bodyRef` ke area isi
 * yang bisa di-scroll, dan sebar `dragHandlers` ke area gagang yang bisa diseret.
 */
export function useBottomSheetDrag({ isOpen, onClose, canClose, sheetVh = 0.92 }: Options) {
    const [isMobile, setIsMobile] = useState(false);
    const [viewportH, setViewportH] = useState(0);
    const [translateY, setTranslateY] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const currentTranslateRef = useRef(0);
    const dragStartRef = useRef<{ startY: number; startTranslate: number } | null>(null);
    const rafIdRef = useRef(0);
    const sheetRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);
    const hasEnteredRef = useRef(false);
    const onCloseRef = useRef(onClose);
    const canCloseRef = useRef<() => boolean>(() => true);
    onCloseRef.current = onClose;
    canCloseRef.current = canClose ?? (() => true);

    useEffect(() => {
        const update = () => {
            setIsMobile(window.innerWidth < 640);
            setViewportH(window.innerHeight);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    // JS-driven entrance (mobile): posisikan off-screen lalu slide ke 0.
    useEffect(() => {
        if (!isOpen || !isMobile || hasEnteredRef.current) return;
        hasEnteredRef.current = true;
        const ih = window.innerHeight;
        setIsDragging(true);
        setTranslateY(ih);
        currentTranslateRef.current = ih;
        const id = window.setTimeout(() => {
            setIsDragging(false);
            setTranslateY(0);
            currentTranslateRef.current = 0;
        }, 30);
        return () => window.clearTimeout(id);
    }, [isMobile, isOpen]);

    // Reset agar animasi masuk berjalan lagi saat dibuka kembali.
    useEffect(() => {
        if (!isOpen) {
            hasEnteredRef.current = false;
            setTranslateY(null);
            currentTranslateRef.current = 0;
        }
    }, [isOpen]);

    // Pull-to-dismiss dari area konten: hanya aktif saat scroll di paling atas lalu ditarik ke bawah.
    useEffect(() => {
        const el = bodyRef.current;
        if (!isOpen || !isMobile || !el) return;

        let state: { startY: number; active: boolean } | null = null;

        const onStart = (e: TouchEvent) => {
            state = { startY: e.touches[0].clientY, active: false };
        };
        const onMove = (e: TouchEvent) => {
            if (!state) return;
            const atTop = el.scrollTop <= 0;
            if (!state.active) {
                const delta = e.touches[0].clientY - state.startY;
                if (atTop && delta > 0) {
                    state.active = true;
                    state.startY = e.touches[0].clientY;
                    setIsDragging(true);
                } else {
                    return;
                }
            }
            let next = e.touches[0].clientY - state.startY;
            if (next < 0) next = 0;
            e.preventDefault();
            currentTranslateRef.current = next;
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = requestAnimationFrame(() => {
                if (sheetRef.current) sheetRef.current.style.transform = `translateY(${next}px)`;
            });
        };
        const onEnd = () => {
            if (state?.active) {
                cancelAnimationFrame(rafIdRef.current);
                setIsDragging(false);
                const cur = currentTranslateRef.current;
                if (cur > window.innerHeight * 0.25 && canCloseRef.current()) {
                    onCloseRef.current();
                } else {
                    setTranslateY(0);
                    currentTranslateRef.current = 0;
                    if (sheetRef.current) {
                        sheetRef.current.style.transition = "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)";
                        sheetRef.current.style.transform = "translateY(0px)";
                    }
                }
            }
            state = null;
        };

        el.addEventListener("touchstart", onStart, { passive: true });
        el.addEventListener("touchmove", onMove, { passive: false });
        el.addEventListener("touchend", onEnd, { passive: true });
        return () => {
            cancelAnimationFrame(rafIdRef.current);
            el.removeEventListener("touchstart", onStart);
            el.removeEventListener("touchmove", onMove);
            el.removeEventListener("touchend", onEnd);
        };
    }, [isMobile, isOpen]);

    const beginDrag = (clientY: number) => {
        if (!isMobile) return;
        cancelAnimationFrame(rafIdRef.current);
        setIsDragging(true);
        dragStartRef.current = { startY: clientY, startTranslate: currentTranslateRef.current };
    };

    const moveDrag = (clientY: number) => {
        if (!isMobile || !dragStartRef.current) return;
        const raw = dragStartRef.current.startTranslate + (clientY - dragStartRef.current.startY);
        const baseH = (viewportH || window.innerHeight) * sheetVh;
        // Ke bawah → geser sheet turun (gestur tutup). Ke atas (melewati posisi diam)
        // → JANGAN geser ke atas (biar dasar sheet tetap nempel di bawah); cukup
        // tumbuhkan tinggi sheet sedikit secara elastis (teredam & dibatasi), lalu
        // mantul balik di endDrag, meniru rubber-band keranjang tanpa bikin celah.
        const translate = raw > 0 ? raw : 0;
        const grow = raw < 0 ? Math.min(-raw * 0.2, 48) : 0;
        currentTranslateRef.current = translate;
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
            const el = sheetRef.current;
            if (!el) return;
            el.style.transform = `translateY(${translate}px)`;
            el.style.height = `${baseH + grow}px`;
        });
    };

    const endDrag = () => {
        if (!isMobile || !dragStartRef.current) return;
        // Batalkan frame drag yang masih pending supaya tidak menimpa posisi mantul-balik
        // di bawah (penyebab sheet "berhenti sendiri" / nyangkut saat jari dilepas).
        cancelAnimationFrame(rafIdRef.current);
        dragStartRef.current = null;
        setIsDragging(false);
        const cur = currentTranslateRef.current;
        if (cur > window.innerHeight * 0.25 && canCloseRef.current()) {
            onCloseRef.current();
        } else {
            setTranslateY(0);
            currentTranslateRef.current = 0;
            const el = sheetRef.current;
            if (el) {
                const baseH = (viewportH || window.innerHeight) * sheetVh;
                el.style.transition =
                    "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1), height 0.32s cubic-bezier(0.32, 0.72, 0, 1)";
                el.style.transform = "translateY(0px)";
                el.style.height = `${baseH}px`; // mantul balik dari elastic-grow
            }
        }
    };

    const sheetStyle: CSSProperties = isMobile
        ? {
            height: (viewportH || (typeof window !== "undefined" ? window.innerHeight : 0)) * sheetVh,
            transform: translateY !== null ? `translateY(${translateY}px)` : undefined,
            transition: isDragging
                ? "none"
                : "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1), height 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
            willChange: "transform, height",
        }
        : {};

    const dragHandlers = {
        onTouchStart: (e: React.TouchEvent) => beginDrag(e.touches[0].clientY),
        onTouchMove: (e: React.TouchEvent) => moveDrag(e.touches[0].clientY),
        onTouchEnd: endDrag,
    };

    return { isMobile, sheetRef, bodyRef, sheetStyle, dragHandlers };
}
