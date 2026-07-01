export function formatRating(val: number | undefined | null): string | number {
    if (typeof val !== "number" || isNaN(val)) return "0";
    return Number.isInteger(val) ? val : val.toFixed(1);
}