import {
  APP_LINK_HOST,
  DEEP_LINK_SCHEME,
  INTERNAL_HOSTS,
  INTERNAL_ROOT_DOMAIN,
  WEB_BASE_URL,
  WEB_ENTRY_PATH,
} from '../config/urls';
import {
  buildUrlFromBase,
  isHttpUrl,
  isSameHostOrSubdomain,
  safeParseUrl,
  sanitizeRestaurantSlug,
} from '../utils/url';

const NON_RESTAURANT_ROOT_PATHS = new Set([
  '',
  'qr',
  'menu',
  'login',
  'register',
  'order-status',
  'orders',
  'reserve',
  'concerts',
]);

function extractRestaurantSlugFromPath(pathname) {
  if (!pathname || typeof pathname !== 'string') {
    return null;
  }

  const segments = pathname.replace(/^\/+/, '').split('/').filter(Boolean);
  if (!segments.length) {
    return null;
  }

  // Legacy public path: /qr-menu/:slug/:id
  if (segments[0] === 'qr-menu') {
    return sanitizeRestaurantSlug(segments[1] || null);
  }

  if (NON_RESTAURANT_ROOT_PATHS.has(segments[0])) {
    return null;
  }

  return sanitizeRestaurantSlug(segments[0]);
}

export function isInternalBeyproHost(host) {
  return INTERNAL_HOSTS.some((internalHost) => isSameHostOrSubdomain(host, internalHost));
}

function mapHttpUrlToWebUrl(urlObject) {
  if (urlObject.host === APP_LINK_HOST) {
    return buildUrlFromBase(WEB_BASE_URL, urlObject.pathname, urlObject.search, urlObject.hash);
  }

  if (isInternalBeyproHost(urlObject.host)) {
    return urlObject.toString();
  }

  return null;
}

function mapSchemeUrlToWebUrl(urlObject) {
  if (urlObject.protocol !== `${DEEP_LINK_SCHEME}:`) {
    return null;
  }

  const schemePath = `${urlObject.host}${urlObject.pathname}`;
  const normalizedPath = schemePath.startsWith('/') ? schemePath : `/${schemePath}`;

  return buildUrlFromBase(WEB_BASE_URL, normalizedPath, urlObject.search, urlObject.hash);
}

export function buildWebUrlForSlug(slug) {
  const sanitizedSlug = sanitizeRestaurantSlug(slug);
  if (!sanitizedSlug) {
    return WEB_BASE_URL;
  }

  return buildUrlFromBase(WEB_BASE_URL, `/${sanitizedSlug}`);
}

export function buildDefaultWebUrl(savedSlug) {
  const slugUrl = buildWebUrlForSlug(savedSlug);
  if (savedSlug) {
    return slugUrl;
  }

  return buildUrlFromBase(WEB_BASE_URL, WEB_ENTRY_PATH);
}

export function mapIncomingUrlToWebRoute(incomingUrl) {
  const parsedUrl = safeParseUrl(incomingUrl);
  if (!parsedUrl) {
    return null;
  }

  let mappedWebUrl = null;
  if (isHttpUrl(parsedUrl)) {
    mappedWebUrl = mapHttpUrlToWebUrl(parsedUrl);
  } else {
    mappedWebUrl = mapSchemeUrlToWebUrl(parsedUrl);
  }

  if (!mappedWebUrl) {
    return null;
  }

  const mappedParsedUrl = safeParseUrl(mappedWebUrl);
  const slug = mappedParsedUrl ? extractRestaurantSlugFromPath(mappedParsedUrl.pathname) : null;

  return {
    slug,
    webUrl: mappedWebUrl,
  };
}

export function extractSlugFromInternalWebUrl(webUrl) {
  const parsedUrl = safeParseUrl(webUrl);
  if (!parsedUrl || !isHttpUrl(parsedUrl)) {
    return null;
  }

  const isInternalHost = isInternalBeyproHost(parsedUrl.host);
  const isRootDomain = isSameHostOrSubdomain(parsedUrl.host, INTERNAL_ROOT_DOMAIN);

  if (!isInternalHost && !isRootDomain) {
    return null;
  }

  return extractRestaurantSlugFromPath(parsedUrl.pathname);
}
