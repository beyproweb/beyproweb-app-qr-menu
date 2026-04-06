import { useEffect, useMemo, useState } from 'react';

import { fetchNearbyRestaurants } from '../services/marketplaceCatalogService';

const nearbyRestaurantsCache = new Map();
const inFlightNearbyRequests = new Map();

function isFiniteCoordinate(value) {
  return Number.isFinite(Number(value));
}

function toRequestKey(latitude, longitude, radiusKm) {
  return `${Number(latitude).toFixed(4)}:${Number(longitude).toFixed(4)}:${Number(radiusKm).toFixed(2)}`;
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
  radiusKm = 5,
} = {}) {
  const [state, setState] = useState(INITIAL_STATE);

  const canFetch = enabled && isFiniteCoordinate(latitude) && isFiniteCoordinate(longitude);
  const requestKey = useMemo(
    () => (canFetch ? toRequestKey(latitude, longitude, radiusKm) : ''),
    [canFetch, latitude, longitude, radiusKm],
  );

  useEffect(() => {
    if (!canFetch) {
      setState(INITIAL_STATE);
      return undefined;
    }

    const cached = nearbyRestaurantsCache.get(requestKey);
    if (cached) {
      setState({
        restaurants: cached,
        loading: false,
        error: null,
      });
      return undefined;
    }

    let cancelled = false;
    setState((previous) => ({ ...previous, loading: true, error: null }));

    let requestPromise = inFlightNearbyRequests.get(requestKey);
    if (!requestPromise) {
      requestPromise = fetchNearbyRestaurants({ latitude, longitude, radiusKm });
      inFlightNearbyRequests.set(requestKey, requestPromise);
    }

    requestPromise
      .then((restaurants) => {
        if (cancelled) {
          return;
        }
        const safeRestaurants = Array.isArray(restaurants) ? restaurants : [];
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
        setState({
          restaurants: [],
          loading: false,
          error: String(error?.message || 'Unable to load nearby restaurants'),
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
  }, [canFetch, latitude, longitude, radiusKm, requestKey]);

  return state;
}
