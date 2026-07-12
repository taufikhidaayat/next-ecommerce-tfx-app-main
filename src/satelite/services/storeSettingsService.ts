import { useQuery } from "@tanstack/react-query";
import { fetchStoreSettings } from "../hook/store-settings/useStoreSettings";
import { StoreSettingsResponse } from "@/types/storeSettings";

// Service baca pengaturan toko (lokasi, radius kirim, min. belanja) untuk sisi pelanggan,
// mis. saat cek kelayakan pengiriman ke alamat pembeli.
export const useStoreSettings = () => {
    return useQuery<StoreSettingsResponse, Error>({
        queryKey: ["storeSettings"],
        queryFn: fetchStoreSettings,
    });
};
