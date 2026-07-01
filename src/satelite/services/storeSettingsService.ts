import { useQuery } from "@tanstack/react-query";
import { fetchStoreSettings } from "../hook/store-settings/useStoreSettings";
import { StoreSettingsResponse } from "@/types/storeSettings";

export const useStoreSettings = () => {
    return useQuery<StoreSettingsResponse, Error>({
        queryKey: ["storeSettings"],
        queryFn: fetchStoreSettings,
    });
};
