export type PointBalance = {
    points: number;
};

export type PointBalanceResponse = {
    status?: string;
    message?: string;
    data: PointBalance;
};

export type PointTransactionType = "EARN_REVIEW" | "REDEEM_ORDER" | "ADJUST";

export type PointTransaction = {
    id: string;
    amount: number;
    type: PointTransactionType;
    description: string | null;
    createdAt: string;
    order: { id: string; orderId: string } | null;
};

export type PointHistoryResponse = {
    status?: string;
    message?: string;
    data: {
        data: PointTransaction[];
        meta: {
            page: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    };
};
