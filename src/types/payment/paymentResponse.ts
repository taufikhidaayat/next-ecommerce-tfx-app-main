import { MetaData } from "../metadata";
import { Payment } from "./payment";

export interface PaymentsResponse {
    status: string;
    message: string;
    data: {
        data: Payment[];
        meta: MetaData;
    };
}