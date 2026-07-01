import { useQuery } from "@tanstack/react-query";
import { DIY_PROVINCE, WilayahItem } from "@/types/wilayah";

// Free, key-less Indonesian region API. The app already requires internet for
// OSM map tiles + Nominatim, so this adds no new offline constraint.
const BASE_URL = "https://www.emsifa.com/api-wilayah-indonesia/api";

// emsifa returns names in UPPERCASE; keep them as-is to match official spelling.
async function fetchWilayah(url: string): Promise<WilayahItem[]> {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Failed to load region data (${res.status})`);
    const data: Array<{ id: string; name: string }> = await res.json();
    return data.map((d) => ({ id: d.id, name: d.name }));
}

// Plain fetchers (usable imperatively, e.g. for GPS auto-fill).
export const fetchRegencies = () => fetchWilayah(`${BASE_URL}/regencies/${DIY_PROVINCE.id}.json`);
export const fetchDistricts = (regencyId: string) => fetchWilayah(`${BASE_URL}/districts/${regencyId}.json`);
export const fetchVillages = (districtId: string) => fetchWilayah(`${BASE_URL}/villages/${districtId}.json`);

// emsifa tidak menyertakan kode pos, jadi dilengkapi dari API kodepos terpisah
// (gratis, tanpa key). Dipakai untuk auto-isi kode pos saat kelurahan dipilih.
export type KodeposItem = {
    code: string | number;
    village: string;
    district: string;
    regency: string;
    province: string;
};

export async function fetchKodepos(query: string): Promise<KodeposItem[]> {
    try {
        const res = await fetch(`https://kodepos.vercel.app/search/?q=${encodeURIComponent(query)}`);
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json?.data) ? (json.data as KodeposItem[]) : [];
    } catch {
        return [];
    }
}

// Cache aggressively — administrative regions practically never change.
const STALE_TIME = 1000 * 60 * 60 * 24; // 24h

export function useRegencies() {
    return useQuery({
        queryKey: ["wilayah", "regencies", DIY_PROVINCE.id],
        queryFn: fetchRegencies,
        staleTime: STALE_TIME,
    });
}

export function useDistricts(regencyId: string | null) {
    return useQuery({
        queryKey: ["wilayah", "districts", regencyId],
        queryFn: () => fetchDistricts(regencyId as string),
        enabled: !!regencyId,
        staleTime: STALE_TIME,
    });
}

export function useVillages(districtId: string | null) {
    return useQuery({
        queryKey: ["wilayah", "villages", districtId],
        queryFn: () => fetchVillages(districtId as string),
        enabled: !!districtId,
        staleTime: STALE_TIME,
    });
}
