import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../../config/constants';
import { sanitizeRestaurantSlug } from '../../utils/url';

function sanitizeSlugList(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  const deduped = [];
  const seen = new Set();

  input.forEach((value) => {
    const slug = sanitizeRestaurantSlug(value);
    if (!slug || seen.has(slug)) {
      return;
    }
    seen.add(slug);
    deduped.push(slug);
  });

  return deduped;
}

export async function getFavoriteRestaurantSlugs() {
  try {
    const rawValue = await AsyncStorage.getItem(STORAGE_KEYS.favoriteRestaurants);
    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);
    return sanitizeSlugList(parsed);
  } catch {
    return [];
  }
}

export async function setFavoriteRestaurantSlugs(slugs) {
  const sanitized = sanitizeSlugList(slugs);
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.favoriteRestaurants, JSON.stringify(sanitized));
  } catch {
    // Keep local favorites optional; failures should not block core menu flow.
  }

  return sanitized;
}
