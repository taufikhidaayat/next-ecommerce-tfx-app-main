import { Category } from "./category";

export interface CategoryByIdResponse {
    status: string;
    message: string;
    data: Category;
}