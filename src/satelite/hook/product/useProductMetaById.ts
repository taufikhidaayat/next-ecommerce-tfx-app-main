"use server";

import { productMetaByIdResponse } from "@/types/product/productMetaByIdResponse";

export async function fetchProductMetaById(productId: string): Promise<productMetaByIdResponse> {
    try {
        const res = await fetch(`${process.env.BASE_URL}/api/product/${productId}/meta`, {
            headers: {
                'x-api-key': process.env.API_KEY ?? "",
            },
            cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch product");
        return await res.json();
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        throw error;
    }
}