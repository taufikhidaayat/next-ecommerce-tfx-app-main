import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCartsByUserId } from "../hook/cart/useCartsByUserId";
import { CartsByUserIdResponse } from "@/types/cart/cartsByIdResponse";
import { addCart } from "../hook/cart/useAddCart";
import { updateCart } from "../hook/cart/useUpdateCart";
import { deleteCartById } from "../hook/cart/useDeleteCartById";
import { deleteCartsByUserId } from "../hook/cart/useDeleteCartsByUserId";
import { UpdateCartInput } from "@/types/cart/updateCartInput";
import { FetchParams } from "@/types/fetchParams";
import { CreateCartInput } from "@/types/cart/createCartInput";
import { reorderByOrderId } from "../hook/cart/useReorderByOrderId";

export const useCartsByUserId = (query?: FetchParams) => {
  return useQuery<CartsByUserIdResponse, Error>({
    queryKey: ["carts", query],
    queryFn: () => fetchCartsByUserId(query),
  });
};

// Setelah cart berubah, refresh daftar cart (& badge jumlah) tanpa refresh manual.
const invalidateCarts = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["carts"] });
};

export const useAddCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cart: CreateCartInput) => addCart(cart),
    onSuccess: () => invalidateCarts(queryClient),
  });
};

export const useReorderByOrderId = (orderId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => reorderByOrderId(orderId),
    mutationKey: ['reorder', orderId],
    onSuccess: () => invalidateCarts(queryClient),
  });
};

export const useUpdateCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cart: UpdateCartInput) => updateCart(cart),
    onSuccess: () => invalidateCarts(queryClient),
  });
};

export const useDeleteCartById = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCartById,
    onSuccess: () => invalidateCarts(queryClient),
  });
};

// Unused Service
export const useDeleteCartsByUserId = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCartsByUserId,
    onSuccess: () => invalidateCarts(queryClient),
  });
};