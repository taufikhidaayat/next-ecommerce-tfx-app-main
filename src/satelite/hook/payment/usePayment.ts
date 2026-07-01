import { apiClient } from "@/lib/client/axios-client";
import { FetchParams } from "@/types/fetchParams";
import { PaymentsResponse } from "@/types/payment/paymentResponse";
import { buildQueryString } from "@/utils/buildQueryString";

export const fetchPayment = async (params: FetchParams): Promise<PaymentsResponse> => {
    const queryString = buildQueryString(params || {});
    const response = await apiClient.get<PaymentsResponse>(
        `/bank-account?${queryString}`
    );
    return response.data;
};
