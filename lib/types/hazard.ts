export type HazardSeverity = "low" | "medium" | "high"

export type HazardReport = {
  id: string
  type: string
  severity: HazardSeverity
  lat: number
  lng: number
  description?: string
  locationDescription?: string
  reports: number
  upvotes: number
  downvotes: number
  emergency?: boolean
  photoUrls?: string[]
  createdAt: string
}

export type CreateHazardInput = {
  type: string
  severity: HazardSeverity
  lat: number
  lng: number
  description?: string
  locationDescription?: string
  emergency?: boolean
  photoUrls?: string[]
}
