export const COASTAL_REGIONS = [
  { value: "gujarat", label: "Gujarat Coast" },
  { value: "konkan", label: "Konkan (Maharashtra & Goa)" },
  { value: "karnataka", label: "Karnataka Coast" },
  { value: "kerala", label: "Kerala Coast" },
  { value: "tamil-nadu", label: "Tamil Nadu Coast" },
  { value: "andhra", label: "Andhra Pradesh & Telangana Coast" },
  { value: "odisha", label: "Odisha Coast" },
  { value: "west-bengal", label: "West Bengal Coast" },
  { value: "andaman", label: "Andaman & Nicobar" },
  { value: "lakshadweep", label: "Lakshadweep" },
] as const

export type CoastalRegionId = (typeof COASTAL_REGIONS)[number]["value"]
