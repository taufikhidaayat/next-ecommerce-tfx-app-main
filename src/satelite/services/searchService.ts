import { FetchParams } from "@/types/fetchParams";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import { fetchSearch } from "../hook/search/useSearch";

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