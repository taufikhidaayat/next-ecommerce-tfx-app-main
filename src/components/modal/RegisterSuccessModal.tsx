import Link from "next/link";
import { FiMail, FiArrowRight } from "react-icons/fi";
import ModalBox from "./ModalBox";
import { useTranslations, useLocale } from "next-intl";

type RegisterSuccessModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function RegisterSuccessModal({ isOpen, onClose }: RegisterSuccessModalProps) {
    const t = useTranslations("registerSuccess");
    const locale = useLocale();

    return (
        <ModalBox isOpen={isOpen} onClose={onClose} withoutCloseButton={true} maxWidth="max-w-md">
            <div className="flex flex-col items-center px-2 py-4 text-center">
                {/* Email icon inside a tinted badge with a soft pulsing ring */}
                <div className="relative mb-5">
                    <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                        <FiMail className="h-8 w-8 text-emerald-600" />
                    </div>
                </div>

                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                    {t("title")}
                </h1>
                <p className="mb-6 max-w-sm text-sm leading-relaxed text-gray-600">
                    {t("desc")}
                </p>

                <Link
                    href={`/${locale}/login`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition-all duration-150 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98]"
                >
                    {t("login")}
                    <FiArrowRight className="text-base" />
                </Link>
            </div>
        </ModalBox>
    );
}
