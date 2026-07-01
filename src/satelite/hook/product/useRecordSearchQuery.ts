import { apiClient } from "@/lib/client/axios-client";

// Best-effort: catat kata pencarian saat user submit (sinyal rekomendasi).
// Jangan lempar error ke UI; tamu otomatis diabaikan oleh backend.
export const recordSearchQuery = async (query: string): Promise<void> => {
    const q = query.trim();
    if (q.length < 2) return;
    try {
        await apiClient.post(`/product/search-log`, { query: q });
    } catch {
        // abaikan — tracking gagal tidak boleh mengganggu pencarian.
    }
};
