import HistoriesOrderSkeleton from "./HistoriesOrderSkeleton";
import OrderFlowSkeleton from "./OrderFlowSkeleton";
import OrderInformationSkeleton from "./OrderInformationSkeleton";
import OrderSummarySkeleton from "./OrderSummarySkeleton";
import PaymentInformationSkeleton from "./PaymentInformationSkeleton";

export default function OrderSkeleton() {
    return (
        <div className="flex flex-col gap-6 mt-6">
            <div className="w-full">
                <OrderFlowSkeleton />
            </div>
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/2 flex flex-col gap-6">
                    <OrderInformationSkeleton />
                    <PaymentInformationSkeleton />
                    <HistoriesOrderSkeleton />
                </div>
                <div className="w-full lg:w-1/2 flex flex-col gap-6">
                    <OrderSummarySkeleton />
                </div>
            </div>
        </div>
    );
}
