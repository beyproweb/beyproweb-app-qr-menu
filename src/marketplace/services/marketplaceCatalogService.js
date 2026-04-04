import { MARKETPLACE_API_URL } from '../../config/urls';
import { sanitizeRestaurantSlug } from '../../utils/url';

const FALLBACK_RESTAURANTS = [
  {
    id: 'fallback-1',
    slug: 'beypro-demo-food',
    name: 'Beypro Demo Food',
    logo: '',
    cover_image: '',
    venue_type: 'Food',
    short_description: 'Marketplace fallback venue while live feed is unavailable.',
    is_open: true,
    supports_qr_order: true,
    supports_reservation: true,
    supports_tickets: false,
    supports_delivery: true,
    supports_pickup: true,
    is_featured: true,
    location: '',
    distance_km: null,
  },
];

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
  const logo = sanitizeText(record.logo);
  const coverImage = sanitizeText(record.cover_image);
  const shortDescription =
    sanitizeText(record.short_description) || sanitizeText(record.description);

  return {
    id,
    slug,
    name,
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
    distance_km: normalizeDistance(record.distance_km),
  };
}

async function fetchMarketplaceFromApi() {
  const response = await fetch(MARKETPLACE_API_URL, {
    headers: {
      Accept: 'application/json',
    },
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Marketplace API responded with ${response.status}`);
  }

  const payload = await response.json();
  const restaurants = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.restaurants)
      ? payload.restaurants
      : [];

  return restaurants
    .map((record, index) => normalizeRestaurantRecord(record, index))
    .filter(Boolean);
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
