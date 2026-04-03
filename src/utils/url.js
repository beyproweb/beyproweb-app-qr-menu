export function safeParseUrl(value) {
  if (!value || typeof value !== 'string') {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function normalizeBaseUrl(value, fallback) {
  const parsed = safeParseUrl(value);
  if (!parsed) {
    return fallback;
  }

  const normalizedPath = parsed.pathname.replace(/\/+$/, '');
  return `${parsed.origin}${normalizedPath}`;
}

export function normalizePathname(pathname) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function sanitizeRestaurantSlug(rawSlug) {
  if (!rawSlug || typeof rawSlug !== 'string') {
    return null;
  }

  const decoded = decodeURIComponent(rawSlug).trim();
  if (!decoded) {
    return null;
  }

  const firstSegment = decoded.replace(/^\/+/, '').split('/')[0].trim();
  if (!firstSegment) {
    return null;
  }

  const isValidSlug = /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(firstSegment);
  return isValidSlug ? firstSegment : null;
}

export function extractFirstPathSegment(pathname) {
  if (!pathname || typeof pathname !== 'string') {
    return null;
  }

  const segment = pathname.replace(/^\/+/, '').split('/')[0] || '';
  return sanitizeRestaurantSlug(segment);
}

export function isHttpUrl(urlObject) {
  if (!urlObject) {
    return false;
  }

  return urlObject.protocol === 'http:' || urlObject.protocol === 'https:';
}

export function isSameHostOrSubdomain(hostname, rootHost) {
  if (!hostname || !rootHost) {
    return false;
  }

  return hostname === rootHost || hostname.endsWith(`.${rootHost}`);
}

export function buildUrlFromBase(baseUrl, pathname = '/', search = '', hash = '') {
  const normalizedPath = normalizePathname(pathname);
  const normalizedSearch = search || '';
  const normalizedHash = hash || '';

  return `${baseUrl}${normalizedPath}${normalizedSearch}${normalizedHash}`;
}
