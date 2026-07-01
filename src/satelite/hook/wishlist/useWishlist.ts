import { apiClient } from "@/lib/client/axios-client";
import { WishlistResponse, WishlistIdsResponse } from "@/types/wishlist/wishlist";

export const fetchWishlist = async (): Promise<WishlistResponse> => {
    const response = await apiClient.get<WishlistResponse>("/wishlist");
    return response.data;
};

export const fetchWishlistIds = async (): Promise<WishlistIdsResponse> => {
    const response = await apiClient.get<WishlistIdsResponse>("/wishlist/ids");
    return response.data;
};

export const addWishlist = async (productId: string) => {
    const response = await apiClient.post("/wishlist", { productId });
    return response.data;
};

export const removeWishlist = async (productId: string) => {
    const response = await apiClient.delete(`/wishlist/${productId}`);
    return response.data;
};
