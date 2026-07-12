import { apiClient } from "@/lib/client/axios-client";
import { DecodedToken } from "@/types/decodedToken";
import { AxiosError } from "axios";

export const fetchProfile = async (): Promise<DecodedToken | null> => {
    try {
        const response = await apiClient.get<{ user: DecodedToken }>("/auth/profile");
        return response.data.user;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            // Belum login (401) bukan error, perlakukan sebagai state "guest".
            // Dengan mengembalikan null (bukan throw), react-query menyimpannya
            // sebagai hasil sukses yang di-cache, sehingga tidak refetch tiap
            // pindah halaman → navbar tidak "kedip" saat guest mengklik-klik.
            if (error.response?.status === 401) {
                return null;
            }
            throw new Error(error.response?.data?.message || "Authentication failed. Please try again later.");
        }
        throw new Error("Authentication failed. Please try again later.");
    }
};
