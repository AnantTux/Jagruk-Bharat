import type { HazardReport, HazardSeverity } from "@/lib/types/hazard"

export const INDIA_COAST_CENTER: [number, number] = [15.5, 73.5]
export const DEFAULT_ZOOM = 5

export function severityColor(severity: HazardSeverity): string {
  switch (severity) {
    case "high":
      return "#ef4444"
    case "medium":
      return "#f59e0b"
    case "low":
      return "#3b82f6"
    default:
      return "#64748b"
  }
}

export function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

export function hazardTypeLabel(type: string): string {
  return type.replace(/-/g, " ")
}

export function findHazard(hazards: HazardReport[], id: string | null): HazardReport | undefined {
  if (!id) return undefined
  return hazards.find((h) => h.id === id)
}

export function hazardTrustScore(hazard: HazardReport): number {
  return hazard.upvotes - hazard.downvotes
}

export function formatLatestAlert(hazards: HazardReport[]): string {
  if (hazards.length === 0) {
    return "No active community reports — coastline clear. Submit a report if you see a hazard."
  }
  const latest = [...hazards].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
  const label = hazardTypeLabel(latest.type)
  const place =
    latest.locationDescription?.trim() ||
    `${latest.lat.toFixed(2)}°N, ${latest.lng.toFixed(2)}°E`
  const severity = latest.severity.toUpperCase()
  const when = formatTimeAgo(latest.createdAt)
  const detail = latest.description ? ` — ${latest.description}` : ""
  return `LATEST (${when}): ${severity} ${label} near ${place}${detail}`
}

/** Parse "lat,lng" or decimal pairs for map search */
export function parseCoordinateQuery(query: string): { lat: number; lng: number } | null {
  const trimmed = query.trim()
  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)$/)
  if (!match) return null
  const lat = Number(match[1])
  const lng = Number(match[2])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { lat, lng }
}
