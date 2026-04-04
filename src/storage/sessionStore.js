import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../config/constants';
import { sanitizeRestaurantSlug } from '../utils/url';

const RECENT_RESTAURANTS_LIMIT = 10;

function sanitizeSlugList(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  const seen = new Set();
  const slugs = [];

  input.forEach((value) => {
    const slug = sanitizeRestaurantSlug(value);
    if (!slug || seen.has(slug)) {
      return;
    }

    seen.add(slug);
    slugs.push(slug);
  });

  return slugs;
}

export async function getLastRestaurantSlug() {
  try {
    const storedValue = await AsyncStorage.getItem(STORAGE_KEYS.lastRestaurantSlug);
    return sanitizeRestaurantSlug(storedValue);
  } catch {
    return null;
  }
}

export async function setLastRestaurantSlug(slug) {
  const sanitizedSlug = sanitizeRestaurantSlug(slug);
  if (!sanitizedSlug) {
    return;
  }

  try {
    await AsyncStorage.setItem(STORAGE_KEYS.lastRestaurantSlug, sanitizedSlug);
  } catch {
    // Ignore storage failures to avoid blocking menu access.
  }
}

export async function getRecentRestaurantSlugs() {
  try {
    const storedValue = await AsyncStorage.getItem(STORAGE_KEYS.recentRestaurants);
    if (!storedValue) {
      return [];
    }

    const parsed = JSON.parse(storedValue);
    return sanitizeSlugList(parsed).slice(0, RECENT_RESTAURANTS_LIMIT);
  } catch {
    return [];
  }
}

export async function pushRecentRestaurantSlug(slug) {
  const sanitizedSlug = sanitizeRestaurantSlug(slug);
  if (!sanitizedSlug) {
    return [];
  }

  const existing = await getRecentRestaurantSlugs();
  const next = [sanitizedSlug, ...existing.filter((value) => value !== sanitizedSlug)].slice(
    0,
    RECENT_RESTAURANTS_LIMIT,
  );

  try {
    await AsyncStorage.setItem(STORAGE_KEYS.recentRestaurants, JSON.stringify(next));
  } catch {
    // Ignore storage failures to avoid blocking menu access.
  }

  return next;
}
