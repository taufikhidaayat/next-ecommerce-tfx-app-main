import { apiClient } from "@/lib/client/axios-client";
import { CreatePaymentInput } from "@/types/payment/createPaymentInput";

export const addPayment = async (
    payment: CreatePaymentInput & { file: File }
) => {
    const formData = new FormData();
    formData.append("file", payment.file);
    formData.append("orderId", payment.orderId);

    const response = await apiClient.post("/payments", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};