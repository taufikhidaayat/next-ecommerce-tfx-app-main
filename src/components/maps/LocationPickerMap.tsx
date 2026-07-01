"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FiSearch, FiX } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";

// Default center: Yogyakarta (used only when no coordinate is set yet)
const DEFAULT_CENTER: [number, number] = [-7.7956, 110.3695];
const DEFAULT_ZOOM = 13;
const SELECTED_ZOOM = 16;

// Fix Leaflet's default marker icon paths (break under bundlers) by pointing to the CDN.
const markerIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

type SearchResult = {
    lat: string;
    lon: string;
    display_name: string;
};

type LocationPickerMapProps = {
    latitude: number | null;
    longitude: number | null;
    onChange: (lat: number, lng: number) => void;
};

// Moves the map view whenever the coordinate changes from outside (search / paste).
function Recenter({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng], Math.max(map.getZoom(), SELECTED_ZOOM), { duration: 0.8 });
    }, [lat, lng, map]);
    return null;
}

// Sets the marker wherever the user clicks on the map.
function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function LocationPickerMap({ latitude, longitude, onChange }: LocationPickerMapProps) {
    const hasLocation = latitude !== null && longitude !== null && latitude !== 0 && longitude !== 0;
    const markerPos: [number, number] = hasLocation ? [latitude!, longitude!] : DEFAULT_CENTER;

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState("");
    const markerRef = useRef<L.Marker>(null);

    const handleSearch = async () => {
        const q = query.trim();
        if (!q) return;
        setIsSearching(true);
        setSearchError("");
        setResults([]);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=id&q=${encodeURIComponent(q)}`,
                { headers: { "Accept-Language": "id" } }
            );
            const data: SearchResult[] = await res.json();
            if (data.length === 0) {
                setSearchError("Lokasi tidak ditemukan. Coba kata kunci lain.");
            } else {
                setResults(data);
            }
        } catch {
            setSearchError("Gagal mencari lokasi. Periksa koneksi internet.");
        } finally {
            setIsSearching(false);
        }
    };

    const handlePickResult = (r: SearchResult) => {
        onChange(parseFloat(r.lat), parseFloat(r.lon));
        setResults([]);
        setQuery(r.display_name.split(",")[0]);
    };

    return (
        <div className="space-y-2">
            {/* Address search */}
            <div className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
                            placeholder="Cari alamat atau tempat (cth: Tugu Yogyakarta)"
                            className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 text-gray-900 placeholder:text-gray-400"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => {
                                    setQuery("");
                                    setResults([]);
                                    setSearchError("");
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <FiX size={15} />
                            </button>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-60"
                    >
                        {isSearching ? <FaSpinner size={13} className="animate-spin" /> : <FiSearch size={15} />}
                        Cari
                    </button>
                </div>

                {/* Search results dropdown */}
                {results.length > 0 && (
                    <div className="absolute z-[1000] mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                        {results.map((r, i) => (
                            <button
                                key={`${r.lat}-${r.lon}-${i}`}
                                type="button"
                                onClick={() => handlePickResult(r)}
                                className="w-full text-left px-3.5 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 transition border-b border-gray-100 last:border-0"
                            >
                                {r.display_name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {searchError && <p className="text-xs text-red-500">{searchError}</p>}

            <p className="text-xs text-gray-500">
                Klik di peta atau geser pin untuk menentukan lokasi yang tepat.
            </p>

            {/* Interactive map */}
            <div className="h-72 w-full overflow-hidden rounded-xl border border-gray-200">
                <MapContainer
                    center={markerPos}
                    zoom={hasLocation ? SELECTED_ZOOM : DEFAULT_ZOOM}
                    scrollWheelZoom
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ClickHandler onChange={onChange} />
                    {hasLocation && <Recenter lat={latitude!} lng={longitude!} />}
                    <Marker
                        position={markerPos}
                        icon={markerIcon}
                        draggable
                        ref={markerRef}
                        eventHandlers={{
                            dragend: () => {
                                const m = markerRef.current;
                                if (m) {
                                    const pos = m.getLatLng();
                                    onChange(pos.lat, pos.lng);
                                }
                            },
                        }}
                    />
                </MapContainer>
            </div>

            {hasLocation && (
                <p className="text-xs text-gray-500">
                    Koordinat terpilih: <span className="font-medium text-emerald-700">{latitude!.toFixed(6)}, {longitude!.toFixed(6)}</span>
                </p>
            )}
        </div>
    );
}
