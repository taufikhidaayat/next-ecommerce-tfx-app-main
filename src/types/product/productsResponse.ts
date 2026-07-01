import { MetaData } from "../metadata";
import { Product } from "./product";

export interface ProductsResponse {
    status: string;
    message: string;
    data: {
        data: Product[];
        meta: MetaData;
    };
}