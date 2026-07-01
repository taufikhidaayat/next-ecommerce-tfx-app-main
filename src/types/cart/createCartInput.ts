export interface CreateCartInput {
    id?: string;
    productId: string;
    quantity: number;
    priceType: string;
    createdAt?: string;
    updatedAt?: string;
};
