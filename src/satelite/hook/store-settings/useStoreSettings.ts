import { apiClient } from "@/lib/client/axios-client";
import { StoreSettingsResponse } from "@/types/storeSettings";

export const fetchStoreSettings = async (): Promise<StoreSettingsResponse> => {
    const response = await apiClient.get<StoreSettingsResponse>(`/store-settings`);
    return response.data;
};
