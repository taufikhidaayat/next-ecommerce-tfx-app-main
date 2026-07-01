import { Product } from "./product";

export interface ProductByIdResponse {
    status: string;
    message: string;
    data: Product;
}