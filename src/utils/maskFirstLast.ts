// Menyamarkan teks jadi "huruf-pertama***huruf-terakhir", mis. "Budi" → "B***i".
// Dipakai untuk privasi, mis. menampilkan nama pengulas tanpa membocorkan nama penuh.
export function maskFirstLast(input: string): string {
    if (!input) return "";

    const trimmed = input.trim();
    if (trimmed.length <= 2) return trimmed;

    const firstChar = trimmed.charAt(0);
    const lastChar = trimmed.charAt(trimmed.length - 1);

    return `${firstChar}***${lastChar}`;
}