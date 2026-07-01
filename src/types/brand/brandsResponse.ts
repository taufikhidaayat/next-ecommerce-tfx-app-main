import { Brand } from "./brand";
import { MetaData } from "../metadata";

export interface BrandsResponse {
    status: string;
    message: string;
    data: {
        data: Brand[];
        meta: MetaData;
    };
}