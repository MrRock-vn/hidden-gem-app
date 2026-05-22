/**
 * Geolocation and map utilities
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationPermission {
  granted: boolean;
  canAskAgain: boolean;
  status: "undetermined" | "denied" | "granted";
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 * @param lat1 - Starting latitude
 * @param lon1 - Starting longitude
 * @param lat2 - Ending latitude
 * @param lon2 - Ending longitude
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

/**
 * Get map region for zoom level
 * @param center - Center coordinates
 * @param zoomLevel - Zoom level (1-20)
 * @returns Map region with latitudeDelta and longitudeDelta
 */
export const getMapRegionForZoom = (
  center: Coordinates,
  zoomLevel: number = 15,
): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} => {
  // Approximate calculation for map delta based on zoom level
  const oneDegreeOfLatitudeInMeters = 111.32 * 1000;
  const coef = Math.cos((center.latitude * Math.PI) / 180);
  const latitudeDelta =
    (360 / (Math.pow(2, zoomLevel) * oneDegreeOfLatitudeInMeters * coef)) *
    1000000;
  const longitudeDelta = latitudeDelta * coef;

  return {
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

/**
 * Check if two coordinates are within a specified radius
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate
 * @param radiusKm - Radius in kilometers
 * @returns true if within radius
 */
export const isWithinRadius = (
  coord1: Coordinates,
  coord2: Coordinates,
  radiusKm: number,
): boolean => {
  const distance = calculateDistance(
    coord1.latitude,
    coord1.longitude,
    coord2.latitude,
    coord2.longitude,
  );
  return distance <= radiusKm;
};

/**
 * Get direction between two coordinates (N, NE, E, SE, S, SW, W, NW)
 * @param fromLat - Starting latitude
 * @param fromLon - Starting longitude
 * @param toLat - Ending latitude
 * @param toLon - Ending longitude
 * @returns Direction string
 */
export const getDirection = (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
): string => {
  const dLat = toLat - fromLat;
  const dLon = toLon - fromLon;
  const angle = Math.atan2(dLon, dLat) * (180 / Math.PI);

  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(((angle + 360) % 360) / 45) % 8;
  return directions[index];
};

/**
 * Get bounds for array of coordinates
 * Useful for fitting multiple points on map
 * @param coords - Array of coordinates
 * @returns Bounds object with min/max lat/lon
 */
export const getBoundsForCoordinates = (
  coords: Coordinates[],
): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} => {
  const lats = coords.map((c) => c.latitude);
  const lons = coords.map((c) => c.longitude);

  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
  };
};

/**
 * Convert degrees to DMS (Degrees, Minutes, Seconds) format
 * @param degrees - Coordinate in degrees
 * @returns DMS formatted string
 */
export const convertToDMS = (degrees: number): string => {
  const d = Math.floor(Math.abs(degrees));
  const m = Math.floor((Math.abs(degrees) - d) * 60);
  const s = (((Math.abs(degrees) - d) * 60 - m) * 60).toFixed(2);
  const direction = degrees < 0 ? "(S/W)" : "(N/E)";

  return `${d}°${m}'${s}"${direction}`;
};

/**
 * Format coordinates for display
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Formatted coordinate string
 */
export const formatCoordinates = (lat: number, lng: number): string => {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

/**
 * Get Google Maps URL for coordinates
 * @param lat - Latitude
 * @param lng - Longitude
 * @param label - Optional label
 * @returns Google Maps URL
 */
export const getGoogleMapsURL = (
  lat: number,
  lng: number,
  label?: string,
): string => {
  const query = label ? encodeURIComponent(label) : `${lat},${lng}`;
  return `https://maps.google.com/?q=${query}`;
};

/**
 * Get Apple Maps URL for coordinates
 * @param lat - Latitude
 * @param lng - Longitude
 * @param label - Optional label
 * @returns Apple Maps URL
 */
export const getAppleMapsURL = (
  lat: number,
  lng: number,
  label?: string,
): string => {
  const q = label ? encodeURIComponent(label) : `${lat},${lng}`;
  return `maps://maps.apple.com/?q=${q}&ll=${lat},${lng}`;
};
