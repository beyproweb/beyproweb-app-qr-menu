import {
  APP_LINK_HOST,
  DEFAULT_RESTAURANT_SLUG,
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

const MARKETPLACE_ROOT_PATHS = new Set(['marketplace', 'home']);

function extractFirstPathSegment(pathname) {
  if (!pathname || typeof pathname !== 'string') {
    return '';
  }

  const segments = pathname.replace(/^\/+/, '').split('/').filter(Boolean);
  return String(segments[0] || '').toLowerCase();
}

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

function mapExpoGoUrlToWebUrl(urlObject) {
  const protocol = String(urlObject.protocol || '').toLowerCase();
  if (protocol !== 'exp:' && protocol !== 'exps:') {
    return null;
  }

  const embeddedUrlParam = String(
    urlObject.searchParams.get('url') || urlObject.searchParams.get('linkingUri') || '',
  ).trim();
  if (embeddedUrlParam) {
    const embeddedRoute = mapIncomingUrlToWebRoute(embeddedUrlParam);
    if (embeddedRoute?.webUrl) {
      return embeddedRoute.webUrl;
    }
  }

  const pathname = String(urlObject.pathname || '');
  const markerIndex = pathname.indexOf('/--/');
  if (markerIndex >= 0) {
    const expoPath = pathname.slice(markerIndex + 3);
    const normalizedExpoPath = expoPath.startsWith('/') ? expoPath : `/${expoPath}`;
    return buildUrlFromBase(WEB_BASE_URL, normalizedExpoPath, urlObject.search, urlObject.hash);
  }

  return null;
}

export function buildWebUrlForSlug(slug) {
  const sanitizedSlug = sanitizeRestaurantSlug(slug);
  if (!sanitizedSlug) {
    return WEB_BASE_URL;
  }

  return buildUrlFromBase(WEB_BASE_URL, `/${sanitizedSlug}`);
}

export function buildRestaurantActionWebUrl(slug, action = 'order') {
  const sanitizedSlug = sanitizeRestaurantSlug(slug);
  if (!sanitizedSlug) {
    return buildDefaultWebUrl(null);
  }

  if (action === 'reserve') {
    return buildUrlFromBase(WEB_BASE_URL, `/${sanitizedSlug}/reserve`);
  }

  if (action === 'tickets' || action === 'ticket') {
    return buildUrlFromBase(WEB_BASE_URL, `/${sanitizedSlug}/concerts`);
  }

  return buildWebUrlForSlug(sanitizedSlug);
}

export function buildDefaultWebUrl(savedSlug) {
  const fallbackSlug = savedSlug || DEFAULT_RESTAURANT_SLUG;
  const slugUrl = buildWebUrlForSlug(fallbackSlug);
  if (fallbackSlug) {
    return slugUrl;
  }

  return buildUrlFromBase(WEB_BASE_URL, WEB_ENTRY_PATH);
}

export function mapIncomingUrlToWebRoute(incomingUrl) {
  const parsedUrl = safeParseUrl(incomingUrl);
  if (!parsedUrl) {
    return null;
  }

  const protocol = String(parsedUrl.protocol || '').toLowerCase();
  const isSchemeDeepLink = protocol === `${DEEP_LINK_SCHEME}:`;
  if (isSchemeDeepLink) {
    const schemePath = `${parsedUrl.host}${parsedUrl.pathname}`;
    const normalizedPath = schemePath.startsWith('/') ? schemePath : `/${schemePath}`;
    const firstSegment = extractFirstPathSegment(normalizedPath);
    if (MARKETPLACE_ROOT_PATHS.has(firstSegment)) {
      return {
        appMode: 'marketplace',
        slug: null,
        webUrl: null,
      };
    }
  }

  if (isHttpUrl(parsedUrl)) {
    const firstSegment = extractFirstPathSegment(parsedUrl.pathname);
    const isAppLinkHost = parsedUrl.host === APP_LINK_HOST;

    // Keep normal app opens on marketplace home for app-link host roots.
    if ((isAppLinkHost && !firstSegment) || MARKETPLACE_ROOT_PATHS.has(firstSegment)) {
      return {
        appMode: 'marketplace',
        slug: null,
        webUrl: null,
      };
    }
  }

  let mappedWebUrl = null;
  if (isHttpUrl(parsedUrl)) {
    mappedWebUrl = mapHttpUrlToWebUrl(parsedUrl);
  } else {
    mappedWebUrl = mapSchemeUrlToWebUrl(parsedUrl) || mapExpoGoUrlToWebUrl(parsedUrl);
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
