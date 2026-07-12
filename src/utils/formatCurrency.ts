// Format angka jadi rupiah "Rp 15.000" (pemisah ribuan gaya Indonesia). Sama seperti di CMS.
export function formatCurrency(value: number): string {
    const rounded = Math.round(value);
    return `Rp ${rounded.toLocaleString("id-ID")}`;
}
