import { apiClient } from "@/lib/client/axios-client";

// Best-effort: catat user membuka detail produk. Jangan lempar error ke UI.
export const recordProductView = async (productId: string): Promise<void> => {
    try {
        await apiClient.post(`/product/${productId}/view`);
    } catch {
        // abaikan — tracking gagal tidak boleh mengganggu pengalaman user.
    }
};
