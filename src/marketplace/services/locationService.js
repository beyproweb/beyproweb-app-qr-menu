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
const reverseGeocodeAddressCache = new Map();
const reverseGeocodePayloadCache = new Map();
const searchAddressSuggestionsCache = new Map();

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

async function fetchReverseGeocodePayload(latitude, longitude) {
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

  return response.json();
}

async function resolveReverseGeocodePayload(latitude, longitude, cacheKey) {
  if (reverseGeocodePayloadCache.has(cacheKey)) {
    return reverseGeocodePayloadCache.get(cacheKey);
  }

  try {
    const payload = await fetchReverseGeocodePayload(latitude, longitude);
    reverseGeocodePayloadCache.set(cacheKey, payload || null);
    return payload;
  } catch {
    reverseGeocodePayloadCache.set(cacheKey, null);
    return null;
  }
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

function extractAddressFromReverseGeocodeResponse(payload) {
  const displayName = String(payload?.display_name || '').trim();
  if (displayName) {
    return displayName;
  }

  const address = payload?.address || {};
  const lineOne = [address.house_number, address.road, address.neighbourhood, address.suburb]
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .join(' ');
  const lineTwo = [address.city || address.town || address.village || address.county, address.state]
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .join(', ');
  const country = String(address.country || '').trim();

  const composed = [lineOne, lineTwo, country].filter(Boolean).join(', ').trim();
  return composed || null;
}

export async function reverseGeocodeCity({ latitude, longitude }) {
  if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude)) {
    return null;
  }

  const cacheKey = buildCityCacheKey(latitude, longitude);
  if (reverseGeocodeCityCache.has(cacheKey)) {
    return reverseGeocodeCityCache.get(cacheKey);
  }

  const payload = await resolveReverseGeocodePayload(latitude, longitude, cacheKey);
  const city = extractCityFromReverseGeocodeResponse(payload);
  reverseGeocodeCityCache.set(cacheKey, city);
  return city;
}

export async function reverseGeocodeAddress({ latitude, longitude }) {
  if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude)) {
    return null;
  }

  const cacheKey = buildCityCacheKey(latitude, longitude);
  if (reverseGeocodeAddressCache.has(cacheKey)) {
    return reverseGeocodeAddressCache.get(cacheKey);
  }

  const payload = await resolveReverseGeocodePayload(latitude, longitude, cacheKey);
  const address = extractAddressFromReverseGeocodeResponse(payload);
  reverseGeocodeAddressCache.set(cacheKey, address);
  return address;
}

function normalizeSearchSuggestion(value) {
  return String(value || '').trim();
}

function buildSearchSuggestionCacheKey(query, latitude, longitude, limit) {
  const safeQuery = normalizeSearchSuggestion(query).toLowerCase();
  const lat = Number.isFinite(Number(latitude)) ? Number(latitude).toFixed(2) : 'na';
  const lng = Number.isFinite(Number(longitude)) ? Number(longitude).toFixed(2) : 'na';
  const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Number(limit)) : 8;
  return `${safeQuery}:${lat}:${lng}:${safeLimit}`;
}

export async function searchAddressSuggestions({
  query,
  latitude = null,
  longitude = null,
  limit = 8,
}) {
  const safeQuery = normalizeSearchSuggestion(query);
  if (safeQuery.length < 2) {
    return [];
  }

  const safeLimit = Number.isFinite(Number(limit)) ? Math.min(12, Math.max(1, Number(limit))) : 8;
  const cacheKey = buildSearchSuggestionCacheKey(safeQuery, latitude, longitude, safeLimit);
  if (searchAddressSuggestionsCache.has(cacheKey)) {
    return searchAddressSuggestionsCache.get(cacheKey);
  }

  const params = new URLSearchParams({
    addressdetails: '1',
    format: 'jsonv2',
    limit: String(safeLimit),
    q: safeQuery,
  });

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const latDelta = 0.25;
    const lngDelta = 0.25;
    params.set('bounded', '0');
    params.set(
      'viewbox',
      `${lng - lngDelta},${lat + latDelta},${lng + lngDelta},${lat - latDelta}`,
    );
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: { Accept: 'application/json' },
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Address search failed with ${response.status}`);
    }

    const payload = await response.json();
    const dedup = new Set();
    const suggestions = (Array.isArray(payload) ? payload : [])
      .map((item) => normalizeSearchSuggestion(item?.display_name || item?.name || ''))
      .filter((value) => {
        if (!value) return false;
        const key = value.toLowerCase();
        if (dedup.has(key)) return false;
        dedup.add(key);
        return true;
      })
      .slice(0, safeLimit);

    searchAddressSuggestionsCache.set(cacheKey, suggestions);
    return suggestions;
  } catch {
    searchAddressSuggestionsCache.set(cacheKey, []);
    return [];
  }
}
