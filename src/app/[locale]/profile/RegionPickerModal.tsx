"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { FiSearch, FiCheck, FiChevronRight, FiRotateCcw } from "react-icons/fi";
import { FaSpinner, FaTimes } from "react-icons/fa";
import { MdMyLocation } from "react-icons/md";
import { IoChevronBackOutline } from "react-icons/io5";
import {
    useRegencies,
    useDistricts,
    useVillages,
    fetchRegencies,
    fetchDistricts,
    fetchVillages,
    fetchKodepos,
} from "@/satelite/services/wilayahService";
import { DIY_PROVINCE, RegionSelection, EMPTY_REGION, WilayahItem } from "@/types/wilayah";
import { useBottomSheetDrag } from "@/hooks/useBottomSheetDrag";

type Step = "regency" | "district" | "village" | "postal";

interface RegionPickerModalProps {
    isOpen: boolean;
    value: RegionSelection;
    onClose: () => void;
    onConfirm: (value: RegionSelection) => void;
}

export default function RegionPickerModal({ isOpen, value, onClose, onConfirm }: RegionPickerModalProps) {
    const t = useTranslations("profile.address");

    const { sheetRef, bodyRef, sheetStyle, dragHandlers } = useBottomSheetDrag({
        isOpen,
        onClose,
        sheetVh: 0.88,
    });

    const [step, setStep] = useState<Step>("regency");
    const [regency, setRegency] = useState<WilayahItem | null>(null);
    const [district, setDistrict] = useState<WilayahItem | null>(null);
    const [village, setVillage] = useState<WilayahItem | null>(null);
    const [postalCode, setPostalCode] = useState("");
    const [query, setQuery] = useState("");
    const [isLocating, setIsLocating] = useState(false);
    const [locateError, setLocateError] = useState("");
    const [permState, setPermState] = useState<"unknown" | "granted" | "prompt" | "denied">("unknown");
    const [isPostalLoading, setIsPostalLoading] = useState(false);
    const [postalOptions, setPostalOptions] = useState<string[]>([]);
    const [manualPostal, setManualPostal] = useState(false);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Seed state from the existing selection each time the modal opens.
    useEffect(() => {
        if (!isOpen) return;
        if (value.regencyId) {
            setRegency({ id: value.regencyId, name: value.regencyName });
            setDistrict(value.districtId ? { id: value.districtId, name: value.districtName } : null);
            setVillage(value.villageId ? { id: value.villageId, name: value.villageName } : null);
            setPostalCode(value.postalCode);
            setStep("regency");
        } else {
            setRegency(null);
            setDistrict(null);
            setVillage(null);
            setPostalCode("");
            setStep("regency");
        }
        setQuery("");
        setLocateError("");
        setIsLocating(false);
        setPermState("unknown");
        setPostalOptions([]);
        // Saat mengedit alamat lama (kode pos sudah ada), izinkan tampil sebagai input manual.
        setManualPostal(!!value.postalCode);
    }, [isOpen, value]);

    // Pantau perubahan izin lokasi (granted/prompt) — tapi jangan preemptif blokir tombol
    // hanya karena query() melaporkan "denied". Biarkan user coba dulu, baru tampil error
    // kalau getCurrentPosition benar-benar gagal.
    useEffect(() => {
        if (!isOpen || !navigator.permissions) return;
        let pr: PermissionStatus | null = null;
        navigator.permissions
            .query({ name: "geolocation" as PermissionName })
            .then((r) => {
                pr = r;
                if (r.state === "granted") setPermState("granted");
                r.addEventListener("change", () => {
                    if (r.state === "granted" || r.state === "prompt") setPermState(r.state);
                });
            })
            .catch(() => {});
        return () => { pr?.removeEventListener("change", () => {}); };
    }, [isOpen]);

    const regencies = useRegencies();
    const districts = useDistricts(regency?.id ?? null);
    const villages = useVillages(district?.id ?? null);

    const current = step === "regency" ? regencies : step === "district" ? districts : villages;

    const filtered = useMemo(() => {
        const items = (current.data ?? []) as WilayahItem[];
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((i) => i.name.toLowerCase().includes(q));
    }, [current.data, query]);

    if (!isOpen || !mounted) return null;

    const goTo = (next: Step) => {
        setStep(next);
        setQuery("");
    };

    // Mengganti wilayah di atasnya membatalkan pilihan di bawahnya — termasuk kode pos,
    // supaya tidak ada sisa kode pos lama yang nyangkut di breadcrumb.
    const resetPostal = () => {
        setPostalCode("");
        setPostalOptions([]);
        setManualPostal(false);
    };
    // Kosongkan semua pilihan & kembali ke langkah awal (Kota/Kabupaten).
    const handleReset = () => {
        setRegency(null);
        setDistrict(null);
        setVillage(null);
        resetPostal();
        setQuery("");
        setLocateError("");
        setStep("regency");
    };
    const selectRegency = (item: WilayahItem) => {
        setRegency(item);
        setDistrict(null);
        setVillage(null);
        resetPostal();
        goTo("district");
    };
    const selectDistrict = (item: WilayahItem) => {
        setDistrict(item);
        setVillage(null);
        resetPostal();
        goTo("village");
    };
    const selectVillage = (item: WilayahItem) => {
        setVillage(item);
        goTo("postal");
        // emsifa tak punya kode pos → ambil dari API kodepos berdasarkan nama kelurahan,
        // lalu cocokkan dengan kecamatan/kabupaten yang dipilih agar tepat.
        void autofillPostal(item, district, regency);
    };

    const autofillPostal = async (
        vil: WilayahItem,
        dis: WilayahItem | null,
        reg: WilayahItem | null,
    ) => {
        // Normalisasi kuat: huruf kecil, buang prefix "kabupaten/kota", buang spasi & tanda baca.
        const norm = (s: string) =>
            s.toLowerCase().replace(/^(kabupaten|kota)\s+/, "").replace(/[^a-z0-9]/g, "");
        setIsPostalLoading(true);
        setPostalCode("");
        setPostalOptions([]);
        setManualPostal(false);
        try {
            const results = await fetchKodepos(vil.name);
            // Cocokkan kelurahan + kecamatan + kabupaten — nama kelurahan sering kembar
            // di provinsi lain, jadi jangan menebak agar kode pos tidak salah.
            const matches = results.filter(
                (r) =>
                    norm(r.village) === norm(vil.name) &&
                    (!dis || norm(r.district) === norm(dis.name)) &&
                    (!reg || norm(r.regency) === norm(reg.name)),
            );
            // Satu kelurahan bisa punya beberapa kode pos → tampilkan semua sebagai pilihan.
            const codes = Array.from(
                new Set(
                    matches
                        .map((r) => String(r.code).replace(/\D/g, "").slice(0, 5))
                        .filter((c) => c.length === 5),
                ),
            );
            setPostalOptions(codes);
            // Tidak ada di dataset → fallback ketik manual.
            if (codes.length === 0) setManualPostal(true);
        } catch {
            setManualPostal(true);
        } finally {
            setIsPostalLoading(false);
        }
    };

    // GPS → reverse-geocode → best-effort auto-match the DIY region (user can still adjust).
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocateError(t("locateDenied"));
            return;
        }
        setIsLocating(true);
        setLocateError("");
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                        { headers: { "Accept-Language": "id" } }
                    );
                    const data = await res.json();
                    const addr = (data?.address ?? {}) as Record<string, string>;
                    const values = Object.values(addr)
                        .filter((v) => typeof v === "string")
                        .map((v) => v.toLowerCase());
                    const strip = (s: string) => s.toLowerCase().replace(/^(kabupaten|kota)\s+/, "").trim();
                    const matchesAny = (name: string) => {
                        const n = strip(name);
                        return values.some((v) => v.includes(n) || n.includes(v));
                    };

                    // Match regency from kabupaten/kota-level fields only (avoids the
                    // province name "...Yogyakarta" wrongly matching "KOTA YOGYAKARTA").
                    const regencyHints = [addr.county, addr.city, addr.city_district, addr.municipality, addr.state_district]
                        .filter((v): v is string => typeof v === "string")
                        .map((v) => v.toLowerCase());
                    const regs = await fetchRegencies();
                    const reg =
                        regs.find((r) => regencyHints.some((h) => h.includes(strip(r.name)) || strip(r.name).includes(h))) ??
                        null;
                    if (!reg) {
                        setLocateError(t("locateOutside"));
                        setIsLocating(false);
                        return;
                    }

                    const dts = await fetchDistricts(reg.id);
                    const dis = dts.find((d) => matchesAny(d.name)) ?? null;
                    let vil: WilayahItem | null = null;
                    if (dis) {
                        const vils = await fetchVillages(dis.id);
                        vil = vils.find((v) => matchesAny(v.name)) ?? null;
                    }

                    const postal = addr.postcode ? String(addr.postcode).replace(/\D/g, "").slice(0, 5) : "";

                    setRegency(reg);
                    setDistrict(dis);
                    setVillage(vil);
                    if (postal) setPostalCode(postal);
                    setStep(vil ? "postal" : dis ? "village" : "district");
                    setQuery("");
                    setIsLocating(false);

                    // Deteksi lengkap (kabupaten + kecamatan + kelurahan + kode pos) →
                    // langsung konfirmasi & tutup modal tanpa perlu klik manual.
                    if (dis && vil && postal.length === 5) {
                        onConfirm({
                            ...EMPTY_REGION,
                            regencyId: reg.id,
                            regencyName: reg.name,
                            districtId: dis.id,
                            districtName: dis.name,
                            villageId: vil.id,
                            villageName: vil.name,
                            postalCode: postal,
                        });
                    }
                } catch {
                    setLocateError(t("regionError"));
                    setIsLocating(false);
                }
            },
            (err) => {
                setIsLocating(false);
                // Pesan sesuai penyebab — jangan selalu bilang "diblokir".
                if (err.code === err.PERMISSION_DENIED) {
                    setPermState("denied");
                    setLocateError(t("locateDenied"));
                } else if (err.code === err.TIMEOUT) {
                    setLocateError(t("locateTimeout"));
                } else {
                    setLocateError(t("locateUnavailable"));
                }
            },
            // Timeout panjang: hitungan timeout sebaiknya tak mematikan prompt saat
            // user masih memutuskan izin. 30 dtk memberi ruang sebelum dianggap gagal.
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
        );
    };

    // Override kode pos dipakai saat user klik chip (state belum ter-update saat itu).
    const handleConfirm = (postalOverride?: string) => {
        const postal = (postalOverride ?? postalCode).trim();
        if (!regency || !district || !village || postal.length < 5) return;
        const selection: RegionSelection = {
            ...EMPTY_REGION,
            regencyId: regency.id,
            regencyName: regency.name,
            districtId: district.id,
            districtName: district.name,
            villageId: village.id,
            villageName: village.name,
            postalCode: postal,
        };
        onConfirm(selection);
    };

    const steps: { key: Step; label: string; selected: string; enabled: boolean }[] = [
        { key: "regency", label: t("regencyStep"), selected: regency?.name ?? "", enabled: true },
        { key: "district", label: t("districtStep"), selected: district?.name ?? "", enabled: !!regency },
        { key: "village", label: t("villageStep"), selected: village?.name ?? "", enabled: !!district },
        { key: "postal", label: t("postalCode"), selected: postalCode, enabled: !!village },
    ];

    return createPortal(
        <>
        {/* Backdrop: penuhi lebar window termasuk gutter scrollbar */}
        <div className="fixed top-0 left-0 w-screen h-[100dvh] z-[70] bg-black/50 animate-backdrop-in" />
        {/* Lapis pemusat: inset-0 mengecualikan gutter → modal tetap center secara visual */}
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
                ref={sheetRef}
                style={sheetStyle}
                className="flex w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl sm:h-[80vh] overflow-hidden sm:animate-zoom-in"
            >
                {/* Grab zone — tarik untuk menutup di mobile (handle + header) */}
                <div className="shrink-0 touch-none select-none" {...dragHandlers}>
                    {/* Drag handle — affordance bottom-sheet (mobile only) */}
                    <div className="sm:hidden flex justify-center pt-3 pb-2">
                        <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                    </div>
                    {/* Header */}
                    <div className="relative flex items-center justify-center px-5 pt-3 pb-4 sm:pt-6 sm:pb-5 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-green-700 text-center">{t("regionTitle")}</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                            aria-label="Close"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>
                </div>

                {/* Fixed province + step breadcrumb */}
                <div className="px-5 pt-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                            <FiCheck size={12} /> {DIY_PROVINCE.name}
                        </div>
                        {(regency || district || village || postalCode) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                title={t("reset")}
                                aria-label={t("reset")}
                                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 active:scale-95"
                            >
                                <FiRotateCcw size={14} />
                            </button>
                        )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-1.5 text-xs">
                        {steps.map((s, idx) => (
                            <div key={s.key} className="flex items-center gap-1">
                                {idx > 0 && <FiChevronRight size={12} className="text-gray-300" />}
                                <button
                                    type="button"
                                    disabled={!s.enabled}
                                    onClick={() => s.enabled && goTo(s.key)}
                                    className={`rounded-lg px-2 py-1 font-medium transition ${
                                        step === s.key
                                            ? "bg-emerald-600 text-white"
                                            : s.selected
                                              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                              : "text-gray-400"
                                    } ${!s.enabled ? "cursor-not-allowed" : ""}`}
                                >
                                    {s.selected || s.label}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Use current location — hanya saat belum mulai memilih (belum ada kabupaten) */}
                    {!regency && (
                        <>
                            <button
                                type="button"
                                onClick={handleUseCurrentLocation}
                                disabled={isLocating}
                                className="group mt-3 flex w-full items-center gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50/60 px-3.5 py-2.5 text-left transition hover:border-emerald-300 hover:shadow-sm hover:shadow-emerald-600/5 disabled:opacity-60"
                            >
                                <span className="relative h-8 w-8 shrink-0 rounded-full bg-emerald-600 shadow-sm shadow-emerald-600/30">
                                    <span className="absolute inset-0 flex items-center justify-center text-white">
                                        {isLocating ? (
                                            <FaSpinner className="animate-spin" size={15} />
                                        ) : (
                                            <MdMyLocation size={16} />
                                        )}
                                    </span>
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-semibold text-emerald-800">
                                        {isLocating ? t("detectingLocation") : t("useMyLocation")}
                                    </span>
                                    <span className="block truncate text-xs text-emerald-600/90">
                                        {t("useCurrentLocationDesc")}
                                    </span>
                                </span>
                                {!isLocating && (
                                    <FiChevronRight
                                        className="shrink-0 text-emerald-400 transition group-hover:translate-x-0.5"
                                        size={18}
                                    />
                                )}
                            </button>
                            {(permState === "denied" || locateError) && (
                                <div className="mt-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-600 space-y-1">
                                    {permState === "denied" ? (
                                        <>
                                            <p className="font-semibold">Akses lokasi diblokir oleh browser.</p>
                                            <p className="text-red-500 leading-relaxed">
                                                Ketuk ikon kunci/info di address bar → <strong>Izin situs</strong> → <strong>Lokasi</strong> → ubah ke <strong>Izinkan</strong>, lalu coba lagi.
                                            </p>
                                        </>
                                    ) : (
                                        <p className="leading-relaxed">{locateError}</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Body */}
                {step === "postal" ? (
                    <div className="flex-1 px-5 py-6 space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t("postalCode")}</label>

                            {isPostalLoading ? (
                                <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-emerald-600">
                                    <FaSpinner className="animate-spin" size={15} /> {t("postalSearching")}
                                </div>
                            ) : !manualPostal && postalOptions.length > 0 ? (
                                <>
                                    {/* Klik kode pos = langsung konfirmasi & tutup (tanpa tombol terpisah) */}
                                    <p className="mb-2 text-xs text-gray-500">{t("postalPick")}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {postalOptions.map((code) => (
                                            <button
                                                key={code}
                                                type="button"
                                                onClick={() => {
                                                    setPostalCode(code);
                                                    handleConfirm(code);
                                                }}
                                                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold tracking-widest text-gray-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95"
                                            >
                                                {code}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setManualPostal(true);
                                            setPostalCode("");
                                        }}
                                        className="mt-3 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                                    >
                                        {t("postalManual")}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={postalCode}
                                        autoFocus
                                        onChange={(e) => {
                                            const v = e.target.value.replace(/\D/g, "").slice(0, 5);
                                            setPostalCode(v);
                                            // Kode pos Indonesia tepat 5 digit → begitu lengkap, langsung konfirmasi & tutup.
                                            if (v.length === 5) handleConfirm(v);
                                        }}
                                        placeholder={t("postalCodePlaceholder")}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm tracking-widest text-gray-900 placeholder:tracking-normal placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                                    />
                                    {postalOptions.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setManualPostal(false);
                                                setPostalCode("");
                                            }}
                                            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                                        >
                                            <IoChevronBackOutline size={14} />
                                            {t("postalBackToList")}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Search */}
                        <div className="px-5 pt-3 pb-2">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={t("regionSearchPlaceholder")}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">
                            {current.isLoading ? (
                                <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
                                    <FaSpinner className="animate-spin" /> {t("regionLoading")}
                                </div>
                            ) : current.isError ? (
                                <div className="py-12 text-center text-sm text-red-500">{t("regionError")}</div>
                            ) : filtered.length === 0 ? (
                                <div className="py-12 text-center text-sm text-gray-400">{t("regionEmpty")}</div>
                            ) : (
                                <ul>
                                    {filtered.map((item) => {
                                        const isActive =
                                            (step === "regency" && regency?.id === item.id) ||
                                            (step === "district" && district?.id === item.id) ||
                                            (step === "village" && village?.id === item.id);
                                        return (
                                            <li key={item.id}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        step === "regency"
                                                            ? selectRegency(item)
                                                            : step === "district"
                                                              ? selectDistrict(item)
                                                              : selectVillage(item)
                                                    }
                                                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                                                        isActive
                                                            ? "bg-emerald-50 font-medium text-emerald-700"
                                                            : "text-gray-700 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    <span>{item.name}</span>
                                                    {isActive && <FiCheck size={16} className="text-emerald-600" />}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </>
                )}

            </div>
        </div>
        </>,
        document.body
    );
}
