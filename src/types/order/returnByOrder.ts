export type OrderReturnItem = {
    id: string;
    quantity: number;
    reason: string;
    photoUrl: string;
    createdAt: string;
    orderItem: {
        id: string;
        productName: string;
        product: {
            id: string;
            name: string;
            imageUrl: string | null;
        } | null;
    };
};

export type ReturnsByOrderResponse = {
    data: OrderReturnItem[];
    message?: string;
    status?: number;
};
