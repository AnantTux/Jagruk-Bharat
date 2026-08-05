"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HazardMap } from "@/components/HazardMap";
import { useHazards } from "@/hooks/use-hazards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, MapPin, Navigation, Upload, ArrowLeft, ArrowRight, CheckCircle, Clock, Phone, } from "lucide-react";
import { SiteBrand } from "@/components/site-brand";
import { SiteFooter } from "@/components/site-footer";
import { reportHazardTypes as hazardTypes, severityLevels } from "@/lib/hazard-config";
export default function ReportHazardPage() {
    const router = useRouter();
    const { submitHazard, submitting, error: submitError } = useHazards();
    const [mapPickMode, setMapPickMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        hazardType: "",
        severity: "",
        location: { lat: "", lng: "", description: "" },
        description: "",
        photos: [],
        contact: { name: "", email: "", phone: "", anonymous: false },
        emergency: false,
    });
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
        setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }));
    };
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setFormData((prev) => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        lat: position.coords.latitude.toString(),
                        lng: position.coords.longitude.toString(),
                    },
                }));
                setMapPickMode(false);
            });
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
    };
    const handleSubmit = async () => {
        try {
            await submitHazard({
                type: formData.hazardType,
                severity: formData.severity,
                lat: Number(formData.location.lat),
                lng: Number(formData.location.lng),
                description: formData.description || undefined,
                locationDescription: formData.location.description || undefined,
                emergency: formData.emergency,
            }, formData.photos);
            router.push("/dashboard");
        }
        catch {
            // error surfaced via submitError
        }
    };
    const photoPreviews = useMemo(() => formData.photos.map((file) => ({ file, url: URL.createObjectURL(file) })), [formData.photos]);
    useEffect(() => {
        return () => {
            photoPreviews.forEach((p) => URL.revokeObjectURL(p.url));
        };
    }, [photoPreviews]);
    const pickMarker = formData.location.lat && formData.location.lng
        ? { lat: Number(formData.location.lat), lng: Number(formData.location.lng) }
        : null;
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "What type of hazard are you reporting?" }), _jsx("p", { className: "text-slate-300", children: "Select the category that best describes the public hazard you've observed." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: hazardTypes.map((hazard) => {
                                const Icon = hazard.icon;
                                const isSelected = formData.hazardType === hazard.id;
                                return (_jsx("div", { className: `cursor-pointer transition-all hover:shadow-md rounded-lg border ${isSelected
                                        ? "ring-2 ring-amber-400 bg-amber-400/10 border-amber-400/30"
                                        : "hover:bg-slate-700/50 bg-slate-800 border-slate-700"}`, onClick: () => setFormData((prev) => ({ ...prev, hazardType: hazard.id })), children: _jsx("div", { className: "p-6", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: `w-12 h-12 rounded-lg flex items-center justify-center bg-amber-400/20`, children: _jsx(Icon, { className: "w-6 h-6 text-amber-400" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-white mb-1", children: hazard.name }), _jsx("p", { className: "text-sm text-slate-300", children: hazard.description })] }), isSelected && _jsx(CheckCircle, { className: "w-5 h-5 text-amber-400" })] }) }) }, hazard.id));
                            }) })] }));
            case 2:
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "How severe is this hazard?" }), _jsx("p", { className: "text-slate-300", children: "Help us understand the urgency and risk level of this situation." })] }), _jsx(RadioGroup, { value: formData.severity, onValueChange: (value) => setFormData((prev) => ({ ...prev, severity: value })), className: "space-y-4", children: severityLevels.map((level) => (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(RadioGroupItem, { value: level.id, id: level.id, className: "border-slate-600 text-amber-400" }), _jsx(Label, { htmlFor: level.id, className: "flex-1 cursor-pointer", children: _jsx("div", { className: "p-4 hover:bg-slate-700/50 transition-colors rounded-lg border border-slate-700 bg-slate-800", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-4 h-4 rounded-full ${level.color === "bg-primary" ? "bg-amber-400" : level.color === "bg-chart-3" ? "bg-yellow-500" : "bg-red-500"}` }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-white", children: level.name }), _jsx("p", { className: "text-sm text-slate-300", children: level.description })] })] }) }) })] }, level.id))) }), _jsx("div", { className: "border border-red-500/30 bg-red-500/10 rounded-lg", children: _jsxs("div", { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Checkbox, { id: "emergency", checked: formData.emergency, onCheckedChange: (checked) => setFormData((prev) => ({ ...prev, emergency: checked })), className: "border-red-400 data-[state=checked]:bg-red-500" }), _jsxs(Label, { htmlFor: "emergency", className: "flex items-center gap-2 cursor-pointer", children: [_jsx(AlertTriangle, { className: "w-4 h-4 text-red-400" }), _jsx("span", { className: "font-medium text-red-400", children: "This is an emergency requiring immediate response" })] })] }), _jsx("p", { className: "text-sm text-slate-300 mt-2 ml-7", children: "Check this if lives are in immediate danger or emergency services are needed." })] }) })] }));
            case 3:
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Where is this hazard located?" }), _jsx("p", { className: "text-slate-300", children: "Provide the exact location to help others stay safe." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { type: "button", variant: "outline", onClick: getCurrentLocation, className: "flex-1 bg-slate-800 border-slate-600 text-white hover:bg-slate-700", children: [_jsx(Navigation, { className: "w-4 h-4 mr-2" }), "Use Current Location"] }), _jsxs(Button, { type: "button", variant: "outline", className: mapPickMode
                                                ? "bg-amber-400/20 border-amber-400 text-amber-300 hover:bg-amber-400/30"
                                                : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700", onClick: () => setMapPickMode((v) => !v), children: [_jsx(MapPin, { className: "w-4 h-4 mr-2" }), mapPickMode ? "Click map below…" : "Select on Map"] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "latitude", className: "text-white", children: "Latitude" }), _jsx(Input, { id: "latitude", placeholder: "15.2993", value: formData.location.lat, onChange: (e) => setFormData((prev) => ({
                                                        ...prev,
                                                        location: { ...prev.location, lat: e.target.value },
                                                    })), className: "bg-slate-800 border-slate-600 text-white placeholder:text-slate-400" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "longitude", className: "text-white", children: "Longitude" }), _jsx(Input, { id: "longitude", placeholder: "74.1240", value: formData.location.lng, onChange: (e) => setFormData((prev) => ({
                                                        ...prev,
                                                        location: { ...prev.location, lng: e.target.value },
                                                    })), className: "bg-slate-800 border-slate-600 text-white placeholder:text-slate-400" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "locationDescription", className: "text-white", children: "Location Description" }), _jsx(Input, { id: "locationDescription", placeholder: "e.g., MG Road, near the bus stand", value: formData.location.description, onChange: (e) => setFormData((prev) => ({
                                                ...prev,
                                                location: { ...prev.location, description: e.target.value },
                                            })), className: "bg-slate-800 border-slate-600 text-white placeholder:text-slate-400" })] })] }), _jsx(HazardMap, { hazards: [], pickMode: mapPickMode, pickMarker: pickMarker, onMapClick: handleMapPick, zoom: pickMarker ? 10 : 5, center: pickMarker ? [pickMarker.lat, pickMarker.lng] : undefined, className: "h-[320px] w-full rounded-xl border border-slate-700" }), _jsx("div", { className: "bg-slate-800 border border-slate-700 rounded-lg", children: _jsx("div", { className: "p-4", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx(MapPin, { className: "w-5 h-5 text-amber-400 mt-0.5" }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-white mb-1", children: "Location Preview" }), _jsx("p", { className: "text-sm text-slate-300", children: formData.location.lat && formData.location.lng
                                                        ? `${formData.location.lat}, ${formData.location.lng}`
                                                        : "No coordinates provided — use GPS or click the map" }), formData.location.description && (_jsx("p", { className: "text-sm text-slate-300 mt-1", children: formData.location.description }))] })] }) }) })] }));
            case 4:
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Add photos and details" }), _jsx("p", { className: "text-slate-300", children: "Visual evidence helps the community understand and verify reports." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-white", children: "Upload Photos" }), _jsxs("div", { className: "border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:bg-slate-700/50 transition-colors bg-slate-800", children: [_jsx("input", { type: "file", multiple: true, accept: "image/*", onChange: handlePhotoUpload, className: "hidden", id: "photo-upload" }), _jsxs(Label, { htmlFor: "photo-upload", className: "cursor-pointer", children: [_jsx(Upload, { className: "w-8 h-8 text-slate-400 mx-auto mb-2" }), _jsx("p", { className: "text-sm font-medium text-white", children: "Click to upload photos" }), _jsx("p", { className: "text-xs text-slate-400", children: "PNG, JPG up to 10MB each" })] })] }), photoPreviews.length > 0 && (_jsx("div", { className: "grid grid-cols-3 gap-2 mt-4", children: photoPreviews.map((preview, index) => (_jsx("div", { className: "relative aspect-square overflow-hidden rounded-lg bg-slate-700", children: _jsx("img", { src: preview.url, alt: `Upload preview ${index + 1}`, className: "h-full w-full object-cover" }) }, preview.url))) }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "description", className: "text-white", children: "Detailed Description" }), _jsx(Textarea, { id: "description", placeholder: "Describe what you observed, when it happened, and any other relevant details...", rows: 4, value: formData.description, onChange: (e) => setFormData((prev) => ({ ...prev, description: e.target.value })), className: "bg-slate-800 border-slate-600 text-white placeholder:text-slate-400" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-white", children: "Time of Observation" }), _jsxs(Select, { children: [_jsx(SelectTrigger, { className: "bg-slate-800 border-slate-600 text-white", children: _jsx(SelectValue, { placeholder: "When did you observe this hazard?" }) }), _jsxs(SelectContent, { className: "bg-slate-800 border-slate-600", children: [_jsx(SelectItem, { value: "now", children: "Right now" }), _jsx(SelectItem, { value: "30min", children: "30 minutes ago" }), _jsx(SelectItem, { value: "1hour", children: "1 hour ago" }), _jsx(SelectItem, { value: "2hours", children: "2 hours ago" }), _jsx(SelectItem, { value: "today", children: "Earlier today" }), _jsx(SelectItem, { value: "yesterday", children: "Yesterday" })] })] })] })] })] }));
            case 5:
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Contact information" }), _jsx("p", { className: "text-slate-300", children: "Help us follow up on this report if needed (optional)." })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: "anonymous", checked: formData.contact.anonymous, onCheckedChange: (checked) => setFormData((prev) => ({
                                                ...prev,
                                                contact: { ...prev.contact, anonymous: checked },
                                            })), className: "border-slate-600 data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400" }), _jsx(Label, { htmlFor: "anonymous", className: "text-sm font-medium text-white", children: "Submit this report anonymously" })] }), !formData.contact.anonymous && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "contactName", className: "text-white", children: "Full Name" }), _jsx(Input, { id: "contactName", placeholder: "Your full name", value: formData.contact.name, onChange: (e) => setFormData((prev) => ({
                                                        ...prev,
                                                        contact: { ...prev.contact, name: e.target.value },
                                                    })), className: "bg-slate-800 border-slate-600 text-white placeholder:text-slate-400" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "contactEmail", className: "text-white", children: "Email Address" }), _jsx(Input, { id: "contactEmail", type: "email", placeholder: "your.email@example.com", value: formData.contact.email, onChange: (e) => setFormData((prev) => ({
                                                        ...prev,
                                                        contact: { ...prev.contact, email: e.target.value },
                                                    })), className: "bg-slate-800 border-slate-600 text-white placeholder:text-slate-400" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "contactPhone", className: "text-white", children: "Phone Number (Optional)" }), _jsx(Input, { id: "contactPhone", type: "tel", placeholder: "(555) 123-4567", value: formData.contact.phone, onChange: (e) => setFormData((prev) => ({
                                                        ...prev,
                                                        contact: { ...prev.contact, phone: e.target.value },
                                                    })), className: "bg-slate-800 border-slate-600 text-white placeholder:text-slate-400" })] })] })), _jsx("div", { className: "bg-amber-400/10 border border-amber-400/30 rounded-lg", children: _jsxs("div", { className: "p-4", children: [_jsx("h3", { className: "font-medium text-white mb-2", children: "Report Summary" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-300", children: "Hazard Type:" }), _jsx("span", { className: "font-medium capitalize text-white", children: hazardTypes.find((h) => h.id === formData.hazardType)?.name || "Not selected" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-300", children: "Severity:" }), _jsxs(Badge, { className: formData.severity === "high"
                                                                    ? "bg-red-500 text-white"
                                                                    : formData.severity === "medium"
                                                                        ? "bg-yellow-500 text-black"
                                                                        : "bg-slate-600 text-white", children: [formData.severity, " risk"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-300", children: "Location:" }), _jsx("span", { className: "font-medium text-white", children: formData.location.description || "Coordinates provided" })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-300", children: "Photos:" }), _jsxs("span", { className: "font-medium text-white", children: [formData.photos.length, " uploaded"] })] })] })] }) })] })] }));
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-900", children: [_jsx("header", { className: "border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50", children: _jsx("div", { className: "container mx-auto px-4 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(SiteBrand, { subtitle: "Report a hazard" }), _jsx("div", { className: "flex items-center gap-4", children: _jsxs(Badge, { className: "bg-slate-700 text-white border-slate-600", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), "Step ", currentStep, " of ", totalSteps] }) })] }) }) }), _jsxs("div", { className: "container mx-auto px-4 py-8 max-w-4xl", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-white", children: "Progress" }), _jsxs("span", { className: "text-sm text-slate-300", children: [Math.round(progress), "% complete"] })] }), _jsx(Progress, { value: progress, className: "h-2 bg-slate-700" })] }), submitError && (_jsx("p", { className: "mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300", children: submitError })), _jsx("div", { className: "mb-8 bg-slate-800 border border-slate-700 rounded-lg", children: _jsx("div", { className: "p-8", children: renderStep() }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Button, { variant: "outline", onClick: prevStep, disabled: currentStep === 1, className: "flex items-center gap-2 bg-slate-800 border-slate-600 text-white hover:bg-slate-700", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Previous"] }), _jsx("div", { className: "flex gap-2", children: currentStep < totalSteps ? (_jsxs(Button, { onClick: nextStep, disabled: (currentStep === 1 && !formData.hazardType) ||
                                        (currentStep === 2 && !formData.severity) ||
                                        (currentStep === 3 && (!formData.location.lat || !formData.location.lng)), className: "flex items-center gap-2 bg-amber-400 text-black hover:bg-amber-500", children: ["Next", _jsx(ArrowRight, { className: "w-4 h-4" })] })) : (_jsxs(Button, { className: "flex items-center gap-2 bg-amber-400 text-black hover:bg-amber-500", disabled: submitting, onClick: () => void handleSubmit(), children: [_jsx(CheckCircle, { className: "w-4 h-4" }), submitting ? "Submitting…" : "Submit Report"] })) })] }), formData.emergency && (_jsx("div", { className: "mt-6 border border-red-500/30 bg-red-500/10 rounded-lg", children: _jsx("div", { className: "p-6", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx(AlertTriangle, { className: "w-6 h-6 text-red-400 mt-1" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-red-400 mb-2", children: "Emergency Situation Detected" }), _jsx("p", { className: "text-sm text-slate-300 mb-4", children: "If this is a life-threatening emergency, please contact emergency services immediately." }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { className: "bg-red-500 text-white hover:bg-red-600", size: "sm", onClick: () => window.open("tel:112", "_self"), children: [_jsx(Phone, { className: "w-4 h-4 mr-2" }), "Call 112"] }), _jsxs(Button, { variant: "outline", size: "sm", className: "border-slate-600 text-white hover:bg-slate-700 bg-transparent", onClick: () => window.open("tel:1070", "_self"), children: [_jsx(Phone, { className: "w-4 h-4 mr-2" }), "Disaster Helpline 1070"] })] })] })] }) }) }))] }), _jsx(SiteFooter, {})] }));
}
