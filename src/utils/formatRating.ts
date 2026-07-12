// Rapikan angka rating untuk tampilan: bulat tampil apa adanya (4), pecahan 1 desimal
// (4.3), dan nilai kosong/invalid jadi "0".
export function formatRating(val: number | undefined | null): string | number {
    if (typeof val !== "number" || isNaN(val)) return "0";
    return Number.isInteger(val) ? val : val.toFixed(1);
}