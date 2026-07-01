"use client";

import { useState } from "react";
import ModalBox from "./ModalBox";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { FiFlag, FiAlertCircle } from "react-icons/fi";
import { useReportReview } from "@/satelite/services/productService";
import {
    REVIEW_REPORT_REASONS,
    ReviewReportReason,
} from "@/types/product/reviewReport";

type ReportReviewModalProps = {
    isOpen: boolean;
    onClose: () => void;
    reviewId: string;
};

const MIN_NOTE_LEN = 5;

export default function ReportReviewModal({
    isOpen,
    onClose,
    reviewId,
}: ReportReviewModalProps) {
    const t = useTranslations("reportReviewModal");
    const tCard = useTranslations("reviewCard");

    const [reason, setReason] = useState<ReviewReportReason | null>(null);
    const [note, setNote] = useState("");
    const [error, setError] = useState<string | null>(null);

    const { mutate: report, isPending } = useReportReview();

    const noteRequired = reason === "OTHER";

    const handleClose = () => {
        setReason(null);
        setNote("");
        setError(null);
        onClose();
    };

    const handleSubmit = () => {
        if (!reason) {
            setError(t("needReason"));
            return;
        }
        if (noteRequired && note.trim().length < MIN_NOTE_LEN) {
            setError(t("needNote"));
            return;
        }
        setError(null);

        report(
            {
                reviewId,
                reason,
                note: note.trim() || undefined,
            },
            {
                onSuccess: () => {
                    toast.success(tCard("reported"));
                    handleClose();
                },
                onError: () => {
                    toast.error(tCard("reportFailed"));
                },
            },
        );
    };

    if (!isOpen) return null;

    return (
        <ModalBox isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md">
            <ModalBox.Header>
                <div className="flex items-center justify-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                        <FiFlag className="w-4 h-4 text-red-600" />
                    </div>
                    <span>{t("title")}</span>
                </div>
            </ModalBox.Header>

            <ModalBox.Body>
                <p className="text-xs sm:text-sm text-gray-500 text-center -mt-1">
                    {t("subtitle")}
                </p>

                {/* Reason list */}
                <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2 px-1">
                        {t("reasonLabel")}
                    </p>
                    <div className="space-y-2">
                        {REVIEW_REPORT_REASONS.map((r) => {
                            const selected = reason === r;
                            return (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => {
                                        setReason(r);
                                        setError(null);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm text-left transition ${
                                        selected
                                            ? "border-red-400 bg-red-50 text-red-800 font-semibold"
                                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                                    }`}
                                >
                                    <span
                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                                            selected
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                    >
                                        {selected && (
                                            <span className="w-2 h-2 rounded-full bg-red-500" />
                                        )}
                                    </span>
                                    <span className="flex-1">
                                        {t(`reasons.${r}`)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Note */}
                <div>
                    <label
                        htmlFor="report-note"
                        className="text-xs font-semibold text-gray-700 mb-1.5 px-1 block"
                    >
                        {noteRequired ? t("noteLabelRequired") : t("noteLabel")}
                    </label>
                    <textarea
                        id="report-note"
                        value={note}
                        onChange={(e) => {
                            setNote(e.target.value);
                            setError(null);
                        }}
                        placeholder={t("notePlaceholder")}
                        rows={3}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none resize-none transition"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                        <FiAlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-700">{error}</p>
                    </div>
                )}
            </ModalBox.Body>

            <ModalBox.Footer>
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={isPending}
                    className="py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition disabled:opacity-50"
                >
                    {t("cancel")}
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="py-2.5 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isPending ? t("submitting") : t("submit")}
                </button>
            </ModalBox.Footer>
        </ModalBox>
    );
}
