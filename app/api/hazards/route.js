import { NextResponse } from "next/server";
import { createHazard, deleteHazardForRateLimit, listHazards, publicHazard } from "@/lib/hazard-store";
import { parseHazardFormData, validateHazardInput } from "@/lib/hazard-validation";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { getHazardSubmissionRateLimit, recordHazardSubmission, releaseHazardSubmission } from "@/lib/hazard-rate-limit";
import { requireSameOrigin } from "@/lib/request-security";
import { reportServerError } from "@/lib/error-reporting";
export const dynamic = "force-dynamic";
export async function GET() {
    try {
        return NextResponse.json({ hazards: await listHazards() });
    }
    catch (error) {
        reportServerError(error, { message: "Unable to load hazards", route: "/api/hazards" });
        return NextResponse.json({ error: "Unable to load hazards" }, { status: 500 });
    }
}
export async function POST(request) {
    try {
        const crossSiteResponse = requireSameOrigin(request);
        if (crossSiteResponse)
            return crossSiteResponse;
        const user = await getCurrentUser();
        if (!user)
            return NextResponse.json({ error: "Sign in with a verified account to report a hazard." }, { status: 401 });
        const rateLimit = await getHazardSubmissionRateLimit(String(user._id));
        if (!rateLimit.allowed) {
            return NextResponse.json({ error: "You can submit up to 3 hazard reports per hour." }, {
                status: 429,
                headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
            });
        }
        const contentType = request.headers.get("content-type") ?? "";
        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const fields = parseHazardFormData(formData);
            if (!fields) {
                return NextResponse.json({ error: "Invalid hazard fields" }, { status: 400 });
            }
            const photoFiles = formData
                .getAll("photos")
                .filter((entry) => entry instanceof File && entry.size > 0);
            const hazardId = randomUUID();
            let photoUrls = [];
            if (photoFiles.length > 0) {
                // Sharp is only needed for a photo upload. Loading it at module
                // start made read-only map requests fail on Vercel's Linux runtime.
                const { saveHazardPhotos } = await import("@/lib/save-hazard-photos");
                photoUrls = await saveHazardPhotos(photoFiles, hazardId);
            }
            const hazard = await createHazard({
                type: fields.type,
                severity: fields.severity,
                lat: fields.lat,
                lng: fields.lng,
                description: fields.description,
                locationDescription: fields.locationDescription,
                contactPhone: fields.contactPhone,
                emergency: fields.emergency,
                photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
                reportedByUserId: user._id,
            }, hazardId);
            const recordedLimit = await recordHazardSubmission(String(user._id));
            if (!recordedLimit.allowed) {
                await deleteHazardForRateLimit(hazard.id, user._id);
                await releaseHazardSubmission(String(user._id));
                return NextResponse.json({ error: "You can submit up to 3 hazard reports per hour." }, {
                    status: 429,
                    headers: { "Retry-After": String(recordedLimit.retryAfterSeconds) },
                });
            }
            return NextResponse.json({ hazard: publicHazard(hazard) }, { status: 201 });
        }
        const body = (await request.json());
        const input = validateHazardInput(body);
        if (!input) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }
        const hazard = await createHazard({ ...input, reportedByUserId: user._id });
        const recordedLimit = await recordHazardSubmission(String(user._id));
        if (!recordedLimit.allowed) {
            await deleteHazardForRateLimit(hazard.id, user._id);
            await releaseHazardSubmission(String(user._id));
            return NextResponse.json({ error: "You can submit up to 3 hazard reports per hour." }, {
                status: 429,
                headers: { "Retry-After": String(recordedLimit.retryAfterSeconds) },
            });
        }
        return NextResponse.json({ hazard: publicHazard(hazard) }, { status: 201 });
    }
    catch (e) {
        reportServerError(e, { message: "Hazard submission failed", route: "/api/hazards" });
        const message = e instanceof Error ? e.message : "Invalid request";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
