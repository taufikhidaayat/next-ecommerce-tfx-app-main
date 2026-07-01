export interface SearchResponse {
    status: string;
    message: string;
    data: {
        brands: string[];
        categories: string[];
        products: string[];
    };
}