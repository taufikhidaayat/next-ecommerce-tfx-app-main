import { Category } from "./category";
import { MetaData } from "../metadata";

export interface CategoriesResponse {
    status: string;
    message: string;
    data: {
        data: Category[];
        meta: MetaData;
    };
}