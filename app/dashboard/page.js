"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useMemo, useState } from "react";
import { HazardMap } from "@/components/HazardMap";
import { useHazards } from "@/hooks/use-hazards";
import { DEFAULT_ZOOM, findHazard, formatTimeAgo, hazardTrustScore, hazardTypeLabel, INDIA_CENTER, } from "@/lib/hazard-utils";
import Link from "next/link";
import { SiteBrand } from "@/components/site-brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { dashboardHazardTypes as hazardTypes } from "@/lib/hazard-config";
import { Camera, Layers, MapPin, RefreshCw, Search, Settings, Thermometer, Eye, EyeOff, ThumbsDown, ThumbsUp, } from "lucide-react";
export default function MapDashboard() {
    const { hazards, loading, error, lastUpdatedAt, refresh, voteHazard } = useHazards();
    const [selectedHazard, setSelectedHazard] = useState(null);
    const [showHeatMap, setShowHeatMap] = useState(true);
    const [showClusters, setShowClusters] = useState(true);
    const [timeRange, setTimeRange] = useState([24]);
    const [activeFilters, setActiveFilters] = useState([]);
    const [mapCenter, setMapCenter] = useState(INDIA_CENTER);
    const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchError, setSearchError] = useState(null);
    const [searchLabel, setSearchLabel] = useState(null);
    const [votingId, setVotingId] = useState(null);
    const filteredHazards = useMemo(() => {
        const cutoff = lastUpdatedAt - timeRange[0] * 60 * 60 * 1000;
        return hazards.filter((h) => {
            const inRange = new Date(h.createdAt).getTime() >= cutoff;
            const typeOk = activeFilters.length === 0 || activeFilters.includes(h.type);
            return inRange && typeOk;
        });
    }, [hazards, timeRange, activeFilters, lastUpdatedAt]);
    const stats = useMemo(() => {
        const high = filteredHazards.filter((h) => h.severity === "high").length;
        const medium = filteredHazards.filter((h) => h.severity === "medium").length;
        return { high, medium, total: filteredHazards.length };
    }, [filteredHazards]);
    const selected = findHazard(hazards, selectedHazard);
    const toggleFilter = (hazardType) => {
        setActiveFilters((prev) => prev.includes(hazardType) ? prev.filter((f) => f !== hazardType) : [...prev, hazardType]);
    };
    const handleSearch = useCallback(async () => {
        const q = searchQuery.trim();
        if (!q)
            return;
        setSearchError(null);
        try {
            const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error ?? "Location not found");
            setMapCenter([data.lat, data.lng]);
            setMapZoom(11);
            setSearchLabel(data.label);
        }
        catch (e) {
            setSearchError(e instanceof Error ? e.message : "Search failed");
            setSearchLabel(null);
        }
    }, [searchQuery]);
    const handleVote = useCallback(async (id, direction) => {
        setVotingId(id);
        try {
            await voteHazard(id, direction);
        }
        catch {
            /* refresh keeps prior state on failure */
        }
        finally {
            setVotingId(null);
        }
    }, [voteHazard]);
    const mapHazards = filteredHazards;
    return (_jsxs("div", { className: "min-h-screen bg-slate-900", children: [_jsx("header", { className: "border-b border-slate-700 bg-slate-800 backdrop-blur-sm sticky top-0 z-50", children: _jsx("div", { className: "container mx-auto px-4 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(SiteBrand, { href: "/", subtitle: "Live hazard map" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Button, { className: "bg-amber-400 hover:bg-amber-500 text-slate-900 border-0", size: "sm", asChild: true, children: _jsxs(Link, { href: "/report", children: [_jsx(Camera, { className: "w-4 h-4 mr-2" }), "Report Hazard"] }) }), _jsx(Button, { variant: "ghost", size: "sm", className: "text-white hover:bg-slate-700 hover:text-white", children: _jsx(Settings, { className: "w-4 h-4" }) })] })] }) }) }), _jsxs("div", { className: "flex h-[calc(100vh-80px)] min-h-0", children: [_jsx("div", { className: "w-80 border-r border-slate-700 bg-slate-800 overflow-y-auto", children: _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-sm font-medium text-white", children: "Search Location" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx(Input, { value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), onKeyDown: (e) => e.key === "Enter" && void handleSearch(), placeholder: "City, landmark, or lat,lng", className: "pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400" })] }), _jsx(Button, { type: "button", size: "sm", onClick: () => void handleSearch(), className: "bg-amber-400 text-slate-900 hover:bg-amber-500 shrink-0", children: "Go" })] }), searchError && _jsx("p", { className: "text-xs text-red-400", children: searchError }), searchLabel && !searchError && (_jsxs("p", { className: "text-xs text-slate-400 line-clamp-2", children: ["Showing: ", searchLabel] }))] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { className: "text-sm font-medium text-white", children: "Time Range" }), _jsxs("div", { className: "space-y-2", children: [_jsx(Slider, { value: timeRange, onValueChange: setTimeRange, max: 168, min: 1, step: 1, className: "w-full [&_[role=slider]]:bg-amber-400 [&_[role=slider]]:border-amber-400" }), _jsxs("div", { className: "flex justify-between text-xs text-slate-400", children: [_jsx("span", { children: "1 hour" }), _jsxs("span", { className: "font-medium text-amber-400", children: [timeRange[0], " hours"] }), _jsx("span", { children: "1 week" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Label, { className: "text-sm font-medium text-white", children: "Display Options" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Thermometer, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { className: "text-sm text-white", children: "Heat Map" })] }), _jsx(Switch, { checked: showHeatMap, onCheckedChange: setShowHeatMap, className: "data-[state=checked]:bg-amber-400" })] }), _jsx("p", { className: "text-xs text-slate-500 pl-6", children: "Severity zones where reports cluster \u2014 warmer colors mean higher risk density." }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Layers, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { className: "text-sm text-white", children: "Show Markers" })] }), _jsx(Switch, { checked: showClusters, onCheckedChange: setShowClusters, className: "data-[state=checked]:bg-amber-400" })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Label, { className: "text-sm font-medium text-white", children: "Hazard Types" }), _jsx("div", { className: "space-y-2", children: hazardTypes.map((hazard) => {
                                                const Icon = hazard.icon;
                                                const isActive = activeFilters.includes(hazard.id);
                                                return (_jsxs("div", { className: `flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${isActive
                                                        ? "bg-amber-400/20 border-amber-400 text-white"
                                                        : "bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-slate-300"}`, onClick: () => toggleFilter(hazard.id), children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${hazard.color}` }), _jsx(Icon, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { className: "text-sm font-medium", children: hazard.name })] }), isActive ? (_jsx(Eye, { className: "w-4 h-4 text-amber-400" })) : (_jsx(EyeOff, { className: "w-4 h-4 text-slate-400" }))] }, hazard.id));
                                            }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { className: "text-sm font-medium text-white", children: "Recent Alerts" }), _jsx(Button, { variant: "ghost", size: "sm", className: "text-slate-400 hover:text-white hover:bg-slate-700", onClick: () => refresh(), children: _jsx(RefreshCw, { className: "w-4 h-4" }) })] }), _jsx("p", { className: "text-xs text-slate-500", children: "Review the location and evidence before confirming an alert." }), _jsx("div", { className: "space-y-2", children: filteredHazards.slice(0, 5).map((hazard) => {
                                                const trust = hazardTrustScore(hazard);
                                                const canVote = true;
                                                return (_jsxs(Card, { className: "p-3 bg-slate-700 border-slate-600 hover:bg-slate-600/80 transition-colors", children: [_jsxs("button", { type: "button", className: "w-full text-left", onClick: () => setSelectedHazard(hazard.id), children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs(Badge, { className: hazard.severity === "high"
                                                                                ? "bg-red-500 text-white"
                                                                                : hazard.severity === "medium"
                                                                                    ? "bg-amber-400 text-slate-900"
                                                                                    : "bg-slate-600 text-white", children: [hazard.severity, " risk"] }), _jsx("span", { className: "text-xs text-slate-400", children: formatTimeAgo(hazard.createdAt) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-3 h-3 text-slate-400" }), _jsx("span", { className: "text-sm font-medium capitalize text-white", children: hazardTypeLabel(hazard.type) })] }), _jsxs("p", { className: "text-xs text-slate-400 mt-1", children: [hazard.reports, " reports \u00B7 trust score ", trust] })] }), canVote && (_jsxs("div", { className: "mt-2 flex items-center gap-2 border-t border-slate-600 pt-2", children: [_jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: votingId === hazard.id, className: "flex-1 h-8 border-slate-500 bg-slate-800 text-slate-200 hover:bg-slate-600 hover:text-white", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        void handleVote(hazard.id, "up");
                                                                    }, children: [_jsx(ThumbsUp, { className: "w-3 h-3 mr-1" }), hazard.upvotes] }), _jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: votingId === hazard.id, className: "flex-1 h-8 border-slate-500 bg-slate-800 text-slate-200 hover:bg-slate-600 hover:text-white", onClick: (e) => {
                                                                        e.stopPropagation();
                                                                        void handleVote(hazard.id, "down");
                                                                    }, children: [_jsx(ThumbsDown, { className: "w-3 h-3 mr-1" }), hazard.downvotes] })] }))] }, hazard.id));
                                            }) })] })] }) }), _jsxs("div", { className: "relative min-h-0 min-w-0 flex-1", children: [error && (_jsx("p", { className: "absolute top-2 left-1/2 z-30 -translate-x-1/2 rounded bg-red-900/90 px-3 py-1 text-xs text-red-100", children: error })), _jsx("div", { className: "absolute inset-0 z-0", children: loading ? (_jsx("div", { className: "h-full w-full animate-pulse bg-slate-800" })) : (_jsx(HazardMap, { hazards: showClusters ? mapHazards : [], center: mapCenter, zoom: mapZoom, showHeatMap: showHeatMap, selectedId: selectedHazard, onMarkerClick: setSelectedHazard, className: "h-full w-full" })) }), _jsxs(Card, { className: "absolute bottom-4 left-4 z-20 p-4 bg-slate-800/95 backdrop-blur-sm border-slate-700 pointer-events-none", children: [_jsx(CardHeader, { className: "p-0 pb-3", children: _jsx(CardTitle, { className: "text-sm text-white", children: "Hazard Severity" }) }), _jsxs(CardContent, { className: "p-0 space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-red-500" }), _jsx("span", { className: "text-xs text-slate-300", children: "High Risk" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-amber-400" }), _jsx("span", { className: "text-xs text-slate-300", children: "Medium Risk" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-blue-500" }), _jsx("span", { className: "text-xs text-slate-300", children: "Low Risk" })] })] })] }), _jsx(Card, { className: "absolute top-4 left-4 z-20 p-4 bg-slate-800/95 backdrop-blur-sm border-slate-700 pointer-events-none", children: _jsxs(CardContent, { className: "p-0", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { children: [_jsx("div", { className: "text-lg font-bold text-red-400", children: stats.high }), _jsx("div", { className: "text-xs text-slate-400", children: "High Risk" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-lg font-bold text-amber-400", children: stats.medium }), _jsx("div", { className: "text-xs text-slate-400", children: "Medium Risk" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-lg font-bold text-slate-300", children: stats.total }), _jsx("div", { className: "text-xs text-slate-400", children: "In view" })] })] }), _jsx("p", { className: "mt-2 text-center text-[10px] text-slate-500", children: "Live updates with fallback" })] }) }), selected && (_jsxs(Card, { className: "absolute top-1/2 right-4 z-20 w-80 -translate-y-1/2 bg-slate-800/95 backdrop-blur-sm border-slate-700", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg text-white", children: "Hazard Details" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setSelectedHazard(null), className: "text-slate-400 hover:text-white hover:bg-slate-700", children: "\u00D7" })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Badge, { className: selected.severity === "high"
                                                            ? "bg-red-500 text-white"
                                                            : selected.severity === "medium"
                                                                ? "bg-amber-400 text-slate-900"
                                                                : "bg-slate-600 text-white", children: [selected.severity, " risk"] }), _jsx("span", { className: "text-sm font-medium capitalize text-white", children: hazardTypeLabel(selected.type) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-400", children: "Location:" }), _jsxs("span", { className: "text-white", children: [selected.lat.toFixed(4), "\u00B0, ", selected.lng.toFixed(4), "\u00B0"] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-400", children: "Reports:" }), _jsx("span", { className: "text-white", children: selected.reports })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-400", children: "Community trust:" }), _jsxs("span", { className: "text-white", children: [selected.upvotes, " up \u00B7 ", selected.downvotes, " down (score ", hazardTrustScore(selected), ")"] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-400", children: "Reported:" }), _jsx("span", { className: "text-white", children: formatTimeAgo(selected.createdAt) })] })] }), selected.description && (_jsx("p", { className: "text-sm text-slate-300", children: selected.description })), selected.emergency && _jsx(Badge, { className: "bg-red-600 text-white", children: "Emergency flag" }), selected.photoUrls && selected.photoUrls.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-medium text-white", children: "Report photos" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: selected.photoUrls.map((url) => (_jsx("a", { href: url, target: "_blank", rel: "noopener noreferrer", className: "block aspect-square overflow-hidden rounded-lg border border-slate-600", children: _jsx("img", { src: url, alt: "Hazard report", className: "h-full w-full object-cover" }) }, url))) })] }))] })] }))] })] })] }));
}
