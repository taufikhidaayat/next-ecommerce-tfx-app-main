import { ProductPriceInput } from "@/types/statistics/productPriceInput";

/**
 * Calculate the unit price of a product based on its quantity and discount.
 */
export function calculateUnitPrice({
  quantity,
  product
}: ProductPriceInput): number {
  const minQty =
    typeof product.minQuantityForDiscount === 'string'
      ? parseInt(product.minQuantityForDiscount)
      : product.minQuantityForDiscount;

  const discountPercentage = product.discountPercentage ?? 0;
  const discountedPrice = product.price - (discountPercentage / 100) * product.price;

  const qualifiesForBulk =
    product.bulkDiscountEnabled !== false &&
    minQty !== undefined &&
    quantity >= minQty &&
    product.bulkDiscountPrice !== undefined &&
    product.bulkDiscountPrice > 0;

  if (qualifiesForBulk) {
    return Math.min(product.bulkDiscountPrice as number, discountedPrice);
  }

  return discountedPrice;
}

/**
 * Calculate the subtotal price of a product based on its quantity and discount.
 */
export function calculateSubtotalPrice(input: ProductPriceInput): number {
  const unitPrice = calculateUnitPrice(input);
  return unitPrice * input.quantity;
}

/**
 * Calculate the total price of a list of products.
 */
export function calculateTotalPrice(items: ProductPriceInput[]): number {
  return items.reduce((total, item) => total + calculateSubtotalPrice(item), 0);
}
