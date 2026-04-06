import { Platform } from 'react-native';
import * as Location from 'expo-location';

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
};

const LOCATION_CACHE_TTL_MS = 5 * 60 * 1000;
const CITY_CACHE_PRECISION = 3;

let cachedLocation = null;
let cachedLocationAt = 0;
let inFlightLocationPromise = null;
const reverseGeocodeCityCache = new Map();

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function toNumericCoordinate(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isLocationCacheFresh() {
  if (!cachedLocation || !cachedLocationAt) {
    return false;
  }
  return Date.now() - cachedLocationAt <= LOCATION_CACHE_TTL_MS;
}

function toLocationErrorMessage(error) {
  const code = Number(error?.code);
  if (code === 1) {
    return 'Location permission denied';
  }
  if (code === 2) {
    return 'Location unavailable';
  }
  if (code === 3) {
    return 'Location request timed out';
  }
  return String(error?.message || 'Location unavailable');
}

function getGeolocationApi() {
  if (typeof navigator !== 'undefined' && navigator?.geolocation) {
    return navigator.geolocation;
  }
  return null;
}

async function resolveNativeCurrentLocation() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission?.granted) {
    throw new Error('Location permission denied');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  const latitude = toNumericCoordinate(position?.coords?.latitude);
  const longitude = toNumericCoordinate(position?.coords?.longitude);
  if (latitude === null || longitude === null) {
    throw new Error('Invalid location coordinates');
  }
  return { latitude, longitude };
}

async function resolveWebCurrentLocation() {
  const geolocation = getGeolocationApi();
  if (!geolocation) {
    throw new Error('Geolocation is not supported on this device');
  }

  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(
      (position) => {
        const latitude = toNumericCoordinate(position?.coords?.latitude);
        const longitude = toNumericCoordinate(position?.coords?.longitude);

        if (latitude === null || longitude === null) {
          reject(new Error('Invalid location coordinates'));
          return;
        }

        resolve({ latitude, longitude });
      },
      (error) => {
        reject(new Error(toLocationErrorMessage(error)));
      },
      GEOLOCATION_OPTIONS,
    );
  });
}

export async function getCurrentLocation() {
  if (isLocationCacheFresh()) {
    return cachedLocation;
  }

  if (inFlightLocationPromise) {
    return inFlightLocationPromise;
  }

  inFlightLocationPromise = (Platform.OS === 'web'
    ? resolveWebCurrentLocation()
    : resolveNativeCurrentLocation()
  ).then((nextLocation) => {
    cachedLocation = nextLocation;
    cachedLocationAt = Date.now();
    return nextLocation;
  }).finally(() => {
    inFlightLocationPromise = null;
  });

  return inFlightLocationPromise;
}

function buildCityCacheKey(latitude, longitude) {
  const lat = Number(latitude).toFixed(CITY_CACHE_PRECISION);
  const lng = Number(longitude).toFixed(CITY_CACHE_PRECISION);
  return `${lat}:${lng}`;
}

function extractCityFromReverseGeocodeResponse(payload) {
  const address = payload?.address || {};
  const cityCandidate =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    address.state_district ||
    payload?.name ||
    '';

  const cleaned = String(cityCandidate || '').trim();
  return cleaned || null;
}

export async function reverseGeocodeCity({ latitude, longitude }) {
  if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude)) {
    return null;
  }

  const cacheKey = buildCityCacheKey(latitude, longitude);
  if (reverseGeocodeCityCache.has(cacheKey)) {
    return reverseGeocodeCityCache.get(cacheKey);
  }

  try {
    const endpoint =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}` +
      `&lon=${encodeURIComponent(longitude)}`;
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Reverse geocode failed with ${response.status}`);
    }

    const payload = await response.json();
    const city = extractCityFromReverseGeocodeResponse(payload);
    reverseGeocodeCityCache.set(cacheKey, city);
    return city;
  } catch {
    reverseGeocodeCityCache.set(cacheKey, null);
    return null;
  }
}
