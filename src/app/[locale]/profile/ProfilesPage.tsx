"use client";

import { useEffect, useState } from "react";
import Breadcrumbs from "@/components/ui/layout/Breadcrumb";
import ErrorComponent from "@/components/ui/feedback/Error";
import { useUpdateUser, useUpdateUserAvatar, useUser } from "@/satelite/services/userService";
import { toast } from "react-toastify";
import { Gender } from "@/enum/gender";
import ProfileSkeleton from "@/components/skeletons/profile/ProfileSkeleton";
import AvatarSection from "./AvatarSection";
import PersonalSection from "./PersonalSection";
import AddressSection from "./AddressSection";
import PasswordSection from "./PasswordSection";
import PointsCard from "./PointsCard";
import WishlistCard from "./WishlistCard";
import { profileSchema } from "@/types/schemas/profileSchema";
import { useTranslations } from "next-intl";


// Isi halaman Profil: menyusun bagian-bagian akun pelanggan (data diri, avatar,
// alamat, password, poin, wishlist), tiap bagian komponen terpisah di folder ini.
export default function Profiles() {
    const t = useTranslations("profile.page");
    const tBtn = useTranslations("profile.button");

    const [previewUrl, setPreviewUrl] = useState<string | null>("/images/default-profile.png");

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        birthDate: "",
        gender: Gender.OTHER,
    });

    const { data: user, isPending, isError, refetch } = useUser();
    const { mutate: updateUser, isPending: isPendingUpdateUser } = useUpdateUser();
    const { mutate: updateAvatar, isPending: isPendingUpdateAvatar } = useUpdateUserAvatar();


    useEffect(() => {
        if (user?.data) {
            setFormData({
                name: user.data.name || "",
                phone: user.data.phone || "",
                address: user.data.address || "",
                birthDate: user.data.birthDate?.slice(0, 10) || "",
                gender: user.data.gender || Gender.OTHER,
            });

            if (user.data.profileImageUrl) {
                setPreviewUrl(user.data.profileImageUrl);
            }
        }
    }, [user]);

    const isFormChanged =
        formData.name !== (user?.data.name || "") ||
        formData.phone !== (user?.data.phone || "") ||
        formData.address !== (user?.data.address || "") ||
        formData.birthDate !== (user?.data.birthDate?.slice(0, 10) || "") ||
        formData.gender !== (user?.data.gender || Gender.OTHER);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const result = profileSchema.safeParse(formData);

        if (!result.success) {
            result.error.issues.forEach(issue => {
                toast.error(issue.message);
            });
            return;
        }

        updateUser(formData, {
            onSuccess: () => {
                toast.success(tBtn("updateSuccess"));
                refetch();
            },
            onError: () => {
                toast.error(tBtn("updateFail"));
            },
        });
    };

    const handleUploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        updateAvatar(formData, {
            onSuccess: () => {
                toast.success(tBtn("avatarSuccess"));
                refetch();
            },
            onError: () => toast.error(tBtn("avatarFail")),
        });
    };

    const handleDeleteAvatar = () => {
        updateAvatar(new FormData(), {
            onSuccess: () => {
                setPreviewUrl("/images/default-profile.png");
                toast.success(tBtn("avatarDeleteSuccess"));
                refetch();
            },
            onError: () => toast.error(tBtn("avatarFail")),
        });
    };

    if (isError) return <ErrorComponent />;

    return (
        <>
            <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="w-full pt-3 pb-5">
                    <Breadcrumbs
                        items={[
                            { label: t("breadcrumb.dashboard"), href: "/" },
                            { label: t("breadcrumb.profile") },
                        ]}
                    />

                    {/* Header */}
                    <div className="mb-5 mt-3">
                        <h2 className="text-4xl font-extrabold text-green-800 mb-2">
                            {t("title")}
                        </h2>
                        <p className="text-gray-600">
                            {t("subtitle")}
                        </p>
                    </div>

                    {isPending ? (
                        <ProfileSkeleton />
                    ) : user ? (
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Avatar Section */}
                            <AvatarSection
                                previewUrl={previewUrl}
                                userName={user.data.name}
                                isPendingUpdateAvatar={isPendingUpdateAvatar}
                                handleUploadAvatar={handleUploadAvatar}
                                handleDeleteAvatar={handleDeleteAvatar}
                            />

                            {/* Form + Address */}
                            <div className="md:w-4/5 w-full">
                                <PointsCard />
                                <WishlistCard />
                                <PersonalSection
                                    userEmail={user.data.email || ""}
                                    formData={formData}
                                    handleChange={handleChange}
                                    handleSubmit={handleSubmit}
                                    isPendingUpdateUser={isPendingUpdateUser}
                                    isFormChanged={isFormChanged}
                                >
                                    <AddressSection />
                                </PersonalSection>

                                <PasswordSection />
                            </div>
                        </div>
                    ) : (
                        <ErrorComponent />
                    )}
                </div>
            </div>
        </>
    );
}