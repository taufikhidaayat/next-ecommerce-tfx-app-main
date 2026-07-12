// Membersihkan teks dari URL (mis. nama kategori/brand di query) agar aman dipakai:
// membuang karakter aneh, tapi tetap memperbolehkan yang wajar untuk nama toko.
export function sanitizeQueryParam(str: string): string {
    // Izinkan huruf/angka/underscore, spasi, strip, ampersand, titik, apostrof
    // (& dibutuhkan untuk nama kategori spt "Roti & Selai", apostrophe untuk brand spt "Wall's")
    return decodeURIComponent(str)
        .replace(/[^\w\s\-&.']/g, "");
}