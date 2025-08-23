export interface Coordinates {
  latitude: number
  longitude: number
  accuracy?: number
}

export interface GeoFence {
  id: string
  name: string
  latitude: number
  longitude: number
  radiusMeters: number
  tenantId: string
}

export function haversineDistanceMeters(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371e3
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const sinDLat = Math.sin(dLat / 2)
  const sinDLon = Math.sin(dLon / 2)
  const aCalc = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
  const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc))
  return R * c
}

export function isWithinFence(point: Coordinates, fence: GeoFence): boolean {
  const distance = haversineDistanceMeters(point, { latitude: fence.latitude, longitude: fence.longitude })
  return distance <= fence.radiusMeters
}

export async function getCurrentPosition(options?: PositionOptions): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        })
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000, ...(options || {}) }
    )
  })
}


