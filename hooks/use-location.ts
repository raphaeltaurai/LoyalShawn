"use client"

import { useCallback, useEffect, useState } from "react"
import { Coordinates, GeoFence, getCurrentPosition, isWithinFence } from "@/lib/location"

export function useLocation(geofences?: GeoFence[]) {
  const [coords, setCoords] = useState<Coordinates | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [insideFences, setInsideFences] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const position = await getCurrentPosition()
      setCoords(position)
      if (geofences && geofences.length > 0) {
        const inside = geofences.filter((f) => isWithinFence(position, f)).map((f) => f.id)
        setInsideFences(inside)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get location")
    } finally {
      setLoading(false)
    }
  }, [geofences])

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { coords, error, insideFences, refresh, loading }
}


