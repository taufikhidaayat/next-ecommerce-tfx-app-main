export interface RatingInput {
    productId?: string;
    rating: number;
    comment?: string;
    orderItemId?: string;
    reviewId?: string;
    isPublic?: boolean;
}
