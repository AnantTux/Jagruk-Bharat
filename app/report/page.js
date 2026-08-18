"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Clock,
    MapPin,
    Navigation,
    Phone,
    Upload,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { HazardMap } from "@/components/HazardMap";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useHazards } from "@/hooks/use-hazards";
import { reportHazardTypes as hazardTypes, severityLevels } from "@/lib/hazard-config";

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const hazardColors = {
    "road-accident": "var(--hazard-road-accident)",
    fire: "var(--hazard-fire)",
    flooding: "var(--hazard-flooding)",
    landslide: "var(--hazard-landslide)",
    "blocked-route": "var(--hazard-blocked-route)",
    infrastructure: "var(--hazard-infrastructure)",
    electrical: "var(--hazard-electrical)",
    pollution: "var(--hazard-pollution)",
    "severe-weather": "var(--hazard-severe-weather)",
    other: "var(--hazard-other)",
};

const severityColors = {
    low: "#1264b9",
    medium: "#d97706",
    high: "#dc2626",
};

function StepHeading({ title, description }) {
    return (
        <div className="border-b border-border pb-6">
            <h2 className="text-2xl font-bold leading-8 tracking-[-0.02em] text-slate-950">{title}</h2>
            <p className="mt-2 max-w-2xl text-base leading-6 text-slate-600">{description}</p>
        </div>
    );
}

export default function ReportHazardPage() {
    const router = useRouter();
    const { submitHazard, submitting, error: submitError } = useHazards();
    const [mapPickMode, setMapPickMode] = useState(false);
    const [photoError, setPhotoError] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        hazardType: "",
        severity: "",
        location: { lat: "", lng: "", description: "" },
        description: "",
        photos: [],
        observationTime: "now",
        contact: { phone: "" },
        emergency: false,
    });
    const [authReady, setAuthReady] = useState(false);
    const totalSteps = 5;
    const progress = (currentStep / totalSteps) * 100;

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handlePhotoUpload = (event) => {
        const files = Array.from(event.target.files || []);
        const availableSlots = MAX_PHOTOS - formData.photos.length;
        const acceptedFiles = [];
        const errors = [];

        for (const file of files) {
            if (acceptedFiles.length >= availableSlots) {
                errors.push(`You can upload up to ${MAX_PHOTOS} photos per report.`);
                break;
            }
            if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
                errors.push(`${file.name} is not a supported image type.`);
                continue;
            }
            if (file.size > MAX_PHOTO_BYTES) {
                errors.push(`${file.name} is larger than 10MB.`);
                continue;
            }
            acceptedFiles.push(file);
        }

        if (acceptedFiles.length) {
            setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...acceptedFiles] }));
        }
        setPhotoError(errors[0] || "");
        event.currentTarget.value = "";
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData((prev) => ({
                        ...prev,
                        location: {
                            ...prev.location,
                            lat: position.coords.latitude.toString(),
                            lng: position.coords.longitude.toString(),
                        },
                    }));
                    setMapPickMode(false);
                },
                () => window.alert("We could not access your location. Enter coordinates manually or choose a point on the map."),
            );
        } else {
            window.alert("Your browser does not support location access. Enter coordinates manually or choose a point on the map.");
        }
    };

    const handleMapPick = (lat, lng) => {
        setFormData((prev) => ({
            ...prev,
            location: {
                ...prev.location,
                lat: lat.toFixed(6),
                lng: lng.toFixed(6),
            },
        }));
        setMapPickMode(false);
    };

    const handleSubmit = async () => {
        try {
            await submitHazard(
                {
                    type: formData.hazardType,
                    severity: formData.severity,
                    lat: Number(formData.location.lat),
                    lng: Number(formData.location.lng),
                    description: formData.description || undefined,
                    locationDescription: formData.location.description || undefined,
                    contactPhone: formData.contact.phone || undefined,
                    observationTime: formData.observationTime,
                    emergency: formData.emergency,
                },
                formData.photos,
            );
            router.push("/dashboard");
        } catch {
            // error surfaced via submitError
        }
    };

    const photoPreviews = useMemo(
        () => formData.photos.map((file) => ({ file, url: URL.createObjectURL(file) })),
        [formData.photos],
    );

    useEffect(() => {
        return () => {
            photoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
    }, [photoPreviews]);

    useEffect(() => {
        let active = true;
        fetch("/api/auth/session", { cache: "no-store" })
            .then((response) => response.json())
            .then((data) => {
                if (!active) return;
                if (!data.user) {
                    router.replace("/login?next=/report");
                    return;
                }
                setAuthReady(true);
            })
            .catch(() => {
                if (active) router.replace("/login?next=/report");
            });
        return () => {
            active = false;
        };
    }, [router]);

    useEffect(() => {
        document.body.classList.add("report-page-active");
        return () => document.body.classList.remove("report-page-active");
    }, []);

    const pickMarker =
        formData.location.lat && formData.location.lng
            ? { lat: Number(formData.location.lat), lng: Number(formData.location.lng) }
            : null;

    const renderEvidenceStep = () => (
        <div className="space-y-6">
            <StepHeading
                title="Add photos and details"
                description="Visual evidence helps the community understand and verify reports."
            />
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label>Upload Photos (optional)</Label>
                    <div className="rounded-[var(--radius-card)] border-2 border-dashed border-border bg-[#f7f9f9] p-8 text-center transition-colors hover:border-primary hover:bg-[#e1effb]">
                        <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handlePhotoUpload}
                            className="hidden"
                            id="photo-upload"
                        />
                        <Label htmlFor="photo-upload" className="block cursor-pointer">
                            <Upload className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
                            <span className="mt-3 block text-sm font-semibold text-slate-950">Choose photos</span>
                            <span className="mt-1 block text-xs font-normal text-slate-500">
                                JPG, PNG, WEBP or GIF · up to {MAX_PHOTOS} photos, 10MB each
                            </span>
                        </Label>
                    </div>
                    {photoError ? (
                        <p role="alert" className="text-sm font-semibold text-destructive">
                            {photoError}
                        </p>
                    ) : null}
                    {photoPreviews.length > 0 ? (
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {photoPreviews.map((preview, index) => (
                                <div
                                    key={preview.url}
                                    className="relative aspect-square overflow-hidden rounded-[var(--radius-control)] border border-border bg-slate-100"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={preview.url}
                                        alt={`Upload preview ${index + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Detailed Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Describe what you observed, when it happened, and any other relevant details..."
                        rows={4}
                        value={formData.description}
                        onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="observationTime">Time of Observation</Label>
                    <Select
                        value={formData.observationTime}
                        onValueChange={(observationTime) => setFormData((prev) => ({ ...prev, observationTime }))}
                    >
                        <SelectTrigger id="observationTime">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="now">Right now</SelectItem>
                            <SelectItem value="30min">30 minutes ago</SelectItem>
                            <SelectItem value="1hour">1 hour ago</SelectItem>
                            <SelectItem value="2hours">2 hours ago</SelectItem>
                            <SelectItem value="today">Earlier today</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <StepHeading
                            title="What type of hazard are you reporting?"
                            description="Select the category that best describes the public hazard you have observed."
                        />
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {hazardTypes.map((hazard) => {
                                const Icon = hazard.icon;
                                const isSelected = formData.hazardType === hazard.id;
                                const hazardColor = hazardColors[hazard.id];

                                return (
                                    <div
                                        key={hazard.id}
                                        className={`cursor-pointer rounded-[var(--radius-control)] border bg-white p-4 transition-colors ${
                                            isSelected
                                                ? "border-primary bg-[#e1effb]"
                                                : "border-border hover:border-[#94a3b8] hover:bg-[#f7f9f9]"
                                        }`}
                                        onClick={() => setFormData((prev) => ({ ...prev, hazardType: hazard.id }))}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-white"
                                                style={{ border: `1px solid ${hazardColor}`, color: hazardColor }}
                                            >
                                                <Icon className="h-5 w-5" aria-hidden="true" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold leading-5 text-slate-950">{hazard.name}</h3>
                                                <p className="mt-1 text-sm leading-5 text-slate-600">{hazard.description}</p>
                                            </div>
                                            {isSelected ? (
                                                <CheckCircle className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                                            ) : (
                                                <span
                                                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                                                    style={{ backgroundColor: hazardColor }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <StepHeading
                            title="How severe is this hazard?"
                            description="Help us understand the urgency and risk level of this situation."
                        />
                        <RadioGroup
                            value={formData.severity}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, severity: value }))}
                            className="space-y-3"
                        >
                            {severityLevels.map((level) => (
                                <div key={level.id} className="flex items-center gap-3">
                                    <RadioGroupItem value={level.id} id={level.id} />
                                    <Label htmlFor={level.id} className="flex-1 cursor-pointer">
                                        <div className="w-full rounded-[var(--radius-control)] border border-border bg-white p-4 transition-colors hover:bg-[#f7f9f9]">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className="h-3 w-3 shrink-0 rounded-full"
                                                    style={{ backgroundColor: severityColors[level.id] }}
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-slate-950">{level.name}</h3>
                                                    <p className="mt-1 text-sm font-normal leading-5 text-slate-600">
                                                        {level.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                        <div className="rounded-[var(--radius-card)] border border-[#fca5a5] bg-[#fef2f2] p-4">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="emergency"
                                    checked={formData.emergency}
                                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, emergency: checked }))}
                                    className="border-destructive data-[state=checked]:border-destructive data-[state=checked]:bg-destructive"
                                />
                                <Label htmlFor="emergency" className="cursor-pointer text-destructive">
                                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                                    <span className="font-semibold">This is an emergency requiring immediate response</span>
                                </Label>
                            </div>
                            <p className="ml-7 mt-2 text-sm leading-5 text-slate-600">
                                Check this if lives are in immediate danger or emergency services are needed.
                            </p>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <StepHeading
                            title="Where is this hazard located?"
                            description="Provide the exact location to help others stay safe."
                        />
                        <div className="space-y-6">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Button type="button" variant="outline" onClick={getCurrentLocation}>
                                    <Navigation className="h-4 w-4" aria-hidden="true" />
                                    Use Current Location
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={mapPickMode ? "border-[#093f78] bg-[#cfe3f7] text-[#093f78]" : ""}
                                    onClick={() => setMapPickMode((value) => !value)}
                                >
                                    <MapPin className="h-4 w-4" aria-hidden="true" />
                                    {mapPickMode ? "Click map below…" : "Select on Map"}
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Latitude</Label>
                                    <Input
                                        id="latitude"
                                        placeholder="15.2993"
                                        value={formData.location.lat}
                                        onChange={(event) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                location: { ...prev.location, lat: event.target.value },
                                            }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Longitude</Label>
                                    <Input
                                        id="longitude"
                                        placeholder="74.1240"
                                        value={formData.location.lng}
                                        onChange={(event) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                location: { ...prev.location, lng: event.target.value },
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="locationDescription">Location Description</Label>
                                <Input
                                    id="locationDescription"
                                    placeholder="e.g., MG Road, near the bus stand"
                                    value={formData.location.description}
                                    onChange={(event) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            location: { ...prev.location, description: event.target.value },
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <HazardMap
                            hazards={[]}
                            pickMode={mapPickMode}
                            pickMarker={pickMarker}
                            onMapClick={handleMapPick}
                            zoom={pickMarker ? 10 : 5}
                            center={pickMarker ? [pickMarker.lat, pickMarker.lng] : undefined}
                            className="h-[320px] w-full rounded-[var(--radius-card)] border border-border"
                        />

                        <div className="flex items-start gap-3 border-t border-border pt-4">
                            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                            <div>
                                <h3 className="font-semibold text-slate-950">Location Preview</h3>
                                <p className="mt-1 text-sm text-slate-600">
                                    {formData.location.lat && formData.location.lng
                                        ? `${formData.location.lat}, ${formData.location.lng}`
                                        : "No coordinates provided — use GPS or click the map"}
                                </p>
                                {formData.location.description ? (
                                    <p className="mt-1 text-sm text-slate-600">{formData.location.description}</p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                );

            case 4:
            case "legacy-evidence-step":
                return renderEvidenceStep();

            case 5:
                return (
                    <div className="space-y-6">
                        <StepHeading
                            title="Contact information"
                            description="Your verified account email is already on file. Add a phone number only if you would like follow-up by phone."
                        />
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone">Phone Number (Optional)</Label>
                            <Input
                                id="contactPhone"
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={formData.contact.phone}
                                onChange={(event) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        contact: { ...prev.contact, phone: event.target.value },
                                    }))
                                }
                            />
                            <p className="text-xs text-slate-500">
                                This number is private and is not displayed on the public map.
                            </p>
                        </div>

                        <div className="border-y border-border bg-[#f7f9f9] px-4 py-5">
                            <h3 className="font-semibold text-slate-950">Report Summary</h3>
                            <dl className="mt-4 divide-y divide-border text-sm">
                                <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                                    <dt className="text-slate-600">Hazard Type</dt>
                                    <dd className="text-right font-semibold text-slate-950">
                                        {hazardTypes.find((hazard) => hazard.id === formData.hazardType)?.name || "Not selected"}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4 py-3">
                                    <dt className="text-slate-600">Severity</dt>
                                    <dd>
                                        <Badge
                                            className={
                                                formData.severity === "high"
                                                    ? "border-transparent bg-destructive text-white"
                                                    : formData.severity === "medium"
                                                      ? "border-transparent bg-[#d97706] text-white"
                                                      : "border-transparent bg-primary text-white"
                                            }
                                        >
                                            {formData.severity} risk
                                        </Badge>
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4 py-3">
                                    <dt className="text-slate-600">Location</dt>
                                    <dd className="text-right font-semibold text-slate-950">
                                        {formData.location.description || "Coordinates provided"}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4 pt-3">
                                    <dt className="text-slate-600">Photos</dt>
                                    <dd className="font-mono font-semibold text-slate-950">{formData.photos.length} uploaded</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!authReady) {
        return <div className="report-page min-h-screen bg-background" />;
    }

    return (
        <div className="min-h-screen bg-background">
            <AppHeader
                subtitle="Report a hazard"
                trailing={
                    <div className="flex h-9 items-center gap-2 rounded-[var(--radius-control)] border border-white/35 bg-white/10 px-3 font-mono text-xs font-semibold text-white">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        Step {currentStep} of {totalSteps}
                    </div>
                }
            />

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">Community safety report</p>
                    <h1 className="mt-2 text-[2rem] font-bold leading-10 tracking-[-0.03em] text-slate-950 sm:text-4xl sm:leading-[2.75rem]">
                        Report a public hazard
                    </h1>
                    <p className="mt-3 max-w-2xl text-base leading-6 text-slate-600">
                        Share clear, accurate details so nearby people and responders can understand the risk.
                    </p>
                </div>

                <section aria-label="Report progress" className="mb-6">
                    <div className="mb-2 flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-slate-700">Progress</span>
                        <span className="font-mono text-sm font-semibold text-slate-600">{Math.round(progress)}% complete</span>
                    </div>
                    <Progress value={progress} />
                </section>

                {submitError ? (
                    <p role="alert" className="mb-6 rounded-[var(--radius-card)] border border-[#fca5a5] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-destructive">
                        {submitError}
                    </p>
                ) : null}

                <Card className="gap-0 py-0">
                    <CardContent className="p-6 sm:p-8">{renderStep()}</CardContent>
                    <div className="flex flex-col-reverse gap-3 border-t border-border bg-[#f7f9f9] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Previous
                        </Button>
                        {currentStep < totalSteps ? (
                            <Button
                                onClick={nextStep}
                                disabled={
                                    (currentStep === 1 && !formData.hazardType) ||
                                    (currentStep === 2 && !formData.severity) ||
                                    (currentStep === 3 && (!formData.location.lat || !formData.location.lng))
                                }
                            >
                                Next
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        ) : (
                            <Button disabled={submitting} onClick={() => void handleSubmit()}>
                                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                                {submitting ? "Submitting…" : "Submit Report"}
                            </Button>
                        )}
                    </div>
                </Card>

                {formData.emergency ? (
                    <section className="mt-6 rounded-[var(--radius-card)] border border-[#fca5a5] bg-[#fef2f2] p-6">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-destructive" aria-hidden="true" />
                            <div>
                                <h2 className="text-lg font-bold text-destructive">Emergency situation detected</h2>
                                <p className="mt-2 text-sm leading-5 text-slate-700">
                                    If this is a life-threatening emergency, please contact emergency services immediately.
                                </p>
                                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                    <Button variant="destructive" size="sm" onClick={() => window.open("tel:112", "_self")}>
                                        <Phone className="h-4 w-4" aria-hidden="true" />
                                        Call 112
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => window.open("tel:1070", "_self")}>
                                        <Phone className="h-4 w-4" aria-hidden="true" />
                                        Disaster Helpline 1070
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : null}
            </main>

            <SiteFooter />
        </div>
    );
}
