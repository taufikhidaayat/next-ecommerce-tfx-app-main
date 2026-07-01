import { Product } from "@/types/product/product";

export type WishlistProduct = Product & {
    wishlistId: string;
    wishlistedAt: string;
};

export type WishlistResponse = {
    status: string;
    message: string;
    data: WishlistProduct[] | null;
};

export type WishlistIdsResponse = {
    status: string;
    message: string;
    data: string[] | null;
};
