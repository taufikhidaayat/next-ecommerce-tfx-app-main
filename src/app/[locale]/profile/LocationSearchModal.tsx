"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { FiX, FiSearch, FiMapPin, FiCrosshair } from "react-icons/fi";
import { FaSpinner, FaTimes } from "react-icons/fa";
import { IoLocationSharp, IoChevronBack } from "react-icons/io5";
import { fetchRegencies, fetchDistricts, fetchVillages } from "@/satelite/services/wilayahService";
import { RegionSelection, EMPTY_REGION } from "@/types/wilayah";
import { useBottomSheetDrag } from "@/hooks/useBottomSheetDrag";
import ConfirmModal from "@/components/modal/ConfirmModal";

const PinpointMap = dynamic(() => import("@/components/maps/PinpointMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-gray-100" />,
});

// Fallback center: Yogyakarta. Bounding box biases search results to DI Yogyakarta.
const DIY_CENTER = { lat: -7.7956, lng: 110.3695 };
const DIY_VIEWBOX = "110.00,-7.55,110.85,-8.20"; // minLon,maxLat,maxLon,minLat

type SearchResult = { lat: string; lon: string; display_name: string };
type NearbyItem = { label: string; lat: number; lng: number };

// Trim Nominatim's long display_name down to the first few meaningful parts.
function formatLabel(displayName: string): string {
    return displayName
        .split(",")
        .slice(0, 3)
        .map((s) => s.trim())
        .filter(Boolean)
        .join(", ");
}

// Up to 5 nearby place suggestions from the device's GPS position, using only
// Nominatim (reverse for the exact spot + a small-radius search around it).
async function fetchNearby(lat: number, lng: number): Promise<NearbyItem[]> {
    try {
        const rev = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "id" } }
        );
        const revData = await rev.json();
        const list: NearbyItem[] = [];
        if (revData?.display_name) list.push({ label: formatLabel(revData.display_name), lat, lng });

        const a = (revData?.address ?? {}) as Record<string, string>;
        const areaQ = a.road || a.village || a.suburb || a.hamlet || a.town || a.city_district;
        if (areaQ) {
            const d = 0.012; // ~1.3 km box around the device
            const vb = `${lng - d},${lat + d},${lng + d},${lat - d}`;
            const sres = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&bounded=1&viewbox=${vb}&q=${encodeURIComponent(areaQ)}`,
                { headers: { "Accept-Language": "id" } }
            );
            const sdata = await sres.json();
            if (Array.isArray(sdata)) {
                for (const r of sdata) {
                    list.push({ label: formatLabel(r.display_name), lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
                }
            }
        }

        const seen = new Set<string>();
        const out: NearbyItem[] = [];
        for (const it of list) {
            const key = it.label.toLowerCase();
            if (it.label && !seen.has(key)) {
                seen.add(key);
                out.push(it);
            }
            if (out.length >= 5) break;
        }
        return out;
    } catch {
        return [];
    }
}

// Best-effort match of a Nominatim address to the DIY emsifa region IDs so the
// region dropdown can auto-fill from the chosen map pin. Returns null when the
// point is outside DI Yogyakarta or can't be matched.
async function matchRegion(addr: Record<string, string>): Promise<RegionSelection | null> {
    try {
        const values = Object.values(addr)
            .filter((v) => typeof v === "string")
            .map((v) => v.toLowerCase());
        const strip = (s: string) => s.toLowerCase().replace(/^(kabupaten|kota)\s+/, "").trim();
        const matchesAny = (name: string) => {
            const n = strip(name);
            return values.some((v) => v.includes(n) || n.includes(v));
        };

        const regencyHints = [addr.county, addr.city, addr.city_district, addr.municipality, addr.state_district]
            .filter((v): v is string => typeof v === "string")
            .map((v) => v.toLowerCase());
        const regs = await fetchRegencies();
        const reg =
            regs.find((r) => regencyHints.some((h) => h.includes(strip(r.name)) || strip(r.name).includes(h))) ?? null;
        if (!reg) return null;

        const dts = await fetchDistricts(reg.id);
        const dis = dts.find((d) => matchesAny(d.name)) ?? null;
        if (!dis) return null;

        const vils = await fetchVillages(dis.id);
        const vil = vils.find((v) => matchesAny(v.name)) ?? null;
        if (!vil) return null;

        const postal = addr.postcode ? String(addr.postcode).replace(/\D/g, "").slice(0, 5) : "";
        return {
            ...EMPTY_REGION,
            regencyId: reg.id,
            regencyName: reg.name,
            districtId: dis.id,
            districtName: dis.name,
            villageId: vil.id,
            villageName: vil.name,
            postalCode: postal,
        };
    } catch {
        return null;
    }
}

interface LocationSearchModalProps {
    isOpen: boolean;
    initialStreet: string;
    initialLat: number | null;
    initialLng: number | null;
    onClose: () => void;
    onConfirm: (street: string, lat: number, lng: number, region: RegionSelection | null) => void;
}

export default function LocationSearchModal({
    isOpen,
    initialStreet,
    initialLat,
    initialLng,
    onClose,
    onConfirm,
}: LocationSearchModalProps) {
    const t = useTranslations("profile.address");

    const { sheetRef, sheetStyle, dragHandlers } = useBottomSheetDrag({
        isOpen,
        onClose,
        canClose: () => !isConfirming,
    });

    const [stage, setStage] = useState<"search" | "map">("search");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(false);

    const [label, setLabel] = useState("");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [flyTarget, setFlyTarget] = useState({ ...DIY_CENTER, key: 0 });
    const [isLocating, setIsLocating] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [geoStatus, setGeoStatus] = useState<"idle" | "locating" | "done" | "denied">("idle");
    const [nearby, setNearby] = useState<NearbyItem[]>([]);

    // Status pin di peta: sedang digeser (sembunyikan label, fokus ikon) & sudah pernah digeser
    // (setelah berhenti hanya tampil judul, tanpa subteks "periksa kembali").
    const [isPinMoving, setIsPinMoving] = useState(false);
    const [pinMovedOnce, setPinMovedOnce] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Pantau perubahan izin lokasi — jangan preemptif set "denied" saat modal buka,
    // biarkan user coba dulu. Error hanya ditampilkan setelah getCurrentPosition gagal.
    useEffect(() => {
        if (!isOpen || !navigator.permissions) return;
        navigator.permissions
            .query({ name: "geolocation" as PermissionName })
            .then((r) => {
                r.addEventListener("change", () => {
                    if (r.state === "granted" || r.state === "prompt") setGeoStatus("idle");
                });
            })
            .catch(() => {});
    }, [isOpen]);

    // Detect the device location and load nearby place suggestions.
    const detectNearby = useCallback(() => {
        if (!navigator.geolocation) {
            setGeoStatus("denied");
            return;
        }
        setGeoStatus("locating");
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                const items = await fetchNearby(latitude, longitude);
                setNearby(items);
                setCoords((c) => c ?? { lat: latitude, lng: longitude });
                setGeoStatus("done");
            },
            (err) => setGeoStatus(err.code === 1 ? "denied" : "idle"),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    // Reset to the search stage every time the modal opens.
    useEffect(() => {
        if (!isOpen) return;
        setStage("search");
        setShowConfirmDialog(false);
        setQuery(initialStreet ?? "");
        setLabel(initialStreet ?? "");
        setResults([]);
        setNearby([]);
        setGeoStatus("idle");
        if (initialLat !== null && initialLng !== null) {
            setCoords({ lat: initialLat, lng: initialLng });
        } else {
            setCoords(null);
        }
    }, [isOpen, initialStreet, initialLat, initialLng]);

    // Auto-deteksi rekomendasi saat buka HANYA jika izin lokasi sudah granted —
    // langsung tampilkan tempat terdekat tanpa menunggu klik & tanpa memunculkan
    // prompt. Kalau belum granted (prompt/denied) atau browser tak mendukung
    // Permissions API, tombol manual "Gunakan Lokasi Saat Ini" tetap menjadi fallback.
    // Ditaruh setelah reset agar tidak ditimpa balik ke "idle".
    useEffect(() => {
        if (!isOpen || !navigator.permissions) return;
        let cancelled = false;
        navigator.permissions
            .query({ name: "geolocation" as PermissionName })
            .then((r) => {
                if (!cancelled && r.state === "granted") detectNearby();
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [isOpen, detectNearby]);

    // Debounced place autocomplete (Nominatim), biased to DI Yogyakarta.
    useEffect(() => {
        if (!isOpen || stage !== "search") return;
        const q = query.trim();
        if (q.length < 3) {
            setResults([]);
            setIsSearching(false);
            setSearchError(false);
            return;
        }
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setIsSearching(true);
            setSearchError(false);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=id&viewbox=${DIY_VIEWBOX}&bounded=1&q=${encodeURIComponent(q)}`,
                    { headers: { "Accept-Language": "id" }, signal: controller.signal }
                );
                // 429 (rate limit) / 5xx → server sibuk, bukan "tidak ada hasil".
                if (!res.ok) throw new Error(String(res.status));
                const data = await res.json();
                setResults(Array.isArray(data) ? data : []);
            } catch (e) {
                // Abaikan pembatalan (query berubah); selain itu tandai pencarian gagal.
                if ((e as Error)?.name !== "AbortError") {
                    setResults([]);
                    setSearchError(true);
                }
            } finally {
                setIsSearching(false);
            }
        }, 450);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query, stage, isOpen]);

    if (!isOpen || !mounted) return null;

    const goToMap = (lat: number, lng: number, text: string) => {
        setCoords({ lat, lng });
        setLabel(text);
        setQuery(text);
        setFlyTarget({ lat, lng, key: Date.now() });
        // Reset status pin: tampilkan label penuh saat baru masuk peta dari pencarian/rekomendasi.
        setIsPinMoving(false);
        setPinMovedOnce(false);
        setStage("map");
    };

    const handleSelectResult = (r: SearchResult) => {
        goToMap(parseFloat(r.lat), parseFloat(r.lon), formatLabel(r.display_name));
    };

    const handleNext = async () => {
        // Sudah ada hasil → langsung menuju yang teratas.
        if (results.length > 0) {
            handleSelectResult(results[0]);
            return;
        }
        const q = query.trim();
        // Ada ketikan tapi hasil belum termuat (mis. Enter ditekan sebelum debounce selesai) →
        // geocode langsung sekarang supaya tetap menuju lokasinya bila ada di DIY.
        if (q.length >= 3) {
            setIsSearching(true);
            setSearchError(false);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=id&viewbox=${DIY_VIEWBOX}&bounded=1&q=${encodeURIComponent(q)}`,
                    { headers: { "Accept-Language": "id" } }
                );
                if (!res.ok) throw new Error(String(res.status));
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setResults(data);
                    handleSelectResult(data[0]);
                    return;
                }
                // Tidak ditemukan di DIY → tampilkan pesan "tidak ada hasil" (jangan paksa ke tengah Jogja).
                setResults([]);
            } catch {
                // 429/jaringan → tandai sibuk supaya user tahu ini bukan "tidak ada hasil".
                setResults([]);
                setSearchError(true);
            } finally {
                setIsSearching(false);
            }
            return;
        }
        // Belum mengetik (atau terlalu pendek) tapi ada rekomendasi GPS → pakai yang teratas.
        if (nearby.length > 0) {
            const n = nearby[0];
            goToMap(n.lat, n.lng, n.label);
        }
    };

    const handleGps = () => {
        if (!navigator.geolocation) return;
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setCoords({ lat: latitude, lng: longitude });
                setFlyTarget({ lat: latitude, lng: longitude, key: Date.now() });
                setIsLocating(false);
            },
            () => setIsLocating(false),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleConfirm = async () => {
        if (!coords) return;
        // Reverse-geocode the final pin so the saved address is complete
        // (kecamatan, kabupaten, provinsi, kode pos) and matches the chosen point —
        // even if the user dragged the pin after searching.
        setIsConfirming(true);
        let address = label.trim() || query.trim();
        let region: RegionSelection | null = null;
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`,
                { headers: { "Accept-Language": "id" } }
            );
            const data = await res.json();
            if (data?.display_name) address = data.display_name;
            region = await matchRegion((data?.address ?? {}) as Record<string, string>);
        } catch {
            /* network error — keep the search label as fallback */
        }
        setIsConfirming(false);
        onConfirm(address, coords.lat, coords.lng, region);
    };

    return createPortal(
        <>
        {/* Backdrop: penuhi lebar window termasuk gutter scrollbar */}
        <div className="fixed top-0 left-0 w-screen h-[100dvh] z-[70] bg-black/50 animate-backdrop-in" />
        {/* Lapis pemusat: inset-0 mengecualikan gutter → modal tetap center secara visual */}
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
                ref={sheetRef}
                style={sheetStyle}
                className="flex w-full sm:max-w-md flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl sm:h-[85vh] sm:animate-zoom-in"
            >
            {/* Grab zone — tarik untuk menutup di mobile (handle + header). Peta tidak ikut agar gestur peta tetap normal. */}
            <div className="shrink-0 touch-none select-none" {...dragHandlers}>
                {/* Drag handle — affordance bottom-sheet (mobile only) */}
                <div className="sm:hidden flex justify-center pt-3 pb-2">
                    <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                </div>
                {/* Header */}
                <div className="relative flex items-center justify-center border-b border-gray-100 px-4 pt-3 pb-4 sm:pt-5">
                    {stage === "map" && (
                        <button
                            type="button"
                            onClick={() => setStage("search")}
                            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-600 hover:bg-gray-100 transition"
                            aria-label="Back"
                        >
                            <IoChevronBack size={20} />
                        </button>
                    )}
                    <h3 className="text-xl font-bold text-green-700 text-center">{t("locationTitle")}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                        aria-label="Close"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>
            </div>

            {stage === "search" ? (
                <>
                    {/* Search field */}
                    <div className="px-4 pt-3">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    // Enter → langsung menuju hasil teratas / lokasi yang diketik (seperti Shopee).
                                    if (e.key === "Enter" && (query.trim().length > 0 || nearby.length > 0)) {
                                        e.preventDefault();
                                        handleNext();
                                    }
                                }}
                                placeholder={t("street")}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <FiX size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Recommendations (auto, based on device location) */}
                    <div className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain px-2">
                        {query.trim().length >= 3 ? (
                            isSearching ? (
                                <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                                    <FaSpinner className="animate-spin" /> {t("searching")}
                                </div>
                            ) : searchError ? (
                                <div className="mx-2 mt-2 rounded-xl bg-amber-50 px-3 py-3 text-center text-sm text-amber-700">
                                    {t("searchBusy")}
                                </div>
                            ) : results.length === 0 ? (
                                <p className="px-2 py-8 text-center text-sm text-gray-400">{t("searchNoResults")}</p>
                            ) : (
                                <>
                                    <p className="px-2 pb-1 text-xs text-gray-400">{t("recommendations")}</p>
                                    <ul>
                                        {results.map((r, i) => {
                                            const parts = r.display_name.split(",");
                                            const head = parts[0]?.trim();
                                            const rest = parts.slice(1, 4).join(",").trim();
                                            return (
                                                <li key={`${r.lat}-${r.lon}-${i}`}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelectResult(r)}
                                                        className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-gray-50"
                                                    >
                                                        <FiMapPin className="mt-0.5 shrink-0 text-gray-400" size={18} />
                                                        <span className="text-sm leading-snug text-gray-700">
                                                            <span className="font-semibold text-gray-900">{head}</span>
                                                            {rest && <span className="text-gray-500">, {rest}</span>}
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </>
                            )
                        ) : (
                            <>
                                {(geoStatus === "idle" || geoStatus === "denied") && (
                                    <div className="px-2 pt-3 pb-2">
                                        <button
                                            type="button"
                                            onClick={detectNearby}
                                            className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 py-4 text-left transition hover:border-emerald-400 hover:bg-emerald-100/60 active:scale-[.98] disabled:opacity-60"
                                        >
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                                                <FiCrosshair size={20} />
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-emerald-700">{t("useMyLocation")}</p>
                                                <p className="mt-0.5 text-xs text-gray-500">{t("useCurrentLocationDesc")}</p>
                                            </div>
                                        </button>
                                        {geoStatus === "denied" && (
                                            <div className="mt-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5 text-xs text-red-600 space-y-1">
                                                <p className="font-semibold">Akses lokasi diblokir oleh browser.</p>
                                                <p className="text-red-500 leading-relaxed">
                                                    Ketuk ikon kunci/info di address bar → <strong>Izin situs</strong> → <strong>Lokasi</strong> → ubah ke <strong>Izinkan</strong>, lalu coba lagi.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {geoStatus === "locating" && (
                                    <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                                        <FaSpinner className="animate-spin" /> {t("detectingLocation")}
                                    </div>
                                )}
                                {geoStatus === "done" && nearby.length > 0 && (
                                    <>
                                        <p className="px-2 pb-1 text-xs text-gray-400">{t("nearbyTitle")}</p>
                                        <ul>
                                            {nearby.map((r, i) => (
                                                <li key={`${r.lat}-${r.lng}-${i}`}>
                                                    <button
                                                        type="button"
                                                        onClick={() => goToMap(r.lat, r.lng, r.label)}
                                                        className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-gray-50"
                                                    >
                                                        <FiMapPin className="mt-0.5 shrink-0 text-gray-400" size={18} />
                                                        <span className="text-sm leading-snug text-gray-700">{r.label}</span>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* Next */}
                    <div className="border-t border-gray-100 px-4 py-3">
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={query.trim().length === 0 && nearby.length === 0}
                            className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                        >
                            {t("nextStep")}
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {/* Map + fixed center pin */}
                    <div className="relative flex-1 overflow-hidden">
                        <PinpointMap
                            initialLat={coords?.lat ?? DIY_CENTER.lat}
                            initialLng={coords?.lng ?? DIY_CENTER.lng}
                            flyTarget={flyTarget}
                            onMove={(lat, lng) => setCoords({ lat, lng })}
                            onDragStateChange={(dragging) => {
                                setIsPinMoving(dragging);
                                if (!dragging) setPinMovedOnce(true);
                            }}
                        />

                        {/* Selected address card — gaya iOS: frosted glass + pill */}
                        <div className="absolute left-3 right-3 top-3 z-[1000] flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 p-2.5 shadow-xl shadow-black/10 ring-1 ring-black/5 backdrop-blur-xl backdrop-saturate-150">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100/90 text-emerald-600">
                                <FiMapPin size={18} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{t("selectedAddressTitle")}</p>
                                <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800">
                                    {label || t("streetPlaceholder")}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStage("search")}
                                className="shrink-0 px-1 text-xs font-semibold text-emerald-600 transition hover:text-emerald-700 active:scale-95"
                            >
                                {t("change")}
                            </button>
                        </div>

                        {/* Bayangan di tanah (titik tengah) — tetap di tempat walau ikon terangkat */}
                        <span
                            className={`pointer-events-none absolute left-1/2 top-1/2 z-[999] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-black/40 blur-[2px] transition-all duration-200 ease-out ${
                                isPinMoving ? "h-1.5 w-3.5 opacity-30" : "h-2 w-5 opacity-45"
                            }`}
                        />

                        {/* Fixed center pin + tooltip — gaya iOS */}
                        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1000] flex -translate-x-1/2 -translate-y-full flex-col items-center">
                            {/* Label frosted dengan ekor menunjuk ke pin — disembunyikan saat peta digeser */}
                            {!isPinMoving && (
                                <div className="relative mb-2 rounded-2xl bg-emerald-600/95 px-3.5 py-2 text-center shadow-lg shadow-emerald-900/25 ring-1 ring-emerald-700/30 backdrop-blur-sm">
                                    <p className="text-xs font-bold leading-tight text-white">{t("pinHere")}</p>
                                    {!pinMovedOnce && (
                                        <p className="mt-0.5 text-[11px] leading-tight text-white/85">{t("pinCheck")}</p>
                                    )}
                                    <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[7px] border-x-transparent border-t-emerald-600/95" />
                                </div>
                            )}
                            {/* Ikon: terangkat saat digeser, turun lagi saat berhenti */}
                            <IoLocationSharp
                                size={40}
                                className={`text-rose-500 drop-shadow-[0_3px_4px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out ${
                                    isPinMoving ? "-translate-y-2.5" : "translate-y-0"
                                }`}
                            />
                        </div>

                        {/* GPS recenter */}
                        <button
                            type="button"
                            onClick={handleGps}
                            disabled={isLocating}
                            className="absolute bottom-4 right-4 z-[1000] flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition hover:bg-gray-50"
                        >
                            {isLocating ? <FaSpinner size={18} className="animate-spin" /> : <FiCrosshair size={20} />}
                        </button>
                    </div>

                    {/* Confirm */}
                    <div className="border-t border-gray-100 px-4 py-3">
                        <button
                            type="button"
                            onClick={() => setShowConfirmDialog(true)}
                            disabled={!coords || isConfirming}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                        >
                            {t("confirm")}
                        </button>
                    </div>
                </>
            )}
            </div>
        </div>

        {/* Dialog konfirmasi sebelum menyimpan lokasi */}
        <ConfirmModal
            open={showConfirmDialog}
            loading={isConfirming}
            title={t("confirmLocationTitle")}
            message={t("confirmLocationMessage")}
            confirmButtonText={t("confirm")}
            cancelButtonText={t("change")}
            confirmVariant="warning"
            onCancel={() => setShowConfirmDialog(false)}
            onConfirm={handleConfirm}
        />
        </>,
        document.body
    );
}
