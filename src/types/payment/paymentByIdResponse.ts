import { Payment } from "./payment";

export interface PaymentByIdResponse {
    status: string;
    message: string;
    data: Payment;
}