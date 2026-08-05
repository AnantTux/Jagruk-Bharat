"use client";
import { useCallback, useEffect, useRef, useState } from "react";
const POLL_MS = 3000;
export function useHazards() {
    const [hazards, setHazards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(0);
    const mounted = useRef(true);
    const refresh = useCallback(async () => {
        try {
            const res = await fetch("/api/hazards", { cache: "no-store" });
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
                setError(e instanceof Error ? e.message : "Failed to load hazards");
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
        const id = setInterval(refresh, POLL_MS);
        return () => {
            mounted.current = false;
            clearInterval(id);
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
        const res = await fetch(`/api/hazards/${id}/vote`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ direction }),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error ?? "Failed to record vote");
        }
        await refresh();
        return data.hazard;
    }, [refresh]);
    return { hazards, loading, error, submitting, lastUpdatedAt, refresh, submitHazard, voteHazard };
}
