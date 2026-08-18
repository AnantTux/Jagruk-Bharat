"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

const HAZARD_QUERY_KEY = ["hazards"];
const LONG_POLL_TIMEOUT_MS = 25000;
const RETRY_DELAY_MS = 1500;

function getHazardSocketUrl() {
    if (process.env.NEXT_PUBLIC_HAZARD_WS_URL)
        return process.env.NEXT_PUBLIC_HAZARD_WS_URL;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws/hazards`;
}

async function fetchHazards() {
    const res = await fetch("/api/hazards", { cache: "no-store", signal: AbortSignal.timeout(25000) });
    if (!res.ok)
        throw new Error("Hazard data is temporarily unavailable. Please try again shortly.");
    return (await res.json()).hazards;
}

function getVoterLocation() {
    if (!navigator.geolocation)
        return Promise.reject(new Error("Your browser does not support location access."));
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
            resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
        }, () => reject(new Error("Allow location access to vote on a nearby hazard.")), {
            enableHighAccuracy: false, maximumAge: 60000, timeout: 15000,
        });
    });
}

async function postHazard({ input, photos }) {
    let response;
    if (photos?.length) {
        const form = new FormData();
        ["type", "severity", "description", "locationDescription", "contactPhone"].forEach((key) => {
            if (input[key]) form.append(key, input[key]);
        });
        form.append("lat", String(input.lat));
        form.append("lng", String(input.lng));
        if (input.emergency) form.append("emergency", "true");
        photos.forEach((file) => form.append("photos", file));
        response = await fetch("/api/hazards", { method: "POST", body: form });
    }
    else {
        response = await fetch("/api/hazards", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
        });
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Failed to submit report");
    return data.hazard;
}

export function useHazards() {
    const queryClient = useQueryClient();
    const query = useQuery({ queryKey: HAZARD_QUERY_KEY, queryFn: fetchHazards });
    const submitMutation = useMutation({
        mutationFn: postHazard,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: HAZARD_QUERY_KEY }),
    });
    const voteMutation = useMutation({
        mutationFn: async ({ id, direction }) => {
            const voterLocation = await getVoterLocation();
            const res = await fetch(`/api/hazards/${id}/vote`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ direction, voterLocation }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed to record vote");
            return data.hazard;
        },
        onMutate: async ({ id, direction }) => {
            await queryClient.cancelQueries({ queryKey: HAZARD_QUERY_KEY });
            const previous = queryClient.getQueryData(HAZARD_QUERY_KEY);
            const field = direction === "up" ? "upvotes" : "downvotes";
            queryClient.setQueryData(HAZARD_QUERY_KEY, (hazards = []) => hazards.map((hazard) => hazard.id === id
                ? { ...hazard, [field]: (hazard[field] ?? 0) + 1 } : hazard));
            return { previous };
        },
        onError: (_error, _variables, context) => {
            if (context?.previous) queryClient.setQueryData(HAZARD_QUERY_KEY, context.previous);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: HAZARD_QUERY_KEY }),
    });
    const refresh = useCallback(() => queryClient.invalidateQueries({ queryKey: HAZARD_QUERY_KEY }), [queryClient]);
    const refreshRef = useRef(refresh);
    refreshRef.current = refresh;

    useEffect(() => {
        let cancelled = false, socket, fallbackStarted = false, connectionTimeout, retryTimeout, abortController;
        const waitToRetry = () => new Promise((resolve) => { retryTimeout = setTimeout(resolve, RETRY_DELAY_MS); });
        const startLongPolling = async () => {
            if (fallbackStarted) return;
            fallbackStarted = true;
            while (!cancelled) {
                abortController = new AbortController();
                try {
                    const response = await fetch(`/api/hazards/stream?timeout=${LONG_POLL_TIMEOUT_MS}`, {
                        cache: "no-store", signal: abortController.signal,
                    });
                    if (!response.ok) throw new Error("Live updates are unavailable");
                    if (!cancelled) await refreshRef.current();
                }
                catch (error) {
                    if (!cancelled && error?.name !== "AbortError") await waitToRetry();
                }
            }
        };
        const startFallback = () => void startLongPolling();
        if (typeof WebSocket === "undefined") startFallback();
        else {
            try {
                socket = new WebSocket(getHazardSocketUrl());
                connectionTimeout = setTimeout(() => {
                    if (socket?.readyState !== WebSocket.OPEN) { socket?.close(); startFallback(); }
                }, 3000);
                socket.onopen = () => clearTimeout(connectionTimeout);
                socket.onmessage = (message) => {
                    try { if (JSON.parse(message.data).type === "hazards-updated") void refreshRef.current(); }
                    catch { /* Ignore malformed live-update events. */ }
                };
                socket.onerror = () => socket.close();
                socket.onclose = () => { clearTimeout(connectionTimeout); if (!cancelled) startFallback(); };
            }
            catch { startFallback(); }
        }
        return () => {
            cancelled = true; clearTimeout(connectionTimeout); clearTimeout(retryTimeout);
            abortController?.abort(); socket?.close();
        };
    }, []);

    const activeError = query.error ?? submitMutation.error ?? voteMutation.error;
    return {
        hazards: query.data ?? [],
        loading: query.isLoading,
        error: activeError?.name === "TimeoutError" ? "Hazard data took too long to load. Please refresh the page."
            : activeError?.message ?? null,
        submitting: submitMutation.isPending,
        lastUpdatedAt: query.dataUpdatedAt,
        refresh,
        submitHazard: (input, photos) => submitMutation.mutateAsync({ input, photos }),
        voteHazard: (id, direction) => voteMutation.mutateAsync({ id, direction }),
    };
}
