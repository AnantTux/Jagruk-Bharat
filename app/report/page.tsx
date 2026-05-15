"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { HazardMap } from "@/components/HazardMap"
import { useHazards } from "@/hooks/use-hazards"
import type { HazardSeverity } from "@/lib/types/hazard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  Camera,
  MapPin,
  Navigation,
  Upload,
  Waves,
  Zap,
  Fish,
  Wind,
  Thermometer,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Phone,
  Mail,
} from "lucide-react"
import Link from "next/link"
import { SiteBrand } from "@/components/site-brand"
import { SiteFooter } from "@/components/site-footer"

const hazardTypes = [
  {
    id: "rip-current",
    name: "Rip Current",
    icon: Waves,
    description: "Strong water current pulling away from shore",
    color: "bg-destructive",
  },
  {
    id: "jellyfish",
    name: "Jellyfish Bloom",
    icon: Zap,
    description: "Large concentration of jellyfish",
    color: "bg-chart-3",
  },
  {
    id: "debris",
    name: "Floating Debris",
    icon: AlertTriangle,
    description: "Dangerous objects in the water",
    color: "bg-muted-foreground",
  },
  {
    id: "marine-life",
    name: "Marine Life Alert",
    icon: Fish,
    description: "Sharks, aggressive marine animals",
    color: "bg-primary",
  },
  {
    id: "pollution",
    name: "Water Pollution",
    icon: Wind,
    description: "Oil spills, chemical contamination",
    color: "bg-accent",
  },
  {
    id: "weather",
    name: "Weather Hazard",
    icon: Thermometer,
    description: "Sudden weather changes, storms",
    color: "bg-secondary",
  },
]

const severityLevels = [
  { id: "low", name: "Low Risk", description: "Minor concern, exercise normal caution", color: "bg-primary" },
  { id: "medium", name: "Medium Risk", description: "Moderate danger, increased caution advised", color: "bg-chart-3" },
  { id: "high", name: "High Risk", description: "Immediate danger, avoid area", color: "bg-destructive" },
]

export default function ReportHazardPage() {
  const router = useRouter()
  const { submitHazard, submitting, error: submitError } = useHazards()
  const [mapPickMode, setMapPickMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    hazardType: "",
    severity: "",
    location: { lat: "", lng: "", description: "" },
    description: "",
    photos: [] as File[],
    contact: { name: "", email: "", phone: "", anonymous: false },
    emergency: false,
  })

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...files] }))
  }

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
        }))
        setMapPickMode(false)
      })
    }
  }

  const handleMapPick = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        lat: lat.toFixed(6),
        lng: lng.toFixed(6),
      },
    }))
  }

  const handleSubmit = async () => {
    try {
      await submitHazard(
        {
          type: formData.hazardType,
          severity: formData.severity as HazardSeverity,
          lat: Number(formData.location.lat),
          lng: Number(formData.location.lng),
          description: formData.description || undefined,
          locationDescription: formData.location.description || undefined,
          emergency: formData.emergency,
        },
        formData.photos,
      )
      router.push("/dashboard")
    } catch {
      // error surfaced via submitError
    }
  }

  const photoPreviews = useMemo(
    () => formData.photos.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [formData.photos],
  )

  useEffect(() => {
    return () => {
      photoPreviews.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, [photoPreviews])

  const pickMarker =
    formData.location.lat && formData.location.lng
      ? { lat: Number(formData.location.lat), lng: Number(formData.location.lng) }
      : null

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">What type of hazard are you reporting?</h2>
              <p className="text-slate-300">
                Select the category that best describes the coastal hazard you&apos;ve observed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hazardTypes.map((hazard) => {
                const Icon = hazard.icon
                const isSelected = formData.hazardType === hazard.id
                return (
                  <div
                    key={hazard.id}
                    className={`cursor-pointer transition-all hover:shadow-md rounded-lg border ${
                      isSelected
                        ? "ring-2 ring-amber-400 bg-amber-400/10 border-amber-400/30"
                        : "hover:bg-slate-700/50 bg-slate-800 border-slate-700"
                    }`}
                    onClick={() => setFormData((prev) => ({ ...prev, hazardType: hazard.id }))}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-amber-400/20`}>
                          <Icon className="w-6 h-6 text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{hazard.name}</h3>
                          <p className="text-sm text-slate-300">{hazard.description}</p>
                        </div>
                        {isSelected && <CheckCircle className="w-5 h-5 text-amber-400" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">How severe is this hazard?</h2>
              <p className="text-slate-300">Help us understand the urgency and risk level of this situation.</p>
            </div>

            <RadioGroup
              value={formData.severity}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, severity: value }))}
              className="space-y-4"
            >
              {severityLevels.map((level) => (
                <div key={level.id} className="flex items-center space-x-3">
                  <RadioGroupItem value={level.id} id={level.id} className="border-slate-600 text-amber-400" />
                  <Label htmlFor={level.id} className="flex-1 cursor-pointer">
                    <div className="p-4 hover:bg-slate-700/50 transition-colors rounded-lg border border-slate-700 bg-slate-800">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full ${level.color === "bg-primary" ? "bg-amber-400" : level.color === "bg-chart-3" ? "bg-yellow-500" : "bg-red-500"}`}
                        />
                        <div>
                          <h3 className="font-semibold text-white">{level.name}</h3>
                          <p className="text-sm text-slate-300">{level.description}</p>
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="border border-red-500/30 bg-red-500/10 rounded-lg">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="emergency"
                    checked={formData.emergency}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, emergency: checked as boolean }))}
                    className="border-red-400 data-[state=checked]:bg-red-500"
                  />
                  <Label htmlFor="emergency" className="flex items-center gap-2 cursor-pointer">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="font-medium text-red-400">This is an emergency requiring immediate response</span>
                  </Label>
                </div>
                <p className="text-sm text-slate-300 mt-2 ml-7">
                  Check this if lives are in immediate danger or emergency services are needed.
                </p>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Where is this hazard located?</h2>
              <p className="text-slate-300">Provide the exact location to help others stay safe.</p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  className="flex-1 bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Use Current Location
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={
                    mapPickMode
                      ? "bg-amber-400/20 border-amber-400 text-amber-300 hover:bg-amber-400/30"
                      : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
                  }
                  onClick={() => setMapPickMode((v) => !v)}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {mapPickMode ? "Click map below…" : "Select on Map"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-white">
                    Latitude
                  </Label>
                  <Input
                    id="latitude"
                    placeholder="15.2993"
                    value={formData.location.lat}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: { ...prev.location, lat: e.target.value },
                      }))
                    }
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-white">
                    Longitude
                  </Label>
                  <Input
                    id="longitude"
                    placeholder="74.1240"
                    value={formData.location.lng}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: { ...prev.location, lng: e.target.value },
                      }))
                    }
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationDescription" className="text-white">
                  Location Description
                </Label>
                <Input
                  id="locationDescription"
                  placeholder="e.g., Sunset Beach, near the pier"
                  value={formData.location.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: { ...prev.location, description: e.target.value },
                    }))
                  }
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
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
              className="h-[320px] w-full rounded-xl border border-slate-700"
            />

            <div className="bg-slate-800 border border-slate-700 rounded-lg">
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white mb-1">Location Preview</h3>
                    <p className="text-sm text-slate-300">
                      {formData.location.lat && formData.location.lng
                        ? `${formData.location.lat}, ${formData.location.lng}`
                        : "No coordinates provided — use GPS or click the map"}
                    </p>
                    {formData.location.description && (
                      <p className="text-sm text-slate-300 mt-1">{formData.location.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Add photos and details</h2>
              <p className="text-slate-300">Visual evidence helps verify reports and assists emergency responders.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Upload Photos</Label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:bg-slate-700/50 transition-colors bg-slate-800">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-white">Click to upload photos</p>
                    <p className="text-xs text-slate-400">PNG, JPG up to 10MB each</p>
                  </Label>
                </div>
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {photoPreviews.map((preview, index) => (
                      <div
                        key={preview.url}
                        className="relative aspect-square overflow-hidden rounded-lg bg-slate-700"
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
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Detailed Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you observed, when it happened, and any other relevant details..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Time of Observation</Label>
                <Select>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="When did you observe this hazard?" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
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
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Contact information</h2>
              <p className="text-slate-300">Help us follow up on this report if needed (optional).</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={formData.contact.anonymous}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, anonymous: checked as boolean },
                    }))
                  }
                  className="border-slate-600 data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400"
                />
                <Label htmlFor="anonymous" className="text-sm font-medium text-white">
                  Submit this report anonymously
                </Label>
              </div>

              {!formData.contact.anonymous && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName" className="text-white">
                      Full Name
                    </Label>
                    <Input
                      id="contactName"
                      placeholder="Your full name"
                      value={formData.contact.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, name: e.target.value },
                        }))
                      }
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="text-white">
                      Email Address
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.contact.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, email: e.target.value },
                        }))
                      }
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="text-white">
                      Phone Number (Optional)
                    </Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.contact.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, phone: e.target.value },
                        }))
                      }
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              <div className="bg-amber-400/10 border border-amber-400/30 rounded-lg">
                <div className="p-4">
                  <h3 className="font-medium text-white mb-2">Report Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Hazard Type:</span>
                      <span className="font-medium capitalize text-white">
                        {hazardTypes.find((h) => h.id === formData.hazardType)?.name || "Not selected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Severity:</span>
                      <Badge
                        className={
                          formData.severity === "high"
                            ? "bg-red-500 text-white"
                            : formData.severity === "medium"
                              ? "bg-yellow-500 text-black"
                              : "bg-slate-600 text-white"
                        }
                      >
                        {formData.severity} risk
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Location:</span>
                      <span className="font-medium text-white">
                        {formData.location.description || "Coordinates provided"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Photos:</span>
                      <span className="font-medium text-white">{formData.photos.length} uploaded</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <SiteBrand subtitle="Report a hazard" />
            <div className="flex items-center gap-4">
              <Badge className="bg-slate-700 text-white border-slate-600">
                <Clock className="w-3 h-3 mr-1" />
                Step {currentStep} of {totalSteps}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Progress</span>
            <span className="text-sm text-slate-300">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-700" />
        </div>

        {submitError && (
          <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {submitError}
          </p>
        )}

        {/* Form Content */}
        <div className="mb-8 bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-8">{renderStep()}</div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !formData.hazardType) ||
                  (currentStep === 2 && !formData.severity) ||
                  (currentStep === 3 && (!formData.location.lat || !formData.location.lng))
                }
                className="flex items-center gap-2 bg-amber-400 text-black hover:bg-amber-500"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                className="flex items-center gap-2 bg-amber-400 text-black hover:bg-amber-500"
                disabled={submitting}
                onClick={() => void handleSubmit()}
              >
                <CheckCircle className="w-4 h-4" />
                {submitting ? "Submitting…" : "Submit Report"}
              </Button>
            )}
          </div>
        </div>

        {/* Emergency Contact */}
        {formData.emergency && (
          <div className="mt-6 border border-red-500/30 bg-red-500/10 rounded-lg">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-400 mb-2">Emergency Situation Detected</h3>
                  <p className="text-sm text-slate-300 mb-4">
                    If this is a life-threatening emergency, please contact emergency services immediately.
                  </p>
                  <div className="flex gap-3">
                    <Button className="bg-red-500 text-white hover:bg-red-600" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      Call 911
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Coast Guard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  )
}
