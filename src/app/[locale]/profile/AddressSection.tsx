"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { FiMapPin, FiEdit2, FiTrash2, FiPlus, FiPhone, FiUser, FiExternalLink } from "react-icons/fi";
import { TbTruckDelivery } from "react-icons/tb";
import { CgUnavailable } from "react-icons/cg";
import { useStoreSettings } from "@/satelite/services/storeSettingsService";
import { calculateEuclideanDistance } from "@/utils/distance";
import { FaStar, FaRegStar } from "react-icons/fa";
import { SectionDivider } from "@/components/ui/layout/SectionDivider";
import {
    useUserAddresses,
    useCreateUserAddress,
    useUpdateUserAddress,
    useDeleteUserAddress,
    useSetDefaultUserAddress,
} from "@/satelite/services/userAddressService";
import { useUser } from "@/satelite/services/userService";
import { UserAddress, UserAddressInput } from "@/types/user/userAddress";
import AddressFormModal from "./AddressFormModal";
import ConfirmModal from "@/components/modal/ConfirmModal";

// Tampilkan "500 m" untuk < 1 km, selebihnya "1.9 km".
const formatDistance = (km: number) =>
    km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

// Bagian daftar alamat di profil: lihat alamat tersimpan, tambah/ubah/hapus, dan
// menetapkan alamat default. Membuka AddressFormModal untuk tambah/ubah.
export default function AddressSection() {
    const t = useTranslations("profile.address");
    const queryClient = useQueryClient();

    const { data: userData } = useUser();
    const { data: addressesData, isPending: isLoadingAddresses } = useUserAddresses();
    const { mutate: createAddress, isPending: isCreating } = useCreateUserAddress();
    const { mutate: updateAddress, isPending: isUpdating } = useUpdateUserAddress();
    const { mutate: deleteAddress, isPending: isDeleting } = useDeleteUserAddress();
    const { mutate: setDefault } = useSetDefaultUserAddress();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const addresses = addressesData?.data ?? [];

    const { data: storeData } = useStoreSettings();
    const store = storeData?.data ?? null;

    const handleOpenAdd = () => {
        if (addresses.length >= 5) {
            toast.warning(t("maxReached"));
            return;
        }
        setEditingAddress(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (address: UserAddress) => {
        setEditingAddress(address);
        setIsModalOpen(true);
    };

    const handleSubmit = (data: UserAddressInput) => {
        if (editingAddress) {
            updateAddress(
                { id: editingAddress.id, data },
                {
                    onSuccess: () => {
                        toast.success(t("updateSuccess"));
                        queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
                        setIsModalOpen(false);
                    },
                    onError: (error: Error) => {
                        const msg = error?.message || t("updateFail");
                        toast.error(msg);
                    },
                }
            );
        } else {
            createAddress(data, {
                onSuccess: () => {
                    toast.success(t("addSuccess"));
                    queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
                    setIsModalOpen(false);
                },
                onError: (error: Error) => {
                    const msg = error?.message || t("addFail");
                    toast.error(msg);
                },
            });
        }
    };

    const confirmDelete = () => {
        if (!deleteId) return;
        deleteAddress(deleteId, {
            onSuccess: () => {
                toast.success(t("deleteSuccess"));
                queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
                setDeleteId(null);
            },
            onError: () => {
                toast.error(t("deleteFail"));
                setDeleteId(null);
            },
        });
    };

    const handleSetDefault = (id: string) => {
        setDefault(id, {
            onSuccess: () => {
                toast.success(t("defaultSuccess"));
                queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
            },
            onError: () => toast.error(t("defaultFail")),
        });
    };

    return (
        <div className="w-full space-y-6">
            <SectionDivider label={t("title")} />
            <p className="text-sm text-gray-500">{t("subtitle")}</p>

            {/* Address list */}
            {isLoadingAddresses ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-28" />
                    ))}
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                    <FiMapPin className="mx-auto text-gray-300 mb-3" size={40} />
                    <p className="text-gray-500 font-medium">{t("empty")}</p>
                    <p className="text-gray-400 text-sm">{t("emptyDesc")}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {addresses.map((addr) => {
                        const hasCoords = addr.latitude !== 0 && addr.longitude !== 0;
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${addr.latitude},${addr.longitude}`;
                        // Jarak dari toko (dinamis dari store settings), merah bila di luar jangkauan kirim.
                        const distanceKm =
                            hasCoords && store
                                ? calculateEuclideanDistance(addr.latitude, addr.longitude, store.storeLatitude, store.storeLongitude)
                                : null;
                        const tooFar = distanceKm !== null && !!store && distanceKm > store.maxDeliveryRadius;
                        return (
                            <div
                                key={addr.id}
                                className={`group flex flex-col sm:flex-row overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
                                    addr.isDefault
                                        ? "border-emerald-300 ring-1 ring-emerald-200"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                {/* Info side */}
                                <div className="flex-1 min-w-0 p-4 sm:p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                                            <span className="font-semibold text-gray-800">{addr.label}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                                <FiPhone size={13} className="shrink-0 text-gray-400" />
                                                {addr.phone}
                                            </span>
                                            {addr.isDefault && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                                                    <FaStar size={10} />
                                                    {t("default")}
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            {!addr.isDefault && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetDefault(addr.id)}
                                                    className="p-2 rounded-full text-gray-400 hover:bg-amber-50 hover:text-amber-500 transition"
                                                    title={t("setDefault")}
                                                >
                                                    <FaRegStar size={16} />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEdit(addr)}
                                                className="p-2 rounded-full text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition"
                                                title={t("edit")}
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteId(addr.id)}
                                                className="p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                                                title={t("delete")}
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-3 space-y-1.5">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FiUser size={14} className="shrink-0 text-gray-400" />
                                            <span className="truncate">{addr.recipientName}</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm text-gray-600">
                                            <FiMapPin size={14} className="shrink-0 mt-0.5 text-gray-400" />
                                            <span className="line-clamp-2">{addr.address}</span>
                                        </div>
                                        {hasCoords && (
                                            <p className="pl-1 text-xs text-gray-400">
                                                {addr.latitude.toFixed(6)}, {addr.longitude.toFixed(6)}
                                            </p>
                                        )}
                                    </div>

                                    {distanceKm !== null && (
                                        <div
                                            className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                                                tooFar
                                                    ? "bg-red-50 text-red-600 ring-red-100"
                                                    : "bg-emerald-50 text-emerald-600 ring-emerald-100"
                                            }`}
                                        >
                                            {tooFar ? (
                                                <CgUnavailable size={14} className="shrink-0" />
                                            ) : (
                                                <TbTruckDelivery size={14} className="shrink-0" />
                                            )}
                                            <span>
                                                {formatDistance(distanceKm)} {t("fromStore")} ({tooFar ? t("outOfRange") : t("inRange")})
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Map thumbnail side (a bit larger) */}
                                {hasCoords && (
                                    <div className="h-44 p-3 sm:h-auto sm:w-64 sm:min-h-[210px] shrink-0">
                                        <div className="relative h-full w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                            <iframe
                                                src={`https://www.google.com/maps?q=${addr.latitude},${addr.longitude}&z=16&output=embed`}
                                                className="absolute inset-0 h-full w-full"
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                title={`Location - ${addr.label}`}
                                            />
                                            <a
                                                href={mapsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group/map absolute inset-0 flex items-end justify-center bg-black/0 hover:bg-black/10 transition"
                                                title={t("viewOnMaps")}
                                            >
                                                <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-gray-700 shadow opacity-0 group-hover/map:opacity-100 transition">
                                                    <FiExternalLink size={11} />
                                                    {t("viewOnMaps")}
                                                </span>
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add new (bottom, outlined), disembunyikan saat sudah 5 alamat, muncul lagi bila dihapus */}
            {addresses.length < 5 ? (
                <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-500 py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
                >
                    <FiPlus size={16} />
                    {t("addNew")}
                </button>
            ) : (
                <p className="text-center text-xs text-gray-400">{t("maxReached")}</p>
            )}

            {/* Address Form Modal */}
            <AddressFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                editingAddress={editingAddress}
                isPending={isCreating || isUpdating}
                defaultRecipientName={userData?.data?.name ?? ""}
                defaultPhone={userData?.data?.phone ?? ""}
            />

            {/* Konfirmasi hapus alamat */}
            <ConfirmModal
                open={!!deleteId}
                loading={isDeleting}
                title={t("deleteTitle")}
                message={t("deleteConfirm")}
                confirmButtonText={t("delete")}
                cancelButtonText={t("cancel")}
                confirmVariant="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}
