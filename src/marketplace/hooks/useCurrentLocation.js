import { useEffect, useState } from 'react';

import { getCurrentLocation } from '../services/locationService';

const INITIAL_STATE = {
  latitude: null,
  longitude: null,
  loading: true,
  error: null,
};

export function useCurrentLocation() {
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    async function resolveLocation() {
      setState((previous) => ({ ...previous, loading: true, error: null }));
      try {
        const location = await getCurrentLocation();
        if (cancelled) {
          return;
        }
        setState({
          latitude: location.latitude,
          longitude: location.longitude,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }
        setState({
          latitude: null,
          longitude: null,
          loading: false,
          error: String(error?.message || 'Location unavailable'),
        });
      }
    }

    resolveLocation();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
