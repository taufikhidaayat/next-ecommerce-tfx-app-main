import { SortOrder } from "@/enum/sortOrder";

export interface FetchProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    sortField?: string;
    sortOrder?: SortOrder;
    category?: string,
    priceRange?: string,
    brand?: string,
    hasReview?: boolean,
    rating?: string,
}