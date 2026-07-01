import { useMutation, useQuery } from "@tanstack/react-query";
import { addPayment } from "../hook/payment/useAddOrder";
import { CreatePaymentInput } from "@/types/payment/createPaymentInput";
import { fetchPayment } from "../hook/payment/usePayment";
import { FetchParams } from "@/types/fetchParams";

export const useAddPayment = () => {
    return useMutation({
        mutationFn: (paymentData: CreatePaymentInput & { file: File }) => addPayment(paymentData)
    });
};

export const usePayment = (params: FetchParams) => {
    return useQuery({
        queryKey: ['payments', params],
        queryFn: ({ queryKey }) => {
            const [, params] = queryKey as [string, FetchParams];
            return fetchPayment(params);
        },
    })
}