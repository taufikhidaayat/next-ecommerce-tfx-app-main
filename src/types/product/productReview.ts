export interface ProductReview {
    id: string;
    userId: string;
    rating: number;
    review: string;
    user: {
        name: string;
        avatar: string;
    };
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}