"use client";

import { useState } from "react";
import Link from "next/link";
import { FaCoins } from "react-icons/fa";
import {
    FiTrendingUp,
    FiTrendingDown,
    FiSettings,
    FiChevronLeft,
    FiChevronRight,
    FiInbox,
} from "react-icons/fi";
import { useTranslations } from "next-intl";
import {
    usePointBalance,
    usePointHistory,
} from "@/satelite/services/pointService";
import { PointTransaction } from "@/types/point";
import Breadcrumbs from "@/components/ui/layout/Breadcrumb";
import ErrorComponent from "@/components/ui/feedback/Error";

export default function PointsHistoryPage() {
    const t = useTranslations("profile.pointsHistory");
    const [page, setPage] = useState(1);

    const { data: balanceData } = usePointBalance();
    const { data, isPending, isError } = usePointHistory(page, 20);

    if (isError) return <ErrorComponent />;

    const balance = balanceData?.data?.points ?? 0;
    const transactions = data?.data?.data ?? [];
    const meta = data?.data?.meta;

    return (
        <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full pt-3 pb-5">
                <Breadcrumbs
                    items={[
                        { label: t("breadcrumb.dashboard"), href: "/" },
                        { label: t("breadcrumb.profile"), href: "/profile" },
                        { label: t("breadcrumb.points") },
                    ]}
                />

                <div className="mb-6 mt-3">
                    <h2 className="text-4xl font-extrabold text-green-800 mb-2">
                        {t("title")}
                    </h2>
                    <p className="text-gray-600">{t("subtitle")}</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sticky Balance Card */}
                    <aside className="lg:w-1/3 w-full">
                        <div className="lg:sticky lg:top-28">
                            <div className="relative overflow-hidden rounded-2xl shadow-lg p-6 text-white" style={{ background: "linear-gradient(135deg, #F7971E 0%, #FFD200 100%)" }}>
                                <div
                                    aria-hidden
                                    className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"
                                />
                                <div
                                    aria-hidden
                                    className="absolute -right-6 -bottom-10 w-32 h-32 rounded-full bg-white/10 blur-xl"
                                />
                                <div className="relative">
                                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide opacity-90">
                                        <FaCoins className="w-3.5 h-3.5" />
                                        {t("currentBalance")}
                                    </div>
                                    <div className="text-5xl font-extrabold mt-3 tabular-nums">
                                        {balance.toLocaleString("id-ID")}
                                    </div>
                                    <p className="text-xs opacity-90 mt-2 leading-relaxed">
                                        {t("balanceHint")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* History List */}
                    <section className="lg:w-2/3 w-full">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800">
                                    {t("historyTitle")}
                                </h3>
                                {meta && (
                                    <span className="text-xs text-gray-500">
                                        {meta.totalItems}
                                    </span>
                                )}
                            </div>

                            {isPending ? (
                                <ul className="divide-y divide-gray-100">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <li
                                            key={i}
                                            className="px-6 py-4 flex items-center gap-3 animate-pulse"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 bg-gray-200 rounded w-2/3" />
                                                <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                                            </div>
                                            <div className="h-4 bg-gray-200 rounded w-12" />
                                        </li>
                                    ))}
                                </ul>
                            ) : transactions.length === 0 ? (
                                <div className="px-6 py-16 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                                        <FiInbox className="w-7 h-7 text-amber-500" />
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium">
                                        {t("empty")}
                                    </p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {transactions.map((trx: PointTransaction) => (
                                        <TransactionRow key={trx.id} trx={trx} t={t} />
                                    ))}
                                </ul>
                            )}

                            {meta && meta.totalPages > 1 && (
                                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs">
                                    <button
                                        disabled={page <= 1}
                                        onClick={() => setPage(page - 1)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        <FiChevronLeft className="w-3.5 h-3.5" />
                                        {t("prev")}
                                    </button>
                                    <span className="text-gray-500">
                                        {t("pageOf", {
                                            current: page,
                                            total: meta.totalPages,
                                        })}
                                    </span>
                                    <button
                                        disabled={page >= meta.totalPages}
                                        onClick={() => setPage(page + 1)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        {t("next")}
                                        <FiChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function TransactionRow({
    trx,
    t,
}: {
    trx: PointTransaction;
    t: ReturnType<typeof useTranslations>;
}) {
    const isPositive = trx.amount >= 0;
    const dateStr = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(trx.createdAt));

    return (
        <li className="px-6 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition">
            <TypeIcon type={trx.type} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                    {trx.description ?? t(`typeLabel.${trx.type}`)}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                    {trx.order && (
                        <Link
                            href={`/orders/${trx.order.id}`}
                            className="text-emerald-600 hover:text-emerald-700 hover:underline truncate max-w-[140px]"
                        >
                            {trx.order.orderId}
                        </Link>
                    )}
                    {trx.order && <span className="text-gray-300">·</span>}
                    <span>{dateStr}</span>
                </div>
            </div>
            <span
                className={`text-sm font-bold tabular-nums ${
                    isPositive ? "text-emerald-600" : "text-red-600"
                }`}
            >
                {isPositive ? "+" : ""}
                {trx.amount.toLocaleString("id-ID")}
            </span>
        </li>
    );
}

function TypeIcon({ type }: { type: PointTransaction["type"] }) {
    const className =
        "w-9 h-9 rounded-full flex items-center justify-center shrink-0";
    if (type === "EARN_REVIEW") {
        return (
            <div className={`${className} bg-emerald-100 text-emerald-600`}>
                <FiTrendingUp className="w-4 h-4" />
            </div>
        );
    }
    if (type === "REDEEM_ORDER") {
        return (
            <div className={`${className} bg-red-100 text-red-600`}>
                <FiTrendingDown className="w-4 h-4" />
            </div>
        );
    }
    return (
        <div className={`${className} bg-gray-100 text-gray-600`}>
            <FiSettings className="w-4 h-4" />
        </div>
    );
}
