"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_ZOOM = 17;

// Shopee-style pattern: the pin is a fixed overlay at the center of the screen
// (rendered by the parent), and the map pans underneath. We read the map center
// as the chosen coordinate on every "moveend".
function MoveHandler({
    onMove,
    onDragStateChange,
}: {
    onMove: (lat: number, lng: number) => void;
    onDragStateChange?: (dragging: boolean) => void;
}) {
    useMapEvents({
        moveend(e) {
            const c = e.target.getCenter();
            onMove(c.lat, c.lng);
        },
        // dragstart/dragend hanya untuk geser oleh user (bukan flyTo programatik).
        dragstart() {
            onDragStateChange?.(true);
        },
        dragend() {
            onDragStateChange?.(false);
        },
    });
    return null;
}

// Flies the map when an *external* target changes (a picked suggestion / GPS),
// keyed so identical coordinates can still re-trigger a fly.
function FlyController({ target }: { target: { lat: number; lng: number; key: number } }) {
    const map = useMap();
    useEffect(() => {
        // Lewati flyTo bila peta sudah berada di titik yang sama (mis. saat baru
        // masuk dari pencarian — map sudah di-mount di koordinat itu). Membandingkan
        // posisi aktual peta lebih kuat daripada flag mount (tahan StrictMode).
        const c = map.getCenter();
        const sameSpot = Math.abs(c.lat - target.lat) < 1e-6 && Math.abs(c.lng - target.lng) < 1e-6;
        if (sameSpot) return;
        map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), DEFAULT_ZOOM), { duration: 0.6 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target.key]);
    return null;
}

interface PinpointMapProps {
    initialLat: number;
    initialLng: number;
    flyTarget: { lat: number; lng: number; key: number };
    onMove: (lat: number, lng: number) => void;
    onDragStateChange?: (dragging: boolean) => void;
}

export default function PinpointMap({ initialLat, initialLng, flyTarget, onMove, onDragStateChange }: PinpointMapProps) {
    return (
        <MapContainer
            center={[initialLat, initialLng]}
            zoom={DEFAULT_ZOOM}
            maxZoom={20}
            zoomControl={false}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={20}
                maxNativeZoom={19}
            />
            <MoveHandler onMove={onMove} onDragStateChange={onDragStateChange} />
            <FlyController target={flyTarget} />
        </MapContainer>
    );
}
