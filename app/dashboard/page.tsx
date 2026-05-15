"use client"

import { useCallback, useMemo, useState } from "react"
import { HazardMap } from "@/components/HazardMap"
import { useHazards } from "@/hooks/use-hazards"
import {
  DEFAULT_ZOOM,
  findHazard,
  formatTimeAgo,
  hazardTrustScore,
  hazardTypeLabel,
  INDIA_COAST_CENTER,
} from "@/lib/hazard-utils"
import Link from "next/link"
import { SiteBrand } from "@/components/site-brand"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  AlertTriangle,
  Camera,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  Settings,
  Waves,
  Zap,
  Fish,
  Wind,
  Thermometer,
  Eye,
  EyeOff,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react"

const hazardTypes = [
  { id: "rip-current", name: "Rip Currents", icon: Waves, color: "bg-destructive" },
  { id: "jellyfish", name: "Jellyfish", icon: Zap, color: "bg-chart-3" },
  { id: "debris", name: "Debris", icon: AlertTriangle, color: "bg-muted-foreground" },
  { id: "shark", name: "Marine Life", icon: Fish, color: "bg-primary" },
  { id: "pollution", name: "Pollution", icon: Wind, color: "bg-accent" },
]

export default function MapDashboard() {
  const { hazards, loading, error, refresh, voteHazard } = useHazards()
  const [selectedHazard, setSelectedHazard] = useState<string | null>(null)
  const [showHeatMap, setShowHeatMap] = useState(true)
  const [showClusters, setShowClusters] = useState(true)
  const [timeRange, setTimeRange] = useState([24])
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number]>(INDIA_COAST_CENTER)
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchLabel, setSearchLabel] = useState<string | null>(null)
  const [votingId, setVotingId] = useState<string | null>(null)

  const filteredHazards = useMemo(() => {
    const cutoff = Date.now() - timeRange[0] * 60 * 60 * 1000
    return hazards.filter((h) => {
      const inRange = new Date(h.createdAt).getTime() >= cutoff
      const typeOk = activeFilters.length === 0 || activeFilters.includes(h.type)
      return inRange && typeOk
    })
  }, [hazards, timeRange, activeFilters])

  const stats = useMemo(() => {
    const high = filteredHazards.filter((h) => h.severity === "high").length
    const medium = filteredHazards.filter((h) => h.severity === "medium").length
    return { high, medium, total: filteredHazards.length }
  }, [filteredHazards])

  const selected = findHazard(hazards, selectedHazard)

  const toggleFilter = (hazardType: string) => {
    setActiveFilters((prev) =>
      prev.includes(hazardType) ? prev.filter((f) => f !== hazardType) : [...prev, hazardType],
    )
  }

  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim()
    if (!q) return
    setSearchError(null)
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Location not found")
      setMapCenter([data.lat, data.lng])
      setMapZoom(11)
      setSearchLabel(data.label)
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Search failed")
      setSearchLabel(null)
    }
  }, [searchQuery])

  const handleVote = useCallback(
    async (id: string, direction: "up" | "down") => {
      setVotingId(id)
      try {
        await voteHazard(id, direction)
      } catch {
        /* refresh keeps prior state on failure */
      } finally {
        setVotingId(null)
      }
    },
    [voteHazard],
  )

  const mapHazards = filteredHazards

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <SiteBrand href="/" subtitle="Live hazard map" />
            <div className="flex items-center gap-4">
              <Button className="bg-amber-400 hover:bg-amber-500 text-slate-900 border-0" size="sm" asChild>
                <Link href="/report">
                  <Camera className="w-4 h-4 mr-2" />
                  Report Hazard
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-slate-700 hover:text-white">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)] min-h-0">
        {/* Sidebar Controls */}
        <div className="w-80 border-r border-slate-700 bg-slate-800 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">Search Location</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && void handleSearch()}
                    placeholder="City, beach, or lat,lng"
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void handleSearch()}
                  className="bg-amber-400 text-slate-900 hover:bg-amber-500 shrink-0"
                >
                  Go
                </Button>
              </div>
              {searchError && <p className="text-xs text-red-400">{searchError}</p>}
              {searchLabel && !searchError && (
                <p className="text-xs text-slate-400 line-clamp-2">Showing: {searchLabel}</p>
              )}
            </div>

            {/* Time Range */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-white">Time Range</Label>
              <div className="space-y-2">
                <Slider
                  value={timeRange}
                  onValueChange={setTimeRange}
                  max={168}
                  min={1}
                  step={1}
                  className="w-full [&_[role=slider]]:bg-amber-400 [&_[role=slider]]:border-amber-400"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>1 hour</span>
                  <span className="font-medium text-amber-400">{timeRange[0]} hours</span>
                  <span>1 week</span>
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-white">Display Options</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-white">Heat Map</span>
                  </div>
                  <Switch
                    checked={showHeatMap}
                    onCheckedChange={setShowHeatMap}
                    className="data-[state=checked]:bg-amber-400"
                  />
                </div>
                <p className="text-xs text-slate-500 pl-6">
                  Severity zones where reports cluster — warmer colors mean higher risk density.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-white">Show Markers</span>
                  </div>
                  <Switch
                    checked={showClusters}
                    onCheckedChange={setShowClusters}
                    className="data-[state=checked]:bg-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Hazard Type Filters */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-white">Hazard Types</Label>
              <div className="space-y-2">
                {hazardTypes.map((hazard) => {
                  const Icon = hazard.icon
                  const isActive = activeFilters.includes(hazard.id)
                  return (
                    <div
                      key={hazard.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        isActive
                          ? "bg-amber-400/20 border-amber-400 text-white"
                          : "bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-slate-300"
                      }`}
                      onClick={() => toggleFilter(hazard.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${hazard.color}`} />
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{hazard.name}</span>
                      </div>
                      {isActive ? (
                        <Eye className="w-4 h-4 text-amber-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-white">Recent Alerts</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                  onClick={() => refresh()}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500">Confirm alerts — especially rip currents and debris.</p>
              <div className="space-y-2">
                {filteredHazards.slice(0, 5).map((hazard) => {
                  const trust = hazardTrustScore(hazard)
                  const canVote = true
                  return (
                    <Card
                      key={hazard.id}
                      className="p-3 bg-slate-700 border-slate-600 hover:bg-slate-600/80 transition-colors"
                    >
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => setSelectedHazard(hazard.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            className={
                              hazard.severity === "high"
                                ? "bg-red-500 text-white"
                                : hazard.severity === "medium"
                                  ? "bg-amber-400 text-slate-900"
                                  : "bg-slate-600 text-white"
                            }
                          >
                            {hazard.severity} risk
                          </Badge>
                          <span className="text-xs text-slate-400">{formatTimeAgo(hazard.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="text-sm font-medium capitalize text-white">
                            {hazardTypeLabel(hazard.type)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {hazard.reports} reports · trust score {trust}
                        </p>
                      </button>
                      {canVote && (
                        <div className="mt-2 flex items-center gap-2 border-t border-slate-600 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={votingId === hazard.id}
                            className="flex-1 h-8 border-slate-500 bg-slate-800 text-slate-200 hover:bg-slate-600 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              void handleVote(hazard.id, "up")
                            }}
                          >
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            {hazard.upvotes}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={votingId === hazard.id}
                            className="flex-1 h-8 border-slate-500 bg-slate-800 text-slate-200 hover:bg-slate-600 hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation()
                              void handleVote(hazard.id, "down")
                            }}
                          >
                            <ThumbsDown className="w-3 h-3 mr-1" />
                            {hazard.downvotes}
                          </Button>
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Map Area */}
        <div className="relative min-h-0 min-w-0 flex-1">
          {error && (
            <p className="absolute top-2 left-1/2 z-30 -translate-x-1/2 rounded bg-red-900/90 px-3 py-1 text-xs text-red-100">
              {error}
            </p>
          )}
          <div className="absolute inset-0 z-0">
            {loading ? (
              <div className="h-full w-full animate-pulse bg-slate-800" />
            ) : (
              <HazardMap
                hazards={showClusters ? mapHazards : []}
                center={mapCenter}
                zoom={mapZoom}
                showHeatMap={showHeatMap}
                selectedId={selectedHazard}
                onMarkerClick={setSelectedHazard}
                className="h-full w-full"
              />
            )}
          </div>

          <Card className="absolute bottom-4 left-4 z-20 p-4 bg-slate-800/95 backdrop-blur-sm border-slate-700 pointer-events-none">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm text-white">Hazard Severity</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-slate-300">High Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-xs text-slate-300">Medium Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-300">Low Risk</span>
              </div>
            </CardContent>
          </Card>

          <Card className="absolute top-4 left-4 z-20 p-4 bg-slate-800/95 backdrop-blur-sm border-slate-700 pointer-events-none">
            <CardContent className="p-0">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-red-400">{stats.high}</div>
                  <div className="text-xs text-slate-400">High Risk</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-400">{stats.medium}</div>
                  <div className="text-xs text-slate-400">Medium Risk</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-300">{stats.total}</div>
                  <div className="text-xs text-slate-400">In view</div>
                </div>
              </div>
              <p className="mt-2 text-center text-[10px] text-slate-500">Auto-refresh every 3s</p>
            </CardContent>
          </Card>

          {selected && (
            <Card className="absolute top-1/2 right-4 z-20 w-80 -translate-y-1/2 bg-slate-800/95 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">Hazard Details</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedHazard(null)}
                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      selected.severity === "high"
                        ? "bg-red-500 text-white"
                        : selected.severity === "medium"
                          ? "bg-amber-400 text-slate-900"
                          : "bg-slate-600 text-white"
                    }
                  >
                    {selected.severity} risk
                  </Badge>
                  <span className="text-sm font-medium capitalize text-white">{hazardTypeLabel(selected.type)}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-white">
                      {selected.lat.toFixed(4)}°, {selected.lng.toFixed(4)}°
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Reports:</span>
                    <span className="text-white">{selected.reports}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Community trust:</span>
                    <span className="text-white">
                      {selected.upvotes} up · {selected.downvotes} down (score {hazardTrustScore(selected)})
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Reported:</span>
                    <span className="text-white">{formatTimeAgo(selected.createdAt)}</span>
                  </div>
                </div>
                {selected.description && (
                  <p className="text-sm text-slate-300">{selected.description}</p>
                )}
                {selected.emergency && <Badge className="bg-red-600 text-white">Emergency flag</Badge>}
                {selected.photoUrls && selected.photoUrls.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-white">Report photos</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selected.photoUrls.map((url) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block aspect-square overflow-hidden rounded-lg border border-slate-600"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="Hazard report" className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}




