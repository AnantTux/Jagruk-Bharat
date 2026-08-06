"use client";
import { useCallback, useEffect, useRef, useState } from "react";
const LONG_POLL_TIMEOUT_MS = 25000;
const RETRY_DELAY_MS = 1500;

function getHazardSocketUrl() {
    if (process.env.NEXT_PUBLIC_HAZARD_WS_URL) {
        return process.env.NEXT_PUBLIC_HAZARD_WS_URL;
    }
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws/hazards`;
}

function getVoterLocation() {
    if (!navigator.geolocation)
        return Promise.reject(new Error("Your browser does not support location access."));
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
            resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
        }, () => {
            reject(new Error("Allow location access to vote on a nearby hazard."));
        }, {
            enableHighAccuracy: false,
            maximumAge: 60000,
            timeout: 15000,
        });
    });
}
export function useHazards() {
    const [hazards, setHazards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(0);
    const mounted = useRef(true);
    const refresh = useCallback(async () => {
        try {
            const res = await fetch("/api/hazards", {
                cache: "no-store",
                signal: AbortSignal.timeout(8000),
            });
            if (!res.ok)
                throw new Error("Failed to load hazards");
            const data = (await res.json());
            if (mounted.current) {
                setHazards(data.hazards);
                setLastUpdatedAt(Date.now());
                setError(null);
            }
        }
        catch (e) {
            if (mounted.current) {
                setError(e?.name === "TimeoutError"
                    ? "Hazard data took too long to load. Please refresh the page."
                    : e instanceof Error ? e.message : "Failed to load hazards");
            }
        }
        finally {
            if (mounted.current)
                setLoading(false);
        }
    }, []);
    useEffect(() => {
        mounted.current = true;
        refresh();
        let cancelled = false;
        let socket;
        let fallbackStarted = false;
        let connectionTimeout;
        let retryTimeout;
        let abortController;

        const waitToRetry = () => new Promise((resolve) => {
            retryTimeout = setTimeout(resolve, RETRY_DELAY_MS);
        });

        const startLongPolling = async () => {
            if (fallbackStarted)
                return;
            fallbackStarted = true;

            while (!cancelled) {
                abortController = new AbortController();
                try {
                    const response = await fetch(`/api/hazards/stream?timeout=${LONG_POLL_TIMEOUT_MS}`, {
                        cache: "no-store",
                        signal: abortController.signal,
                    });
                    if (!response.ok)
                        throw new Error("Live updates are unavailable");
                    if (!cancelled)
                        await refresh();
                }
                catch (e) {
                    if (!cancelled && e?.name !== "AbortError")
                        await waitToRetry();
                }
            }
        };

        const startFallback = () => {
            void startLongPolling();
        };

        if (typeof WebSocket === "undefined") {
            startFallback();
        }
        else {
            try {
                socket = new WebSocket(getHazardSocketUrl());
                connectionTimeout = setTimeout(() => {
                    if (socket?.readyState !== WebSocket.OPEN) {
                        socket?.close();
                        startFallback();
                    }
                }, 3000);

                socket.onopen = () => {
                    clearTimeout(connectionTimeout);
                };
                socket.onmessage = (message) => {
                    try {
                        const event = JSON.parse(message.data);
                        if (event.type === "hazards-updated")
                            void refresh();
                    }
                    catch {
                        // Ignore malformed messages and keep the connection alive.
                    }
                };
                socket.onerror = () => socket.close();
                socket.onclose = () => {
                    clearTimeout(connectionTimeout);
                    if (!cancelled)
                        startFallback();
                };
            }
            catch {
                startFallback();
            }
        }

        return () => {
            cancelled = true;
            mounted.current = false;
            clearTimeout(connectionTimeout);
            clearTimeout(retryTimeout);
            abortController?.abort();
            socket?.close();
        };
    }, [refresh]);
    const submitHazard = useCallback(async (input, photos) => {
        setSubmitting(true);
        setError(null);
        try {
            let res;
            if (photos && photos.length > 0) {
                const form = new FormData();
                form.append("type", input.type);
                form.append("severity", input.severity);
                form.append("lat", String(input.lat));
                form.append("lng", String(input.lng));
                if (input.description)
                    form.append("description", input.description);
                if (input.locationDescription)
                    form.append("locationDescription", input.locationDescription);
                if (input.emergency)
                    form.append("emergency", "true");
                photos.forEach((file) => form.append("photos", file));
                res = await fetch("/api/hazards", { method: "POST", body: form });
            }
            else {
                res = await fetch("/api/hazards", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(input),
                });
            }
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to submit report");
            }
            await refresh();
            return data.hazard;
        }
        catch (e) {
            const message = e instanceof Error ? e.message : "Failed to submit report";
            setError(message);
            throw e;
        }
        finally {
            setSubmitting(false);
        }
    }, [refresh]);
    const voteHazard = useCallback(async (id, direction) => {
        try {
            const voterLocation = await getVoterLocation();
            const res = await fetch(`/api/hazards/${id}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ direction, voterLocation }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to record vote");
            }
            await refresh();
            return data.hazard;
        }
        catch (e) {
            setError(e instanceof Error ? e.message : "Failed to record vote");
            throw e;
        }
    }, [refresh]);
    return { hazards, loading, error, submitting, lastUpdatedAt, refresh, submitHazard, voteHazard };
}
