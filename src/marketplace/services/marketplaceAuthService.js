import AsyncStorage from '@react-native-async-storage/async-storage';

import { MARKETPLACE_AUTH_API_URL } from '../../config/urls';

const AUTH_SCOPE = 'marketplace_customer';
const STORAGE_KEYS = {
  customer: 'beypro_marketplace_customer_session',
  legacyUsers: 'qr_customer_users',
  token: 'beypro_marketplace_customer_token',
};

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}

function normalizePhone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00') && digits.length > 2) digits = digits.slice(2);
  if (digits.startsWith('90') && digits.length > 10) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length > 10) digits = digits.slice(1);
  return digits;
}

function sanitizeCustomer(customer) {
  if (!customer || typeof customer !== 'object') {
    return null;
  }

  const id = Number(customer.id);
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }

  return {
    address: normalizeText(customer.address),
    email: normalizeEmail(customer.email),
    id,
    language: normalizeText(customer.language),
    name:
      normalizeText(customer.name || customer.full_name || customer.username) ||
      'Customer',
    phone: normalizePhone(customer.phone),
    updatedAt: customer.updated_at || customer.updatedAt || null,
  };
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function resolveErrorMessage(payload, fallbackMessage) {
  const errorMessage =
    normalizeText(payload?.error) ||
    normalizeText(payload?.message) ||
    normalizeText(payload?.details) ||
    fallbackMessage;
  return errorMessage || fallbackMessage;
}

async function requestMarketplaceAuth(path, options = {}) {
  const endpoint = `${MARKETPLACE_AUTH_API_URL}${path}`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    method: options.method || 'GET',
    body: options.body,
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(resolveErrorMessage(payload, `Auth request failed (${response.status})`));
  }

  return payload || {};
}

async function saveSession({ customer, token }) {
  const sanitizedCustomer = sanitizeCustomer(customer);
  const normalizedToken = normalizeText(token);

  if (!sanitizedCustomer || !normalizedToken) {
    await clearSession();
    return null;
  }

  await AsyncStorage.multiSet([
    [STORAGE_KEYS.customer, JSON.stringify(sanitizedCustomer)],
    [STORAGE_KEYS.token, normalizedToken],
  ]);
  await AsyncStorage.removeItem(STORAGE_KEYS.legacyUsers);

  return {
    customer: sanitizedCustomer,
    token: normalizedToken,
  };
}

export async function clearSession() {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.customer,
    STORAGE_KEYS.legacyUsers,
    STORAGE_KEYS.token,
  ]);
}

export async function getStoredMarketplaceToken() {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.token);
  return normalizeText(token);
}

export async function getStoredMarketplaceCustomer() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.customer);
  if (!raw) {
    return null;
  }

  try {
    return sanitizeCustomer(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function restoreMarketplaceSession() {
  const [storedCustomer, storedToken] = await Promise.all([
    getStoredMarketplaceCustomer(),
    getStoredMarketplaceToken(),
  ]);

  if (!storedToken) {
    if (storedCustomer) {
      await clearSession();
    }
    return null;
  }

  try {
    const payload = await requestMarketplaceAuth('/me', {
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
      method: 'GET',
    });

    const customer = sanitizeCustomer(payload.customer);
    if (!customer) {
      await clearSession();
      return null;
    }

    return saveSession({ customer, token: storedToken });
  } catch {
    await clearSession();
    return null;
  }
}

export async function loginMarketplaceSession({ login, password }) {
  const normalizedLogin = normalizeText(login);
  const normalizedPassword = normalizeText(password);

  if (!normalizedLogin || !normalizedPassword) {
    throw new Error('Phone/email and password are required');
  }

  const payload = await requestMarketplaceAuth('/login', {
    body: JSON.stringify({
      login: normalizedLogin,
      password: normalizedPassword,
      scope: AUTH_SCOPE,
    }),
    method: 'POST',
  });

  return saveSession({ customer: payload.customer, token: payload.token });
}

export async function registerMarketplaceSession({
  address,
  email,
  name,
  password,
  phone,
}) {
  const normalizedName = normalizeText(name);
  const normalizedPassword = normalizeText(password);
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = normalizeEmail(email);
  const normalizedAddress = normalizeText(address);

  if (!normalizedName || !normalizedPassword || !normalizedPhone) {
    throw new Error('Name, phone, and password are required');
  }

  const payload = await requestMarketplaceAuth('/register', {
    body: JSON.stringify({
      address: normalizedAddress || undefined,
      email: normalizedEmail || undefined,
      name: normalizedName,
      password: normalizedPassword,
      phone: normalizedPhone,
      scope: AUTH_SCOPE,
    }),
    method: 'POST',
  });

  return saveSession({ customer: payload.customer, token: payload.token });
}
