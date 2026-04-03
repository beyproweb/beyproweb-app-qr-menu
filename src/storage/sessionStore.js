import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../config/constants';
import { sanitizeRestaurantSlug } from '../utils/url';

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
