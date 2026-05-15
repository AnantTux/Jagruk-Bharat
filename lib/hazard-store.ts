import type { CreateHazardInput, HazardReport } from "@/lib/types/hazard"

const globalStore = globalThis as typeof globalThis & {
  __samudraHazards?: HazardReport[]
}

const SEED: HazardReport[] = [
  {
    id: "seed-1",
    type: "rip-current",
    severity: "high",
    lat: 15.2993,
    lng: 74.124,
    description: "Strong rip near Calangute",
    reports: 12,
    upvotes: 9,
    downvotes: 1,
    createdAt: new Date(Date.now() - 2 * 60_000).toISOString(),
  },
  {
    id: "seed-2",
    type: "jellyfish",
    severity: "medium",
    lat: 19.076,
    lng: 72.8777,
    description: "Jellyfish bloom off Juhu",
    reports: 8,
    upvotes: 5,
    downvotes: 2,
    createdAt: new Date(Date.now() - 15 * 60_000).toISOString(),
  },
  {
    id: "seed-3",
    type: "pollution",
    severity: "medium",
    lat: 13.0827,
    lng: 80.2707,
    description: "Oil sheen near Marina",
    reports: 15,
    upvotes: 11,
    downvotes: 0,
    createdAt: new Date(Date.now() - 30 * 60_000).toISOString(),
  },
  {
    id: "seed-4",
    type: "weather",
    severity: "high",
    lat: 8.5241,
    lng: 76.9366,
    description: "Sudden squall — fishing boats advised",
    reports: 5,
    upvotes: 3,
    downvotes: 4,
    createdAt: new Date(Date.now() - 45 * 60_000).toISOString(),
  },
]

function store(): HazardReport[] {
  if (!globalStore.__samudraHazards) {
    globalStore.__samudraHazards = [...SEED]
  }
  return globalStore.__samudraHazards
}

export function listHazards(): HazardReport[] {
  return [...store()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function createHazard(input: CreateHazardInput, id?: string): HazardReport {
  const hazard: HazardReport = {
    id: id ?? crypto.randomUUID(),
    type: input.type,
    severity: input.severity,
    lat: input.lat,
    lng: input.lng,
    description: input.description,
    locationDescription: input.locationDescription,
    reports: 1,
    upvotes: 0,
    downvotes: 0,
    emergency: input.emergency,
    photoUrls: input.photoUrls?.length ? input.photoUrls : undefined,
    createdAt: new Date().toISOString(),
  }
  store().unshift(hazard)
  return hazard
}

export function voteHazard(id: string, direction: "up" | "down"): HazardReport | null {
  const hazard = store().find((h) => h.id === id)
  if (!hazard) return null
  if (direction === "up") hazard.upvotes += 1
  else hazard.downvotes += 1
  return { ...hazard }
}
