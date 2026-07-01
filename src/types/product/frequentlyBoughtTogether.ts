export type FbtProduct = {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    unit: string;
    code: string | null;
    stock: number;
    discountPercentage: number | null;
    discountPrice: number | null;
    bulkDiscountEnabled: boolean;
    bulkDiscountPrice: number | null;
    minQuantityForDiscount: number | null;
    averageRating: number | null;
    ratingCount: number | null;
    category: { id: string; name: string } | null;
};

export type FrequentlyBoughtTogetherResponse = {
    status: string;
    message: string;
    data: FbtProduct[];
};
