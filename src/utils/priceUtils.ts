import { ProductPriceInput } from "@/types/statistics/productPriceInput";

// Perhitungan harga sisi toko pelanggan (harga satuan, subtotal, total). Logikanya
// harus sama dengan backend agar harga yang tampil = tagihan asli: pakai harga grosir
// bila jumlah beli mencukupi, jika tidak pakai harga setelah diskon persen.
export function calculateUnitPrice({ quantity, product }: ProductPriceInput): number {
    const {
        price,
        discountPercentage = 0,
        minQuantityForDiscount = 0,
        bulkDiscountPrice = 0,
    } = product;

    if (quantity >= parseInt(minQuantityForDiscount || "0") && bulkDiscountPrice > 0) {
        return bulkDiscountPrice;
    }

    const discount = (discountPercentage / 100) * price;
    return price - discount;
}

export function calculateSubtotalPrice(input: ProductPriceInput): number {
    const unitPrice = calculateUnitPrice(input);
    return unitPrice * input.quantity;
}

export function calculateTotalPrice(items: ProductPriceInput[]): number {
    return items.reduce((total, item) => total + calculateSubtotalPrice(item), 0);
}
