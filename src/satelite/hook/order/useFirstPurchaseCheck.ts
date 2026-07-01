import { apiClient } from "@/lib/client/axios-client";

export interface FirstPurchaseCheckResponse {
    status: string;
    message: string;
    data: {
        eligible: boolean;
        discountPercent: number;
    };
}

export const fetchFirstPurchaseCheck = async (): Promise<FirstPurchaseCheckResponse> => {
    const response = await apiClient.get<FirstPurchaseCheckResponse>(`/orders/first-purchase-check`);
    return response.data;
};
