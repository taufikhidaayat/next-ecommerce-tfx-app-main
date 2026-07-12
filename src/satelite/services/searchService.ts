import { FetchParams } from "@/types/fetchParams";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import { fetchSearch } from "../hook/search/useSearch";

// Service pencarian toko. enabled = query hanya jalan kalau kata kunci (q) tidak kosong,
// jadi tidak memanggil server saat kotak pencarian masih kosong.
export const useSearch = (params: FetchParams) => {
    return useQuery({
        queryKey: ['search', params],
        queryFn: ({ queryKey }: QueryFunctionContext) => {
            const [, params] = queryKey as [string, FetchParams];
            return fetchSearch(params);
        },
        enabled: !!params.q && params.q.trim() !== "",
    });
};