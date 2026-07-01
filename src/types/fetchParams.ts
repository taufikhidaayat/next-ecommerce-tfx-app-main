import { SortOrder } from "@/enum/sortOrder";

export interface FetchParams {
    page?: number;
    limit?: number;
    search?: string;
    sortField?: string;
    sortOrder?: SortOrder;
    status?: string;
    mediaType?: string;
    q?: string;
    token?: string;
}