import { NextResponse } from "next/server";
import { createHazard, listHazards } from "@/lib/hazard-store";
import { saveHazardPhotos } from "@/lib/save-hazard-photos";
import { randomUUID } from "crypto";
export const dynamic = "force-dynamic";
function isSeverity(value) {
    return value === "low" || value === "medium" || value === "high";
}
function parseHazardFields(formData) {
    const type = formData.get("type");
    const severity = formData.get("severity");
    const lat = Number(formData.get("lat"));
    const lng = Number(formData.get("lng"));
    if (typeof type !== "string" || !type)
        return null;
    if (!isSeverity(severity))
        return null;
    if (!Number.isFinite(lat) || !Number.isFinite(lng))
        return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180)
        return null;
    const description = formData.get("description");
    const locationDescription = formData.get("locationDescription");
    const emergency = formData.get("emergency");
    return {
        type,
        severity,
        lat,
        lng,
        description: typeof description === "string" && description ? description : undefined,
        locationDescription: typeof locationDescription === "string" && locationDescription ? locationDescription : undefined,
        emergency: emergency === "true" || emergency === "1",
    };
}
function validateJsonBody(body) {
    if (!body.type || typeof body.type !== "string")
        return null;
    if (!isSeverity(body.severity))
        return null;
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng))
        return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180)
        return null;
    return {
        type: body.type,
        severity: body.severity,
        lat,
        lng,
        description: body.description,
        locationDescription: body.locationDescription,
        emergency: Boolean(body.emergency),
        photoUrls: body.photoUrls,
    };
}
export async function GET() {
    try {
        return NextResponse.json({ hazards: await listHazards() });
    }
    catch (error) {
        console.error("Unable to load hazards", error);
        return NextResponse.json({ error: "Unable to load hazards" }, { status: 500 });
    }
}
export async function POST(request) {
    try {
        const contentType = request.headers.get("content-type") ?? "";
        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const fields = parseHazardFields(formData);
            if (!fields) {
                return NextResponse.json({ error: "Invalid hazard fields" }, { status: 400 });
            }
            const photoFiles = formData
                .getAll("photos")
                .filter((entry) => entry instanceof File && entry.size > 0);
            const hazardId = randomUUID();
            let photoUrls = [];
            if (photoFiles.length > 0) {
                photoUrls = await saveHazardPhotos(photoFiles, hazardId);
            }
            const hazard = await createHazard({
                type: fields.type,
                severity: fields.severity,
                lat: fields.lat,
                lng: fields.lng,
                description: fields.description,
                locationDescription: fields.locationDescription,
                emergency: fields.emergency,
                photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
            }, hazardId);
            return NextResponse.json({ hazard }, { status: 201 });
        }
        const body = (await request.json());
        const input = validateJsonBody(body);
        if (!input) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }
        const hazard = await createHazard(input);
        return NextResponse.json({ hazard }, { status: 201 });
    }
    catch (e) {
        const message = e instanceof Error ? e.message : "Invalid request";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
