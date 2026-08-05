import { HAZARD_TYPE_IDS } from "@/lib/hazard-types";

export const HAZARD_LIMITS = {
    description: 2000,
    locationDescription: 300,
    photoUrls: 5,
};

export function isSeverity(value) {
    return value === "low" || value === "medium" || value === "high";
}

function optionalText(value, maxLength) {
    if (value === undefined || value === null || value === "")
        return undefined;
    if (typeof value !== "string")
        return null;
    const normalized = value.trim();
    if (!normalized)
        return undefined;
    if (normalized.length > maxLength)
        return null;
    return normalized;
}

function optionalPhotoUrls(value) {
    if (value === undefined)
        return undefined;
    if (!Array.isArray(value) || value.length > HAZARD_LIMITS.photoUrls)
        return null;
    if (value.some((url) => typeof url !== "string" || !url.startsWith("/uploads/hazards/")))
        return null;
    return value;
}

export function validateHazardInput(input) {
    if (!input || typeof input !== "object")
        return null;
    if (typeof input.type !== "string" || !HAZARD_TYPE_IDS.has(input.type))
        return null;
    if (!isSeverity(input.severity))
        return null;

    const lat = Number(input.lat);
    const lng = Number(input.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng))
        return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180)
        return null;

    const description = optionalText(input.description, HAZARD_LIMITS.description);
    const locationDescription = optionalText(input.locationDescription, HAZARD_LIMITS.locationDescription);
    const photoUrls = optionalPhotoUrls(input.photoUrls);
    if (description === null || locationDescription === null || photoUrls === null)
        return null;

    return {
        type: input.type,
        severity: input.severity,
        lat,
        lng,
        description,
        locationDescription,
        emergency: input.emergency === true || input.emergency === "true" || input.emergency === "1",
        photoUrls,
    };
}

export function parseHazardFormData(formData) {
    return validateHazardInput({
        type: formData.get("type"),
        severity: formData.get("severity"),
        lat: formData.get("lat"),
        lng: formData.get("lng"),
        description: formData.get("description"),
        locationDescription: formData.get("locationDescription"),
        emergency: formData.get("emergency"),
    });
}
