import FormField from "@/components/ui/forms/FormField";
import FormSelect from "@/components/ui/forms/FormSelect";
import { SectionDivider } from "@/components/ui/layout/SectionDivider";
import { Gender } from "@/enum/gender";
import { FaSpinner } from "react-icons/fa";
import { FiSave } from "react-icons/fi";
import { useTranslations } from "next-intl";

type PersonalSectionProps = {
    userEmail?: string;
    formData: {
        name: string;
        phone: string;
        address: string;
        birthDate: string;
        gender: Gender;
    };
    handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleSubmit: (event: React.FormEvent) => void;
    isPendingUpdateUser?: boolean;
    isFormChanged?: boolean;
    children?: React.ReactNode;
};

export default function PersonalSection({
    userEmail,
    formData,
    handleChange,
    handleSubmit,
    isPendingUpdateUser = false,
    isFormChanged = false,
    children,
}: PersonalSectionProps) {
    const t = useTranslations("profile.form");
    const tBtn = useTranslations("profile.button");

    return (
        <div className="w-full bg-white rounded-2xl shadow-md px-8 py-10 space-y-6 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
                <SectionDivider label={t("personal")} className="mt-[-16px]" />

                <div className="space-y-6">
                    <FormField
                        label={t("name")}
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t("namePlaceholder")}
                        required
                        disabled={isPendingUpdateUser}
                    />

                    <FormField
                        label={t("email")}
                        id="email"
                        type="email"
                        value={userEmail || ""}
                        onChange={handleChange}
                        className="placeholder:text-gray-400 cursor-not-allowed"
                        placeholder={t("emailPlaceholder")}
                        disabled
                    />

                    <FormField
                        label={t("phone")}
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={t("phonePlaceholder")}
                        prefix="+62"
                        disabled={isPendingUpdateUser}
                    />

                    <FormField
                        label={t("birthDate")}
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={handleChange}
                        disabled={isPendingUpdateUser}
                    />

                    <FormSelect
                        label={t("gender")}
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        options={Object.values(Gender).map((genderOption) => ({
                            value: genderOption,
                            label: t(`gender_${genderOption.toLowerCase()}`),
                        }))}
                        placeholder={t("genderPlaceholder")}
                        disabled={isPendingUpdateUser}
                    />
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end">
                    <button
                        type="submit"
                        disabled={!isFormChanged || isPendingUpdateUser}
                        className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-3 rounded-full font-semibold shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] ${isPendingUpdateUser
                            ? "bg-emerald-600 text-white cursor-wait focus:ring-emerald-500"
                            : isFormChanged
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {isPendingUpdateUser ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                <span>{tBtn("saving")}</span>
                            </>
                        ) : (
                            <>
                                <FiSave className="text-base" />
                                <span>{tBtn("save")}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Address Section (rendered below the form, inside same card) */}
            {children}
        </div>
    );
}
