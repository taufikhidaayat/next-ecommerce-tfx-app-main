import { useEffect } from "react";

// Reference-counted supaya modal bertumpuk (mis. cart + checkout di atasnya)
// tidak saling menimpa style <body>. Tanpa ini: cart mengunci, checkout mengunci
// lagi, lalu checkout ditutup → position di-reset "" padahal cart masih terbuka →
// kunci scroll "bocor". Dengan penghitung global, position:fixed tetap nyala
// selama MASIH ADA modal yang terbuka; baru dilepas saat modal terakhir tutup.
let lockCount = 0;
let savedScrollY = 0;

export function useScrollLock(isLocked: boolean) {
    useEffect(() => {
        if (!isLocked) return;

        // Hanya KUNCI saat hitungan naik dari 0.
        if (lockCount === 0) {
            savedScrollY = window.scrollY;
            const body = document.body;
            body.style.position = "fixed";
            body.style.top = `-${savedScrollY}px`;
            body.style.width = "100%";
            // Catatan: JANGAN set overflow-y: scroll di sini. Gutter scrollbar sudah
            // dipesan global lewat `html { scrollbar-gutter: stable }` (globals.css).
            // Menambah scrollbar di <body> = gutter dobel → konten halaman bergeser
            // ~6px tiap modal dibuka. width:100% pada body fixed sudah = viewport−gutter.
        }
        lockCount += 1;

        // Hanya LEPAS saat kembali ke 0.
        return () => {
            lockCount -= 1;
            if (lockCount === 0) {
                const body = document.body;
                body.style.position = "";
                body.style.top = "";
                body.style.width = "";
                window.scrollTo(0, savedScrollY);
            }
        };
    }, [isLocked]);
}
