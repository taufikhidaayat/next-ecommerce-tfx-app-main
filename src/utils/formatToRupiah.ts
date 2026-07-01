export function formatToRupiah(value: string | undefined): string {
    if (value === undefined || value === null || value === "") return "Rp 0";

    const number = typeof value === "string" ? parseInt(value, 10) : value;
    if (isNaN(number)) return "Rp 0";

    return `Rp ${number.toLocaleString("id-ID")}`;
}