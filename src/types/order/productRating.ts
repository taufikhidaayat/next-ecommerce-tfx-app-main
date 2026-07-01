export interface ProductRating {
    id: string;
    rating: number;
    comment: string;
    isPublic: boolean;
    pointsAwarded?: number;
    editCount?: number;
}
