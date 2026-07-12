import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/client/axios-client";
import { PointBalanceResponse, PointHistoryResponse } from "@/types/point";

// Service poin loyalitas pelanggan: saldo poin + riwayat poin. File ini menggabungkan
// fungsi pemanggil API (fetch*) dan hook React Query-nya (use*) dalam satu file.
export const fetchPointBalance = async (): Promise<PointBalanceResponse> => {
    const response = await apiClient.get<PointBalanceResponse>(`/points/balance`);
    return response.data;
};

export const fetchPointHistory = async (
    page = 1,
    limit = 20
): Promise<PointHistoryResponse> => {
    const response = await apiClient.get<PointHistoryResponse>(`/points/history`, {
        params: { page, limit },
    });
    return response.data;
};

export const usePointBalance = () => {
    return useQuery<PointBalanceResponse, Error>({
        queryKey: ["point-balance"],
        queryFn: fetchPointBalance,
    });
};

export const usePointHistory = (page = 1, limit = 20) => {
    return useQuery<PointHistoryResponse, Error>({
        queryKey: ["point-history", page, limit],
        queryFn: () => fetchPointHistory(page, limit),
    });
};
