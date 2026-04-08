import { useEffect, useMemo, useState } from 'react';

import { fetchNearbyRestaurants } from '../services/marketplaceCatalogService';

const nearbyRestaurantsCache = new Map();
const inFlightNearbyRequests = new Map();
const DEBUG_NEARBY =
  (typeof __DEV__ !== 'undefined' && __DEV__) ||
  (typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production');

function logNearbyDebug(label, payload = {}) {
  if (!DEBUG_NEARBY) {
    return;
  }
  // eslint-disable-next-line no-console
  console.log(`[nearby][hook] ${label}`, payload);
}

function isFiniteCoordinate(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  if (typeof value === 'boolean') {
    return false;
  }
  return Number.isFinite(Number(value));
}

function normalizeCityQuery(value) {
  return String(value || '').trim().toLowerCase();
}

function toRequestKey(latitude, longitude, radiusKm, city) {
  const cityKey = normalizeCityQuery(city) || 'na';
  return `${Number(latitude).toFixed(4)}:${Number(longitude).toFixed(4)}:${Number(radiusKm).toFixed(2)}:${cityKey}`;
}

const INITIAL_STATE = {
  restaurants: [],
  loading: false,
  error: null,
};

export function useNearbyRestaurants({
  enabled = true,
  latitude,
  longitude,
  city = '',
  radiusKm = 5,
} = {}) {
  const [state, setState] = useState(INITIAL_STATE);

  const canFetch = enabled && isFiniteCoordinate(latitude) && isFiniteCoordinate(longitude);
  const requestKey = useMemo(
    () => (canFetch ? toRequestKey(latitude, longitude, radiusKm, city) : ''),
    [canFetch, latitude, longitude, radiusKm, city],
  );

  useEffect(() => {
    if (!canFetch) {
      logNearbyDebug('skip_fetch', {
        enabled,
        latitude,
        longitude,
        city,
        radiusKm,
      });
      setState(INITIAL_STATE);
      return undefined;
    }

    const cached = nearbyRestaurantsCache.get(requestKey);
    if (cached) {
      logNearbyDebug('cache_hit', {
        requestKey,
        count: cached.length,
      });
      setState({
        restaurants: cached,
        loading: false,
        error: null,
      });
      return undefined;
    }

    let cancelled = false;
    logNearbyDebug('start_fetch', {
      requestKey,
      latitude,
      longitude,
      city,
      radiusKm,
    });
    setState((previous) => ({ ...previous, loading: true, error: null }));

    let requestPromise = inFlightNearbyRequests.get(requestKey);
    if (!requestPromise) {
      requestPromise = fetchNearbyRestaurants({ latitude, longitude, city, radiusKm });
      inFlightNearbyRequests.set(requestKey, requestPromise);
    }

    requestPromise
      .then((restaurants) => {
        if (cancelled) {
          return;
        }
        const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];
        logNearbyDebug('fetch_success', {
          requestKey,
          count: safeRestaurants.length,
        });
        nearbyRestaurantsCache.set(requestKey, safeRestaurants);
        setState({
          restaurants: safeRestaurants,
          loading: false,
          error: null,
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        const errorMessage = String(error?.message || 'Unable to load nearby restaurants');
        logNearbyDebug('fetch_error', {
          requestKey,
          error: errorMessage,
        });
        setState({
          restaurants: [],
          loading: false,
          error: errorMessage,
        });
      })
      .finally(() => {
        const activeRequest = inFlightNearbyRequests.get(requestKey);
        if (activeRequest === requestPromise) {
          inFlightNearbyRequests.delete(requestKey);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [canFetch, latitude, longitude, city, radiusKm, requestKey]);

  return state;
}
