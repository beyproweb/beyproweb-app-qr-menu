import { MARKETPLACE_API_URL, NEARBY_RESTAURANTS_API_URL } from '../../config/urls';
import { sanitizeRestaurantSlug } from '../../utils/url';

const FALLBACK_RESTAURANTS = [
  {
    id: 'fallback-1',
    slug: 'demo-food',
    name: 'Demo Food',
    app_icon: '',
    logo: '',
    cover_image: '',
    venue_type: 'Food',
    short_description: 'Sample venue while live feed is unavailable.',
    is_open: true,
    supports_qr_order: true,
    supports_reservation: true,
    supports_tickets: false,
    supports_delivery: true,
    supports_pickup: true,
    is_featured: true,
    location: '',
    city: '',
    delivery_zone_cities: [],
    delivery_range_km: 5,
    delivery_origin_location: '',
    delivery_origin_lat: null,
    delivery_origin_lng: null,
    distance_km: null,
  },
];

const DEBUG_NEARBY =
  (typeof __DEV__ !== 'undefined' && __DEV__) ||
  (typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production');

function logNearbyDebug(label, payload = {}) {
  if (!DEBUG_NEARBY) {
    return;
  }
  // eslint-disable-next-line no-console
  console.log(`[nearby][service] ${label}`, payload);
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return fallback;
    }
    if (['1', 'true', 'yes', 'on', 'enabled'].includes(normalized)) {
      return true;
    }
    if (['0', 'false', 'no', 'off', 'disabled'].includes(normalized)) {
      return false;
    }
  }
  return fallback;
}

function sanitizeText(value) {
  return String(value || '').trim();
}

function normalizeDistance(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function normalizeCoordinate(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return Array.from(
    new Set(
      value
        .map((item) => sanitizeText(item))
        .filter(Boolean),
    ),
  );
}

function normalizeDeliveryRangeKm(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeRestaurantRecord(record, index) {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const slug = sanitizeRestaurantSlug(record.slug);
  if (!slug) {
    return null;
  }

  const id = sanitizeText(record.id) || `${slug}-${index}`;
  const name = sanitizeText(record.name) || slug;
  const appIcon = sanitizeText(record.app_icon);
  const logo = sanitizeText(record.logo);
  const coverImage = sanitizeText(record.cover_image);
  const shortDescription =
    sanitizeText(record.short_description) || sanitizeText(record.description);

  return {
    id,
    slug,
    name,
    app_icon: appIcon,
    logo,
    cover_image: coverImage || logo,
    venue_type: sanitizeText(record.venue_type) || 'Food',
    short_description: shortDescription,
    is_open: normalizeBoolean(record.is_open, true),
    supports_qr_order: normalizeBoolean(record.supports_qr_order, true),
    supports_reservation: normalizeBoolean(record.supports_reservation, true),
    supports_tickets: normalizeBoolean(record.supports_tickets, false),
    supports_delivery: normalizeBoolean(record.supports_delivery, true),
    supports_pickup: normalizeBoolean(record.supports_pickup, true),
    is_featured: normalizeBoolean(record.is_featured, false),
    location: sanitizeText(record.location),
    city: sanitizeText(record.city),
    delivery_zone_cities: normalizeStringArray(record.delivery_zone_cities),
    delivery_range_km: normalizeDeliveryRangeKm(record.delivery_range_km),
    delivery_origin_location: sanitizeText(record.delivery_origin_location),
    delivery_origin_lat: normalizeCoordinate(record.delivery_origin_lat),
    delivery_origin_lng: normalizeCoordinate(record.delivery_origin_lng),
    distance_km: normalizeDistance(record.distance_km),
    pos_location_lat: normalizeCoordinate(record.pos_location_lat),
    pos_location_lng: normalizeCoordinate(record.pos_location_lng),
  };
}

function extractRestaurantsFromPayload(payload) {
  return Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.restaurants)
      ? payload.restaurants
      : [];
}

function buildRequestUrl(baseUrl, query = {}) {
  const url = new URL(baseUrl);
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

async function fetchRestaurantsFromApi(url, signal) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    method: 'GET',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Marketplace API responded with ${response.status}`);
  }

  const payload = await response.json();
  const restaurants = extractRestaurantsFromPayload(payload);

  return restaurants
    .map((record, index) => normalizeRestaurantRecord(record, index))
    .filter(Boolean);
}

async function fetchMarketplaceFromApi(signal) {
  return fetchRestaurantsFromApi(MARKETPLACE_API_URL, signal);
}

export async function fetchNearbyRestaurants({
  latitude,
  longitude,
  city,
  radiusKm = 5,
  signal,
} = {}) {
  const requestQuery = {
    lat: latitude,
    lng: longitude,
    city,
    radius: radiusKm,
  };

  const nearbyUrl = buildRequestUrl(NEARBY_RESTAURANTS_API_URL, requestQuery);
  logNearbyDebug('request', {
    latitude: requestQuery.lat,
    longitude: requestQuery.lng,
    city: requestQuery.city || null,
    radius_km: requestQuery.radius,
    url: nearbyUrl,
  });
  try {
    const nearbyRestaurants = await fetchRestaurantsFromApi(nearbyUrl, signal);
    logNearbyDebug('response', {
      source: 'nearby_endpoint',
      count: nearbyRestaurants.length,
    });
    return nearbyRestaurants;
  } catch (error) {
    logNearbyDebug('fallback', {
      source: 'marketplace_endpoint',
      reason: String(error?.message || 'Unknown nearby fetch error'),
    });
    // Backward-compatible fallback while nearby endpoint is being rolled out.
    const marketplaceUrl = buildRequestUrl(MARKETPLACE_API_URL, requestQuery);
    const fallbackRestaurants = await fetchRestaurantsFromApi(marketplaceUrl, signal);
    logNearbyDebug('response', {
      source: 'marketplace_endpoint',
      count: fallbackRestaurants.length,
    });
    return fallbackRestaurants;
  }
}

export async function fetchMarketplaceRestaurants() {
  try {
    const restaurants = await fetchMarketplaceFromApi();
    if (restaurants.length > 0) {
      return restaurants;
    }
  } catch {
    // Fallback keeps Phase 1 usable when backend endpoint is temporarily unreachable.
  }

  return FALLBACK_RESTAURANTS;
}
