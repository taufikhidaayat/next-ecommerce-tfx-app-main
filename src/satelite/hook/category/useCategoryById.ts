"use server"

import { api } from "@/lib/axios";
import { CategoryByIdResponse } from "@/types/category/categoryByIdResponse";

// Unused Function
export const fetchCategoryById = async (categoryId: string | undefined): Promise<CategoryByIdResponse> => {
    const response = await api.get<CategoryByIdResponse>(process.env.NEXT_PUBLIC_BASE_URL + `/categories/${categoryId}`);
    return response.data;
};