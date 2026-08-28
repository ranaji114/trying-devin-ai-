"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MapLibreMap } from "maplibre-gl";
import { cn } from "@/lib/utils/cn";

export interface MapPoint {
  name: string;
  latitude: number;
  longitude: number;
}

interface RouteMapProps {
  points: MapPoint[];
  /** Draw a line connecting the points in order. */
  showRoute?: boolean;
  className?: string;
  ariaLabel?: string;
}

const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [{ id: "osm", type: "raster" as const, source: "osm" }],
};

export function RouteMap({ points, showRoute = true, className, ariaLabel }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || points.length === 0) return;

    let map: MapLibreMap | null = null;
    let cancelled = false;

    async function render() {
      try {
        const maplibre = await import("maplibre-gl");
        if (cancelled || !container) return;

        map = new maplibre.Map({
          container,
          style: OSM_STYLE,
          center: [points[0].longitude, points[0].latitude],
          zoom: 6,
          attributionControl: { compact: true },
        });
        mapRef.current = map;
        map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

        const bounds = new maplibre.LngLatBounds();
        points.forEach((point, index) => {
          bounds.extend([point.longitude, point.latitude]);

          const element = document.createElement("div");
          element.className =
            "flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#0284C7] text-[11px] font-semibold text-white shadow";
          element.textContent = showRoute ? String(index + 1) : "";
          element.setAttribute("aria-label", point.name);

          new maplibre.Marker({ element })
            .setLngLat([point.longitude, point.latitude])
            .setPopup(new maplibre.Popup({ offset: 16 }).setText(point.name))
            .addTo(map!);
        });

        map.on("load", () => {
          if (!map) return;
          if (showRoute && points.length > 1) {
            map.addSource("route", {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: points.map((point) => [point.longitude, point.latitude]),
                },
              },
            });
            map.addLayer({
              id: "route-line",
              type: "line",
              source: "route",
              layout: { "line-cap": "round", "line-join": "round" },
              paint: { "line-color": "#0284C7", "line-width": 3, "line-opacity": 0.85 },
            });
          }

          map.fitBounds(bounds, { padding: 64, maxZoom: 10, duration: 0 });
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    void render();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [points, showRoute]);

  if (points.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border border-line bg-surface text-sm text-muted",
          className,
        )}
      >
        No mapped stops yet.
      </div>
    );
  }

  if (failed) {
    return (
      <div
        role="alert"
        className={cn(
          "flex items-center justify-center rounded-xl border border-line bg-surface text-sm text-muted",
          className,
        )}
      >
        The map could not be loaded. Please try again.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel ?? `Map showing ${points.length} stops`}
      className={cn("overflow-hidden rounded-xl border border-line bg-surface", className)}
    />
  );
}
