"use client"

import { useEffect, useRef } from "react"
import type { CircleMarker, LayerGroup, LeafletMouseEvent, Map as LeafletMapInstance } from "leaflet"
import type { HazardReport } from "@/lib/types/hazard"
import { DEFAULT_ZOOM, INDIA_COAST_CENTER, severityColor } from "@/lib/hazard-utils"
import { cn } from "@/lib/utils"

export type LeafletMapProps = {
  hazards: HazardReport[]
  center?: [number, number]
  zoom?: number
  className?: string
  selectedId?: string | null
  showHeatMap?: boolean
  onMarkerClick?: (id: string) => void
  onMapClick?: (lat: number, lng: number) => void
  pickMode?: boolean
  pickMarker?: { lat: number; lng: number } | null
}

export default function LeafletMap({
  hazards,
  center = INDIA_COAST_CENTER,
  zoom = DEFAULT_ZOOM,
  className = "h-[450px] w-full rounded-xl",
  selectedId,
  showHeatMap = false,
  onMarkerClick,
  onMapClick,
  pickMode = false,
  pickMarker,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMapInstance | null>(null)
  const layerGroupRef = useRef<LayerGroup | null>(null)
  const heatLayerRef = useRef<LayerGroup | null>(null)
  const pickMarkerRef = useRef<CircleMarker | null>(null)
  const onMapClickRef = useRef(onMapClick)
  onMapClickRef.current = onMapClick

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let cancelled = false

    void import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return

      const map = L.map(containerRef.current, {
        center,
        zoom,
        scrollWheelZoom: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const layerGroup = L.layerGroup().addTo(map)
      const heatLayer = L.layerGroup().addTo(map)
      mapRef.current = map
      layerGroupRef.current = layerGroup
      heatLayerRef.current = heatLayer

      map.on("click", (e: LeafletMouseEvent) => {
        onMapClickRef.current?.(e.latlng.lat, e.latlng.lng)
      })

      const invalidate = () => map.invalidateSize()
      requestAnimationFrame(invalidate)
      setTimeout(invalidate, 100)
    })

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        layerGroupRef.current = null
        heatLayerRef.current = null
        pickMarkerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map init once
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(() => {
      mapRef.current?.invalidateSize()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.setView(center, zoom, { animate: true })
  }, [center, zoom])

  useEffect(() => {
    const map = mapRef.current
    const layerGroup = layerGroupRef.current
    if (!map || !layerGroup) return

    void import("leaflet").then((L) => {
      layerGroup.clearLayers()

      hazards.forEach((hazard) => {
        const isSelected = hazard.id === selectedId
        const marker = L.circleMarker([hazard.lat, hazard.lng], {
          radius: isSelected ? 12 : 9,
          color: "#fff",
          weight: 2,
          fillColor: severityColor(hazard.severity),
          fillOpacity: 0.9,
        })

        marker.bindPopup(
          `<strong>${hazard.type.replace(/-/g, " ")}</strong><br/>
          ${hazard.severity} risk · ${hazard.reports} report(s)<br/>
          <small>${hazard.lat.toFixed(4)}, ${hazard.lng.toFixed(4)}</small>`,
        )

        if (onMarkerClick) {
          marker.on("click", () => onMarkerClick(hazard.id))
        }

        marker.addTo(layerGroup)
      })
    })
  }, [hazards, selectedId, onMarkerClick])

  useEffect(() => {
    const heatLayer = heatLayerRef.current
    if (!heatLayer) return

    void import("leaflet").then((L) => {
      heatLayer.clearLayers()
      if (!showHeatMap) return

      hazards.forEach((hazard) => {
        const radius =
          hazard.severity === "high" ? 12_000 : hazard.severity === "medium" ? 8_000 : 5_000
        const opacity =
          hazard.severity === "high" ? 0.22 : hazard.severity === "medium" ? 0.16 : 0.12

        L.circle([hazard.lat, hazard.lng], {
          radius,
          stroke: false,
          fillColor: severityColor(hazard.severity),
          fillOpacity: opacity,
        }).addTo(heatLayer)
      })
    })
  }, [hazards, showHeatMap])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    void import("leaflet").then((L) => {
      if (pickMarkerRef.current) {
        pickMarkerRef.current.remove()
        pickMarkerRef.current = null
      }

      if (pickMarker) {
        pickMarkerRef.current = L.circleMarker([pickMarker.lat, pickMarker.lng], {
          radius: 10,
          color: "#fbbf24",
          weight: 3,
          fillColor: "#fbbf24",
          fillOpacity: 0.5,
          dashArray: "4 4",
        }).addTo(map)
        if (pickMode) {
          map.panTo([pickMarker.lat, pickMarker.lng])
        }
      }
    })
  }, [pickMarker, pickMode])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const container = map.getContainer()
    container.style.cursor = pickMode ? "crosshair" : ""
  }, [pickMode])

  const isFullHeight = className.includes("h-full")

  return (
    <div className={cn("relative w-full", isFullHeight ? "h-full min-h-0" : className)}>
      <div
        ref={containerRef}
        className={cn(
          "z-0",
          isFullHeight ? "absolute inset-0 h-full w-full" : className,
        )}
      />
      {pickMode && (
        <p className="absolute bottom-3 left-3 right-3 z-10 rounded-lg bg-slate-900/90 px-3 py-2 text-xs text-amber-300 border border-amber-400/30">
          Click the map to set the hazard location
        </p>
      )}
    </div>
  )
}
