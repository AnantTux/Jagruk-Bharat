import { z } from "zod";
import { HAZARD_TYPE_IDS } from "@/lib/hazard-types";

export const HAZARD_LIMITS = {
    description: 2000,
    locationDescription: 300,
    contactPhone: 32,
    photoUrls: 5,
};

const OBSERVATION_TIME_OFFSETS = {
    now: 0,
    "30min": 30 * 60 * 1000,
    "1hour": 60 * 60 * 1000,
    "2hours": 2 * 60 * 60 * 1000,
    today: 6 * 60 * 60 * 1000,
    yesterday: 24 * 60 * 60 * 1000,
};

const optionalText = (maxLength) => z.preprocess(
    (value) => typeof value === "string" && value.trim() ? value.trim() : undefined,
    z.string().max(maxLength).optional(),
);

const hazardInputSchema = z.object({
    type: z.string().refine((type) => HAZARD_TYPE_IDS.has(type)),
    severity: z.enum(["low", "medium", "high"]),
    lat: z.coerce.number().finite().min(-90).max(90),
    lng: z.coerce.number().finite().min(-180).max(180),
    description: optionalText(HAZARD_LIMITS.description),
    locationDescription: optionalText(HAZARD_LIMITS.locationDescription),
    contactPhone: optionalText(HAZARD_LIMITS.contactPhone),
    observationTime: z.enum(Object.keys(OBSERVATION_TIME_OFFSETS)).optional(),
    emergency: z.union([z.boolean(), z.literal("true"), z.literal("false"), z.literal("1"), z.literal("0")]).optional(),
}).strict();

export function isSeverity(value) {
    return value === "low" || value === "medium" || value === "high";
}

export function validateHazardInput(input) {
    const result = hazardInputSchema.safeParse(input);
    if (!result.success)
        return null;
    const value = result.data;
    return {
        ...value,
        observedAt: value.observationTime
            ? new Date(Date.now() - OBSERVATION_TIME_OFFSETS[value.observationTime])
            : new Date(),
        observationTime: undefined,
        emergency: value.emergency === true || value.emergency === "true" || value.emergency === "1",
        photoUrls: undefined,
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
        contactPhone: formData.get("contactPhone"),
        observationTime: formData.get("observationTime") || undefined,
        // Unchecked form fields are null in FormData; treat them as omitted.
        emergency: formData.get("emergency") || undefined,
    });
}
