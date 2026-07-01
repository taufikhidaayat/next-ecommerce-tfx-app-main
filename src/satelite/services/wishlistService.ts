import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchWishlist,
    fetchWishlistIds,
    addWishlist,
    removeWishlist,
} from "../hook/wishlist/useWishlist";
import { WishlistResponse, WishlistIdsResponse } from "@/types/wishlist/wishlist";

export const WISHLIST_QUERY_KEY = ["wishlist"] as const;
export const WISHLIST_IDS_QUERY_KEY = ["wishlist-ids"] as const;

export const useWishlist = (enabled = true) => {
    return useQuery<WishlistResponse, Error>({
        queryKey: WISHLIST_QUERY_KEY,
        queryFn: fetchWishlist,
        enabled,
    });
};

export const useWishlistIds = (enabled = true) => {
    return useQuery<WishlistIdsResponse, Error>({
        queryKey: WISHLIST_IDS_QUERY_KEY,
        queryFn: fetchWishlistIds,
        enabled,
    });
};

export const useAddWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (productId: string) => addWishlist(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: WISHLIST_IDS_QUERY_KEY });
        },
    });
};

export const useRemoveWishlist = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (productId: string) => removeWishlist(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: WISHLIST_IDS_QUERY_KEY });
        },
    });
};
