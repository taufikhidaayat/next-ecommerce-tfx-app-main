import { FetchParams } from "@/types/fetchParams";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchOrderById } from "../hook/order/useOrderById";
import { OrderByIdResponse } from "@/types/order/orderByIdResponse";
import { ItemsOrderByIdResponse } from "@/types/order/itemsOrderByIdResponse";
import { fetchItemsOrderById } from "../hook/order/useItemsOrderById";
import { addOrder } from "../hook/order/useAddOrder";
import { CreateOrderInput } from "@/types/order/createOrderInput";
import { updatePaymentMethod } from "../hook/order/useUpdatePaymentMethod";
import { UpdatePaymentMethodInput } from "@/types/order/updatePaymentMethodInput";
import { OrdersByUserIdResponse } from "@/types/order/ordersByUserIdResponse";
import { fetchOrdersByUserId } from "../hook/order/useOrdersByUserId";
import { fetchFirstPurchaseCheck, FirstPurchaseCheckResponse } from "../hook/order/useFirstPurchaseCheck";
import { cancelOrder } from "../hook/order/useCancelOrder";
import { fetchReturnsByOrderId } from "../hook/order/useReturnsByOrderId";
import { ReturnsByOrderResponse } from "@/types/order/returnByOrder";
import { OrderStatus } from "@/enum/orderStatus";
import { isCompletedOrder } from "@/utils/isCompletedOrder";

export const useOrderById = (orderId: string | undefined) => {
  return useQuery<OrderByIdResponse, Error>({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId),
    enabled: !!orderId,
    // Poll so status changes made by the admin in the CMS show up without a manual
    // refresh. Stop polling once the order reaches a terminal state.
    refetchInterval: (query) => {
      const status = query.state.data?.data?.order?.orderStatus;
      if (isCompletedOrder(status) || status === OrderStatus.CANCELLED) {
        return false;
      }
      return 5 * 1000;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useOrdersByUserId = (query?: FetchParams) => {
  return useInfiniteQuery<OrdersByUserIdResponse, Error>({
    queryKey: ['my-orders', query],
    queryFn: ({ pageParam = 1 }) => {
      const updatedQuery = {
        ...query,
        page: pageParam as number,
        limit: query?.limit ?? 10,
      };
      return fetchOrdersByUserId(updatedQuery);
    },
    getNextPageParam: (lastPage) => {
      const { meta } = lastPage.data;
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Unused Service
export const useItemsOrderById = (orderId: string | undefined) => {
  return useQuery<ItemsOrderByIdResponse, Error>({
    queryKey: ['itemsOrder', orderId],
    queryFn: () => fetchItemsOrderById(orderId),
    enabled: !!orderId,
  });
};

export const useAddOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderData: CreateOrderInput) => addOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
};

export const useUpdatePaymentMethod = (orderId: string) => {
  return useMutation({
    mutationFn: (order: UpdatePaymentMethodInput) => updatePaymentMethod(orderId, order),
  });
};

export const useCancelOrder = (orderId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
};

export const useFirstPurchaseCheck = () => {
  return useQuery<FirstPurchaseCheckResponse, Error>({
    queryKey: ['firstPurchaseCheck'],
    queryFn: fetchFirstPurchaseCheck,
  });
};

export const useReturnsByOrderId = (orderId: string | undefined) => {
  return useQuery<ReturnsByOrderResponse, Error>({
    queryKey: ['order-returns', orderId],
    queryFn: () => fetchReturnsByOrderId(orderId),
    enabled: !!orderId,
  });
};