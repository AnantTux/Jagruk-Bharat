"use client"

import dynamic from "next/dynamic"
import type { LeafletMapProps } from "@/components/LeafletMap"

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[400px] w-full animate-pulse rounded-xl bg-slate-800" />,
})

export function HazardMap(props: LeafletMapProps) {
  const { className, ...rest } = props
  const isFullHeight = className?.includes("h-full")

  return (
    <div className={isFullHeight ? "h-full w-full min-h-0" : undefined}>
      <LeafletMap {...rest} className={className} />
    </div>
  )
}
