// Ubah jumlah detik jadi teks "X minutes Y seconds" (bagian kosong dibuang).
// Dipakai untuk menampilkan sisa waktu tunggu (mis. cooldown ganti metode bayar).
export const formatWaitTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const mStr = m > 0 ? `${m} minute${m !== 1 ? "s" : ""}` : "";
    const sStr = s > 0 ? `${s} second${s !== 1 ? "s" : ""}` : "";
    return [mStr, sStr].filter(Boolean).join(" ");
};