// Normalisasi nomor telepon Indonesia ke satu format kanonik. Semua input umum
// (081..., 81..., +6281..., "62 812-3456-7890", bahkan data lama "+62081..."
// yang telanjur salah) diseragamkan supaya validasi & penyimpanan konsisten.

/** Nomor nasional tanpa 0 / +62 / karakter non-digit — selalu diawali "8". */
export function toNationalPhone(raw: string): string {
    let d = (raw ?? "").replace(/\D/g, ""); // sisakan digit saja
    if (d.startsWith("62")) d = d.slice(2); // buang kode negara
    d = d.replace(/^0+/, ""); // buang 0 di depan (trunk prefix)
    return d;
}

/** Format simpan E.164, mis. "+6281234567890". "" bila input kosong. */
export function toE164Phone(raw: string): string {
    const national = toNationalPhone(raw);
    return national ? `+62${national}` : "";
}

/** Nomor HP Indonesia valid: diawali 8, prefix operator 1–9, total 8–13 digit. */
export function isValidIdPhone(raw: string): boolean {
    return /^8[1-9][0-9]{6,11}$/.test(toNationalPhone(raw));
}
