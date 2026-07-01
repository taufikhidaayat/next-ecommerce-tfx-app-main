export interface Product {
    id?: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    file?: File;
    categoryId?: string;
    createdBy: string;
    createdAt?: string;
    updatedBy?: string;
    updatedAt?: string;
    categoryName?: string;
    brandId?: string;
    brandName?: string;
    unit: string;
    discountPercentage?: number;
    minQuantityForDiscount?: string;
    bulkDiscountPrice?: number;
    bulkDiscountEnabled?: boolean;
    discountPrice?: number;
    canReview?: boolean;
    averageRating?: number;
    ratingCount?: number;
    ratingDistribution?: Record<number, number>;
    weight?: number;
    weightUnit?: string;
}
