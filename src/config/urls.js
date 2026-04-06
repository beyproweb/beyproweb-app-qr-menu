import { normalizeBaseUrl, safeParseUrl } from '../utils/url';

const DEFAULT_WEB_BASE_URL = 'https://www.beypro.com';
const DEFAULT_APP_LINK_BASE_URL = 'https://app.beypro.com';
const DEFAULT_DEEP_LINK_SCHEME = 'beypro';
const DEFAULT_WEB_ENTRY_PATH = '/menu';
const DEFAULT_MARKETPLACE_API_URL = 'https://hurrypos-backend.onrender.com/api/public/marketplace/restaurants';
const DEFAULT_NEARBY_RESTAURANTS_API_URL =
  'https://hurrypos-backend.onrender.com/api/public/restaurants/nearby';
const DEFAULT_MARKETPLACE_AUTH_API_URL = 'https://hurrypos-backend.onrender.com/api/auth';

const rawWebBaseUrl = process.env.EXPO_PUBLIC_WEB_BASE_URL;
const rawAppLinkBaseUrl = process.env.EXPO_PUBLIC_APP_LINK_BASE_URL;
const rawDeepLinkScheme = process.env.EXPO_PUBLIC_DEEP_LINK_SCHEME;
const rawExtraInternalHosts = process.env.EXPO_PUBLIC_INTERNAL_HOSTS;
const rawWebEntryPath = process.env.EXPO_PUBLIC_WEB_ENTRY_PATH;
const rawDefaultRestaurantSlug = process.env.EXPO_PUBLIC_DEFAULT_RESTAURANT_SLUG;
const rawMarketplaceApiUrl = process.env.EXPO_PUBLIC_MARKETPLACE_API_URL;
const rawNearbyRestaurantsApiUrl = process.env.EXPO_PUBLIC_NEARBY_RESTAURANTS_API_URL;
const rawMarketplaceAuthApiUrl = process.env.EXPO_PUBLIC_MARKETPLACE_AUTH_API_URL;

function readHostFromBaseUrl(baseUrl) {
  const parsed = safeParseUrl(baseUrl);
  return parsed ? parsed.host : '';
}

export const WEB_BASE_URL = normalizeBaseUrl(rawWebBaseUrl, DEFAULT_WEB_BASE_URL);
export const APP_LINK_BASE_URL = normalizeBaseUrl(rawAppLinkBaseUrl, DEFAULT_APP_LINK_BASE_URL);
export const MARKETPLACE_API_URL = normalizeBaseUrl(
  rawMarketplaceApiUrl,
  DEFAULT_MARKETPLACE_API_URL,
);
export const NEARBY_RESTAURANTS_API_URL = normalizeBaseUrl(
  rawNearbyRestaurantsApiUrl,
  DEFAULT_NEARBY_RESTAURANTS_API_URL,
);
export const MARKETPLACE_AUTH_API_URL = normalizeBaseUrl(
  rawMarketplaceAuthApiUrl,
  DEFAULT_MARKETPLACE_AUTH_API_URL,
);
export const DEEP_LINK_SCHEME = rawDeepLinkScheme || DEFAULT_DEEP_LINK_SCHEME;
export const INTERNAL_ROOT_DOMAIN = 'beypro.com';
export const WEB_ENTRY_PATH = rawWebEntryPath && rawWebEntryPath.startsWith('/')
  ? rawWebEntryPath
  : DEFAULT_WEB_ENTRY_PATH;

export const WEB_HOST = readHostFromBaseUrl(WEB_BASE_URL);
export const APP_LINK_HOST = readHostFromBaseUrl(APP_LINK_BASE_URL);
export const DEFAULT_RESTAURANT_SLUG = String(rawDefaultRestaurantSlug || '').trim();

const extraInternalHosts = rawExtraInternalHosts
  ? rawExtraInternalHosts
      .split(',')
      .map((host) => host.trim())
      .filter(Boolean)
  : [];

export const INTERNAL_HOSTS = Array.from(
  new Set([WEB_HOST, APP_LINK_HOST, INTERNAL_ROOT_DOMAIN, ...extraInternalHosts].filter(Boolean)),
);
