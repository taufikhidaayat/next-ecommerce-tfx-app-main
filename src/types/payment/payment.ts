export type Payment = {
    id: string;
    bankName: string;
    bankAccountNumber: string;
    accountHolder: string;
    isActive: boolean;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy?: string;
    qrisMediaId?: string;
    qrisMedia?: {
        url: string;
    } | null;
};