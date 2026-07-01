"use client";

import Breadcrumbs from "@/components/ui/layout/Breadcrumb";
import ErrorComponent from "@/components/ui/feedback/Error";
import OrdersSkeleton from "@/components/skeletons/OrdersSkeleton";
import { useOrdersByUserId } from "@/satelite/services/orderService";
import FilterStatusOrder from "./FilterStatusOrder";
import { OrderStatus } from "@/enum/orderStatus";
import { useEffect, useMemo, useRef, useState } from "react";
import { DataNotFound } from "@/components/ui/feedback/DataNotFound";
import LoadingSpinner from "@/components/ui/layout/LoadingSpinner";
import { useRouter, useSearchParams } from "next/navigation";
import OrderItemView from "@/components/card/OrderItemView";
import { useTranslations } from "next-intl";

function isValidOrderStatus(value: string): value is OrderStatus {
    return Object.values(OrderStatus).includes(value.toUpperCase() as OrderStatus);
}

export default function Orders() {
    const t = useTranslations("orders");
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialStatus = useMemo(() => {
        const urlStatus = searchParams.get("status")?.toUpperCase() || "";
        return isValidOrderStatus(urlStatus) ? (urlStatus as OrderStatus) : OrderStatus.PENDING;
    }, [searchParams]);

    const [status, setStatus] = useState<OrderStatus>(initialStatus);
    const { title, description } = t.raw(`statusMessages.${status}`);

    const searchParamsString = useMemo(() => searchParams.toString(), [searchParams]);
    const observerRef = useRef<HTMLDivElement | null>(null);

    const {
        data: orders,
        isPending,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useOrdersByUserId({ status, limit: 8 });

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1 }
        );

        const currentElement = observerRef.current;
        if (currentElement) observer.observe(currentElement);

        return () => {
            if (currentElement) observer.unobserve(currentElement);
        };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    useEffect(() => {
        const params = new URLSearchParams(searchParamsString);
        params.set("status", status.toLowerCase());
        router.replace(`?${params.toString()}`);
    }, [status, router, searchParamsString]);

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [status]);

    if (isError) return <ErrorComponent />;

    return (
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="container w-full px-4 pt-3 pb-5 mx-auto">
                <Breadcrumbs
                    items={[
                        { label: t("breadcrumb.dashboard"), href: "/" },
                        { label: t("breadcrumb.orders") },
                    ]}
                />

                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-extrabold text-green-800 mb-2">
                            {t("title")}
                        </h2>
                        <p className="text-gray-600 text-sm">
                            {t("subtitle")}
                        </p>
                    </div>
                </div>

                {isPending && <OrdersSkeleton />}

                {orders && (
                    <>
                        <FilterStatusOrder
                            activeStatus={status}
                            onChange={setStatus}
                            counts={orders.pages?.[0]?.data.statusCounts ?? {}}
                        />

                        <div className="mt-6">
                            {orders.pages.flatMap(page => page.data.orders).length > 0 ? (
                                orders.pages
                                    .flatMap(page => page.data.orders)
                                    .map((order, index) => (
                                        <OrderItemView
                                            key={index}
                                            order={order}
                                            showLess={true}
                                            withQuantity={false}
                                        />
                                    ))
                            ) : (
                                <DataNotFound title={title} description={description} />
                            )}
                        </div>

                        <div ref={observerRef} className="h-10" />
                        {isFetchingNextPage && (
                            <div className="flex justify-center">
                                <LoadingSpinner />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
