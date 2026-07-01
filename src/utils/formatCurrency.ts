export function formatCurrency(value: number): string {
    const rounded = Math.round(value);
    return `Rp ${rounded.toLocaleString("id-ID")}`;
}
