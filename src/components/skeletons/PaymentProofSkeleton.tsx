import { PaymentMethod } from "@/enum/paymentMethod";
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type Props = {
    paymentMethod?: PaymentMethod;
    bankAccountCount?: number;
};

export default function PaymentProofSkeleton({ paymentMethod, bankAccountCount = 2 }: Props) {
    return (
        <div className="flex-1 px-4 sm:px-6 space-y-6 py-6 overflow-auto">
            {paymentMethod === "QRIS" && (
                <div className="w-full flex justify-center max-h-[60vh] overflow-hidden">
                    <Skeleton height={240} width={240} style={{ borderRadius: "16px" }} />
                </div>
            )}

            {paymentMethod === "BANK_TRANSFER" && (
                <div className="grid gap-4">
                    {[...Array(bankAccountCount)].map((_, idx) => (
                        <div
                            key={idx}
                            className="rounded-lg p-4 bg-gray-50 shadow-sm border border-gray-200"
                        >
                            <Skeleton width={120} height={20} />
                            <Skeleton width={180} height={16} style={{ marginTop: 12 }} />
                            <Skeleton width={140} height={16} style={{ marginTop: 8 }} />
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-2 pt-4">
                <Skeleton width={120} height={16} />
                <div className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 flex items-center justify-between text-sm text-gray-500 overflow-hidden">
                    <Skeleton width={160} height={32} />
                </div>
            </div>
        </div>
    );
}