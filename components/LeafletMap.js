"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { DEFAULT_ZOOM, INDIA_CENTER, severityColor } from "@/lib/hazard-utils";
import { cn } from "@/lib/utils";
export default function LeafletMap({ hazards, center = INDIA_CENTER, zoom = DEFAULT_ZOOM, className = "h-[450px] w-full rounded-xl", selectedId, showHeatMap = false, onMarkerClick, onMapClick, pickMode = false, pickMarker, }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const layerGroupRef = useRef(null);
    const heatLayerRef = useRef(null);
    const pickMarkerRef = useRef(null);
    const onMapClickRef = useRef(onMapClick);
    useEffect(() => {
        onMapClickRef.current = onMapClick;
    }, [onMapClick]);
    useEffect(() => {
        if (!containerRef.current || mapRef.current)
            return;
        let cancelled = false;
        let animationFrameId;
        let timeoutId;
        void import("leaflet").then((L) => {
            if (cancelled || !containerRef.current || mapRef.current)
                return;
            const map = L.map(containerRef.current, {
                center,
                zoom,
                scrollWheelZoom: true,
            });
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);
            const layerGroup = L.layerGroup().addTo(map);
            const heatLayer = L.layerGroup().addTo(map);
            mapRef.current = map;
            layerGroupRef.current = layerGroup;
            heatLayerRef.current = heatLayer;
            map.on("click", (e) => {
                onMapClickRef.current?.(e.latlng.lat, e.latlng.lng);
            });
            const invalidate = () => {
                if (!cancelled && mapRef.current === map)
                    map.invalidateSize();
            };
            animationFrameId = requestAnimationFrame(invalidate);
            timeoutId = setTimeout(invalidate, 100);
        });
        return () => {
            cancelled = true;
            if (animationFrameId !== undefined)
                cancelAnimationFrame(animationFrameId);
            if (timeoutId !== undefined)
                clearTimeout(timeoutId);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                layerGroupRef.current = null;
                heatLayerRef.current = null;
                pickMarkerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- map init once
    }, []);
    useEffect(() => {
        const el = containerRef.current;
        if (!el)
            return;
        const observer = new ResizeObserver(() => {
            mapRef.current?.invalidateSize();
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        const map = mapRef.current;
        if (!map)
            return;
        map.setView(center, zoom, { animate: true });
    }, [center, zoom]);
    useEffect(() => {
        const map = mapRef.current;
        const layerGroup = layerGroupRef.current;
        if (!map || !layerGroup)
            return;
        void import("leaflet").then((L) => {
            layerGroup.clearLayers();
            hazards.forEach((hazard) => {
                const isSelected = hazard.id === selectedId;
                const marker = L.circleMarker([hazard.lat, hazard.lng], {
                    radius: isSelected ? 12 : 9,
                    color: "#fff",
                    weight: 2,
                    fillColor: severityColor(hazard.severity),
                    fillOpacity: 0.9,
                });
                const safeType = hazard.type.replace(/[^a-z0-9-]/gi, "").replace(/-/g, " ");
                const photo = typeof hazard.photoUrls?.[0] === "string"
                    ? `<br/><img src="${hazard.photoUrls[0].replace(/"/g, "%22")}" alt="Hazard evidence" style="width:160px;height:100px;object-fit:cover;margin-top:6px;border-radius:6px"/>`
                    : "";
                marker.bindPopup(`<strong>${safeType}</strong><br/>
          ${hazard.severity} risk · ${hazard.reports} report(s)<br/>
          <small>Approx. ${hazard.lat.toFixed(3)}, ${hazard.lng.toFixed(3)}</small>${photo}`);
                if (onMarkerClick) {
                    marker.on("click", () => onMarkerClick(hazard.id));
                }
                marker.addTo(layerGroup);
            });
        });
    }, [hazards, selectedId, onMarkerClick]);
    useEffect(() => {
        const heatLayer = heatLayerRef.current;
        if (!heatLayer)
            return;
        void import("leaflet").then((L) => {
            heatLayer.clearLayers();
            if (!showHeatMap)
                return;
            hazards.forEach((hazard) => {
                const radius = hazard.severity === "high" ? 12000 : hazard.severity === "medium" ? 8000 : 5000;
                const opacity = hazard.severity === "high" ? 0.22 : hazard.severity === "medium" ? 0.16 : 0.12;
                L.circle([hazard.lat, hazard.lng], {
                    radius,
                    stroke: false,
                    fillColor: severityColor(hazard.severity),
                    fillOpacity: opacity,
                }).addTo(heatLayer);
            });
        });
    }, [hazards, showHeatMap]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map)
            return;
        void import("leaflet").then((L) => {
            if (pickMarkerRef.current) {
                pickMarkerRef.current.remove();
                pickMarkerRef.current = null;
            }
            if (pickMarker) {
                pickMarkerRef.current = L.circleMarker([pickMarker.lat, pickMarker.lng], {
                    radius: 10,
                    color: "#fbbf24",
                    weight: 3,
                    fillColor: "#fbbf24",
                    fillOpacity: 0.5,
                    dashArray: "4 4",
                }).addTo(map);
                if (pickMode) {
                    map.panTo([pickMarker.lat, pickMarker.lng]);
                }
            }
        });
    }, [pickMarker, pickMode]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map)
            return;
        const container = map.getContainer();
        container.style.cursor = pickMode ? "crosshair" : "";
    }, [pickMode]);
    const isFullHeight = className.includes("h-full");
    return (_jsxs("div", { className: cn("relative w-full", isFullHeight ? "h-full min-h-0" : className), children: [_jsx("div", { ref: containerRef, className: cn("z-0", isFullHeight ? "absolute inset-0 h-full w-full" : className) }), pickMode && (_jsx("p", { className: "absolute bottom-3 left-3 right-3 z-10 rounded-lg bg-slate-900/90 px-3 py-2 text-xs text-amber-300 border border-amber-400/30", children: "Click the map to set the hazard location" }))] }));
}
