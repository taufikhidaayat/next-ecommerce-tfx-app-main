"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    FiUser,
    FiPhone,
    FiMapPin,
    FiChevronRight,
    FiHome,
    FiBriefcase,
    FiTag,
    FiCheckCircle,
} from "react-icons/fi";
import { FaSpinner, FaTimes } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { UserAddress, UserAddressInput } from "@/types/user/userAddress";
import { RegionSelection, EMPTY_REGION } from "@/types/wilayah";
import RegionPickerModal from "./RegionPickerModal";
import LocationSearchModal from "./LocationSearchModal";
import { useBottomSheetDrag } from "@/hooks/useBottomSheetDrag";
import { toE164Phone, isValidIdPhone } from "@/utils/phone";

// emsifa returns region names in UPPERCASE, present them in Title Case.
const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

interface AddressFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserAddressInput) => void;
    editingAddress?: UserAddress | null;
    isPending: boolean;
    defaultRecipientName?: string;
    defaultPhone?: string;
}

// Modal form tambah/ubah alamat pengiriman. Cukup kompleks: memilih wilayah bertingkat
// (kabupaten→kecamatan→kelurahan via RegionPickerModal), menaruh titik di peta
// (PinpointMap/LocationSearchModal), dan mengisi detail. editingAddress != null = mode ubah.
export default function AddressFormModal({
    isOpen,
    onClose,
    onSubmit,
    editingAddress,
    isPending,
    defaultRecipientName = "",
    defaultPhone = "",
}: AddressFormModalProps) {
    const t = useTranslations("profile.address");

    const { sheetRef, bodyRef, sheetStyle, dragHandlers } = useBottomSheetDrag({
        isOpen,
        onClose,
        canClose: () => !isPending,
    });

    const [recipientName, setRecipientName] = useState("");
    const [phone, setPhone] = useState("");
    const [region, setRegion] = useState<RegionSelection>(EMPTY_REGION);
    const [street, setStreet] = useState("");
    const [detail, setDetail] = useState("");
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);

    const [labelMode, setLabelMode] = useState<"Rumah" | "Kantor" | "custom">("Rumah");
    const [customLabel, setCustomLabel] = useState("");
    const [isDefault, setIsDefault] = useState(false);

    const [isRegionOpen, setIsRegionOpen] = useState(false);
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [error, setError] = useState("");

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        if (editingAddress) {
            setRecipientName(editingAddress.recipientName);
            // Tampilkan dalam format kanonik +62 (rapikan data lama bila perlu).
            setPhone(toE164Phone(editingAddress.phone) || editingAddress.phone);
            // Prefer the raw street if stored (new format); fall back to the full
            // address for legacy rows that only kept the composed string.
            setStreet(editingAddress.street ?? editingAddress.address);
            setDetail(editingAddress.detail ?? "");
            setRegion(
                editingAddress.regencyId
                    ? {
                          ...EMPTY_REGION,
                          regencyId: editingAddress.regencyId,
                          regencyName: editingAddress.regencyName ?? "",
                          districtId: editingAddress.districtId ?? "",
                          districtName: editingAddress.districtName ?? "",
                          villageId: editingAddress.villageId ?? "",
                          villageName: editingAddress.villageName ?? "",
                          postalCode: editingAddress.postalCode ?? "",
                      }
                    : EMPTY_REGION,
            );
            setLatitude(editingAddress.latitude);
            setLongitude(editingAddress.longitude);
            setIsDefault(editingAddress.isDefault);
            if (editingAddress.label === "Rumah" || editingAddress.label === "Kantor") {
                setLabelMode(editingAddress.label);
                setCustomLabel("");
            } else {
                setLabelMode("custom");
                setCustomLabel(editingAddress.label);
            }
        } else {
            // New address: prefill contact from the saved profile for convenience.
            setRecipientName(defaultRecipientName);
            // Autofill dari profil → seragamkan ke +62 agar lolos validasi
            // walau data profil tersimpan dalam format lama (mis. "+62081…").
            setPhone(toE164Phone(defaultPhone));
            setStreet("");
            setDetail("");
            setRegion(EMPTY_REGION);
            setLatitude(null);
            setLongitude(null);
            setIsDefault(false);
            setLabelMode("Rumah");
            setCustomLabel("");
        }
        setError("");
    }, [editingAddress, isOpen, defaultRecipientName, defaultPhone]);

    if (!isOpen || !mounted) return null;

    const hasLocation = latitude !== null && longitude !== null;
    const hasRegion = !!region.regencyId;
    const regionSummary = hasRegion
        ? `${region.province}, ${titleCase(region.regencyName)}, ${titleCase(region.districtName)}, ${region.postalCode}`
        : "";

    const composeAddress = (): string => {
        const parts: string[] = [];
        if (street.trim()) parts.push(street.trim());
        // When the street already holds the full map address (it contains the
        // regency name), skip appending the structured tail to avoid duplication.
        const streetHasRegion =
            hasRegion && street.toLowerCase().includes(region.regencyName.toLowerCase());
        if (hasRegion && !streetHasRegion) {
            parts.push(`Kel. ${titleCase(region.villageName)}`);
            parts.push(`Kec. ${titleCase(region.districtName)}`);
            parts.push(titleCase(region.regencyName));
            parts.push("DI Yogyakarta");
        }
        let composed = parts.join(", ");
        if (hasRegion && !streetHasRegion && region.postalCode) composed += ` ${region.postalCode}`;
        // Catatan/patokan diletakkan paling akhir dalam tanda kurung.
        if (detail.trim()) composed += ` (${detail.trim()})`;
        return composed;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!recipientName.trim() || !phone.trim()) {
            setError(t("recipientName") + " & " + t("phone"));
            return;
        }
        // Terima format apa pun (08…, +62…, 62…), dinormalisasi lalu divalidasi.
        if (!isValidIdPhone(phone)) {
            setError(t("phoneInvalid"));
            return;
        }
        // Region (wilayah) is optional, the full address is derived from the map pin.
        if (!street.trim()) {
            setError(t("streetRequired"));
            return;
        }
        if (!hasLocation) {
            setError(t("pinpointRequired"));
            return;
        }

        const label =
            labelMode === "custom" ? customLabel.trim() || "Lainnya" : labelMode;

        onSubmit({
            label,
            recipientName: recipientName.trim(),
            phone: toE164Phone(phone),
            address: composeAddress(),
            // Simpan bagian terstruktur agar form edit bisa di-prefill nanti.
            street: street.trim(),
            detail: detail.trim() || null,
            regencyId: region.regencyId || null,
            regencyName: region.regencyName || null,
            districtId: region.districtId || null,
            districtName: region.districtName || null,
            villageId: region.villageId || null,
            villageName: region.villageName || null,
            postalCode: region.postalCode || null,
            latitude: latitude as number,
            longitude: longitude as number,
            isDefault,
        });
    };

    const inputClass =
        "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition";

    return createPortal(
        <>
            {/* Backdrop: penuhi lebar window termasuk gutter scrollbar */}
            <div className="fixed top-0 left-0 w-screen h-[100dvh] z-[60] bg-black/40 animate-backdrop-in" />
            {/* Lapis pemusat: inset-0 mengecualikan gutter → modal tetap center secara visual */}
            <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <div
                    ref={sheetRef}
                    style={sheetStyle}
                    className="flex w-full max-w-xl flex-col rounded-t-3xl sm:rounded-3xl bg-gray-50 shadow-2xl sm:max-h-[94vh] overflow-hidden sm:animate-zoom-in"
                >
                    {/* Grab zone, tarik untuk menutup di mobile (handle + header) */}
                    <div className="shrink-0 touch-none select-none" {...dragHandlers}>
                        {/* Drag handle, affordance bottom-sheet (mobile only) */}
                        <div className="sm:hidden flex justify-center bg-white pt-3 pb-2">
                            <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                        </div>
                        {/* Header */}
                        <div className="relative flex items-center justify-center bg-white px-5 pt-3 pb-4 sm:pt-6 sm:pb-5 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-green-700 text-center">
                                {editingAddress ? t("editTitle") : t("addTitle")}
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isPending}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Close"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
                        <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4">
                            {/* Card: Contact */}
                            <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    {t("contactSection")}
                                </p>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        {t("recipientName")}
                                    </label>
                                    <div className="relative">
                                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                        <input
                                            type="text"
                                            value={recipientName}
                                            onChange={(e) => setRecipientName(e.target.value)}
                                            placeholder={t("recipientNamePlaceholder")}
                                            className={`${inputClass} pl-9`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t("phone")}</label>
                                    <div className="relative">
                                        <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                        <input
                                            type="tel"
                                            inputMode="tel"
                                            value={phone}
                                            onChange={(e) => {
                                                // Allow digits and a single leading "+" (for +62)
                                                let v = e.target.value.replace(/[^\d+]/g, "");
                                                v = v.replace(/(?!^)\+/g, "");
                                                setPhone(v);
                                            }}
                                            placeholder={t("phonePlaceholder")}
                                            className={`${inputClass} pl-9`}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Card: Address */}
                            <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    {t("addressSection")}
                                </p>

                                {/* Region picker trigger */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t("region")}</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsRegionOpen(true)}
                                        className="flex w-full items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
                                    >
                                        <span
                                            className={`flex-1 text-sm ${hasRegion ? "text-gray-800" : "text-gray-400"}`}
                                        >
                                            {regionSummary || t("regionPlaceholder")}
                                        </span>
                                        <FiChevronRight className="shrink-0 text-gray-400" size={18} />
                                    </button>
                                </div>

                                {/* Street + location: tapping opens the search → map-lock flow */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t("street")}</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsLocationOpen(true)}
                                        className="flex w-full items-start gap-2.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
                                    >
                                        <FiMapPin className="mt-0.5 shrink-0 text-emerald-600" size={16} />
                                        <div className="min-w-0 flex-1">
                                            {street ? (
                                                <>
                                                    <p className="line-clamp-2 text-sm text-gray-800">{street}</p>
                                                    {hasLocation && (
                                                        <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-600">
                                                            <FiCheckCircle size={12} />
                                                            {t("locationMarked")} · {latitude!.toFixed(5)}, {longitude!.toFixed(5)}
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-sm text-gray-400">{t("streetEmpty")}</p>
                                            )}
                                        </div>
                                        <FiChevronRight className="mt-0.5 shrink-0 text-gray-400" size={18} />
                                    </button>
                                </div>

                                {/* Detail */}
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">{t("detail")}</label>
                                    <input
                                        type="text"
                                        value={detail}
                                        onChange={(e) => setDetail(e.target.value)}
                                        placeholder={t("detailPlaceholder")}
                                        className={inputClass}
                                    />
                                </div>
                            </section>

                            {/* Card: Settings */}
                            <section className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    {t("settingsSection")}
                                </p>

                                {/* Mark as */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">{t("markAs")}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {([
                                            { key: "Rumah" as const, label: t("labelHome"), icon: <FiHome size={14} /> },
                                            { key: "Kantor" as const, label: t("labelOffice"), icon: <FiBriefcase size={14} /> },
                                            { key: "custom" as const, label: t("labelOther"), icon: <FiTag size={14} /> },
                                        ]).map((opt) => (
                                            <button
                                                key={opt.key}
                                                type="button"
                                                onClick={() => setLabelMode(opt.key)}
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                                                    labelMode === opt.key
                                                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                                }`}
                                            >
                                                {opt.icon}
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                    {labelMode === "custom" && (
                                        <input
                                            type="text"
                                            value={customLabel}
                                            onChange={(e) => setCustomLabel(e.target.value)}
                                            placeholder={t("labelOtherPlaceholder")}
                                            className={`${inputClass} mt-2`}
                                        />
                                    )}
                                </div>

                                {/* Default toggle */}
                                <button
                                    type="button"
                                    onClick={() => setIsDefault((v) => !v)}
                                    className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3"
                                >
                                    <span className="text-sm font-medium text-gray-700">{t("setDefault")}</span>
                                    <span
                                        className={`relative h-6 w-11 rounded-full transition ${
                                            isDefault ? "bg-emerald-600" : "bg-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                                                isDefault ? "left-[1.375rem]" : "left-0.5"
                                            }`}
                                        />
                                    </span>
                                </button>
                            </section>

                            {error && (
                                <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 border-t border-gray-100 bg-white px-4 py-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {isPending ? (
                                    <>
                                        <FaSpinner className="animate-spin" /> {t("saving")}
                                    </>
                                ) : (
                                    t("saveAddress")
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Nested modals */}
            <RegionPickerModal
                isOpen={isRegionOpen}
                value={region}
                onClose={() => setIsRegionOpen(false)}
                onConfirm={(sel) => {
                    setRegion(sel);
                    setIsRegionOpen(false);
                    setError("");
                }}
            />
            <LocationSearchModal
                isOpen={isLocationOpen}
                initialStreet={street}
                initialLat={latitude}
                initialLng={longitude}
                onClose={() => setIsLocationOpen(false)}
                onConfirm={(streetText, lat, lng, matchedRegion) => {
                    setStreet(streetText);
                    setLatitude(lat);
                    setLongitude(lng);
                    // Auto-fill the region dropdown from the chosen map pin (DIY only).
                    if (matchedRegion) setRegion(matchedRegion);
                    setIsLocationOpen(false);
                    setError("");
                }}
            />
        </>,
        document.body
    );
}
