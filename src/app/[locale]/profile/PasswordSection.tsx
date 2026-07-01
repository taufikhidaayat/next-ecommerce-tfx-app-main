"use client";

import { useEffect, useState } from "react";
import { useChangePassword, useUser } from "@/satelite/services/userService";
import { toast } from "react-toastify";
import { SectionDivider } from "@/components/ui/layout/SectionDivider";
import FormField from "@/components/ui/forms/FormField";
import ConfirmModal from "@/components/modal/ConfirmModal";
import { FaSpinner } from "react-icons/fa";
import { FiLock } from "react-icons/fi";
import { useTranslations } from "next-intl";

const MAX_PASSWORD_CHANGES = 3;

const formatCountdown = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
};

export default function PasswordSection() {
    const t = useTranslations("profile.password");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);

    const { data: user, refetch } = useUser();
    const { mutate: changePassword, isPending } = useChangePassword();

    const changeCount = user?.data?.passwordChangeCount ?? 0;
    const [waitSeconds, setWaitSeconds] = useState(0);

    // Sync the countdown from the server profile whenever it changes.
    useEffect(() => {
        setWaitSeconds(user?.data?.passwordChangeWaitSeconds ?? 0);
    }, [user?.data?.passwordChangeWaitSeconds]);

    // Tick the countdown; refetch the profile once it hits zero to resync the count.
    useEffect(() => {
        if (waitSeconds <= 0) return;

        const interval = setInterval(() => {
            setWaitSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    refetch();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [waitSeconds, refetch]);

    const isLimitReached = changeCount >= MAX_PASSWORD_CHANGES;
    const isCoolingDown = waitSeconds > 0;
    const isLocked = isLimitReached || isCoolingDown;
    const isFormFilled = Boolean(currentPassword && newPassword && confirmPassword);

    const validate = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error(t("allFieldsRequired"));
            return false;
        }
        if (newPassword.length < 6) {
            toast.error(t("minLength"));
            return false;
        }
        if (newPassword !== confirmPassword) {
            toast.error(t("mismatch"));
            return false;
        }
        if (newPassword === currentPassword) {
            toast.error(t("sameAsOld"));
            return false;
        }
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLimitReached) {
            toast.error(t("limitInfo"));
            return;
        }
        if (isCoolingDown) {
            toast.error(t("waitInfo", { time: formatCountdown(waitSeconds) }));
            return;
        }
        if (!validate()) return;
        setShowConfirm(true);
    };

    const handleConfirmChange = () => {
        changePassword(
            { currentPassword, newPassword },
            {
                onSuccess: () => {
                    toast.success(t("success"));
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setShowConfirm(false);
                    refetch();
                },
                onError: (error: Error) => {
                    const backendMessageMap: Record<string, string> = {
                        "Current password is incorrect": t("currentIncorrect"),
                        "New password cannot be the same as the old password": t("sameAsOld"),
                    };
                    const message = error.message || "";
                    const mapped = message.startsWith("You can only change your password")
                        ? t("limitInfo")
                        : message.startsWith("You can change your password again")
                            ? t("waitInfo", { time: formatCountdown(waitSeconds) })
                            : backendMessageMap[message] || message || t("failed");
                    toast.error(mapped);
                    setShowConfirm(false);
                    refetch();
                },
            }
        );
    };

    const inputsDisabled = isPending || isLocked;

    return (
        <div className="w-full bg-white rounded-2xl shadow-md px-8 py-10 space-y-8 border border-gray-100 mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <SectionDivider label={t("title")} className="mt-[-16px]" />

                <div className="space-y-6">
                    <FormField
                        label={t("currentPassword")}
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={t("currentPasswordPlaceholder")}
                        required
                        disabled={inputsDisabled}
                    />

                    <FormField
                        label={t("newPassword")}
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t("newPasswordPlaceholder")}
                        required
                        disabled={inputsDisabled}
                    />

                    <FormField
                        label={t("confirmPassword")}
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t("confirmPasswordPlaceholder")}
                        required
                        disabled={inputsDisabled}
                    />
                </div>

                {/* Rate-limit info */}
                <div className="text-xs">
                    {isLimitReached ? (
                        <p className="font-semibold text-red-600">
                            {t("limitInfo")}{" "}
                            <span className="whitespace-nowrap">({changeCount}/{MAX_PASSWORD_CHANGES})</span>
                        </p>
                    ) : isCoolingDown ? (
                        <p className="font-semibold text-amber-600">
                            {t("waitInfo", { time: formatCountdown(waitSeconds) })}{" "}
                            <span className="whitespace-nowrap">({changeCount}/{MAX_PASSWORD_CHANGES})</span>
                        </p>
                    ) : (
                        <p className="italic text-gray-500">
                            {t("changeInfo")}{" "}
                            <span className="whitespace-nowrap font-semibold text-gray-600 not-italic">
                                ({changeCount}/{MAX_PASSWORD_CHANGES})
                            </span>
                        </p>
                    )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end">
                    <button
                        type="submit"
                        disabled={!isFormFilled || isPending || isLocked}
                        className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-3 rounded-full font-semibold shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] ${isPending
                            ? "bg-emerald-600 text-white cursor-wait focus:ring-emerald-500"
                            : isFormFilled && !isLocked
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {isPending ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                <span>{t("changing")}</span>
                            </>
                        ) : (
                            <>
                                <FiLock className="text-base" />
                                <span>{t("changeButton")}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            <ConfirmModal
                open={showConfirm}
                loading={isPending}
                title={t("confirmTitle")}
                message={t("confirmMessage")}
                confirmButtonText={t("confirmButton")}
                confirmVariant="warning"
                onConfirm={handleConfirmChange}
                onCancel={() => setShowConfirm(false)}
            />
        </div>
    );
}
