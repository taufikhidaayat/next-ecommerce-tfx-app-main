"use client";

import { useEffect, useState } from "react";
import { LuChevronsUp } from "react-icons/lu";

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Kembali ke atas"
            className={`fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/70 text-gray-800 shadow-lg backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 active:scale-95 md:bottom-6 md:right-6 ${
                visible
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-3 opacity-0"
            }`}
        >
            <LuChevronsUp className="text-[22px]" />
        </button>
    );
}
