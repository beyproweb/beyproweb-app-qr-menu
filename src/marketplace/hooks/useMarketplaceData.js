import { useCallback, useEffect, useMemo, useState } from 'react';

import { getRecentRestaurantSlugs } from '../../storage/sessionStore';
import { fetchMarketplaceRestaurants } from '../services/marketplaceCatalogService';
import { reverseGeocodeAddress, reverseGeocodeCity } from '../services/locationService';
import {
  getFavoriteRestaurantSlugs,
  setFavoriteRestaurantSlugs,
} from '../services/marketplaceStorageService';
import { filterRestaurants, mapRestaurantsBySlug } from '../utils/restaurantFilters';
import { useCurrentLocation } from './useCurrentLocation';
import { useNearbyRestaurants } from './useNearbyRestaurants';

const MARKETPLACE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'food', label: 'Restaurants' },
  { id: 'live_music', label: 'Events' },
  { id: 'grocery', label: 'Grocery' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'reservation', label: 'Reservation' },
  { id: 'cafe', label: 'Cafe' },
  { id: 'pub', label: 'Pub' },
];

function getRestaurantKey(restaurant) {
  if (!restaurant || typeof restaurant !== 'object') {
    return '';
  }
  const slug = String(restaurant.slug || '').trim();
  if (slug) {
    return `slug:${slug.toLowerCase()}`;
  }
  const id = Number(restaurant.id);
  if (Number.isFinite(id) && id > 0) {
    return `id:${id}`;
  }
  return '';
}

function sortByDistanceAscending(restaurants) {
  return [...restaurants].sort((left, right) => {
    const leftDistance = Number(left.distance_km);
    const rightDistance = Number(right.distance_km);
    const safeLeft = Number.isFinite(leftDistance) ? leftDistance : Number.MAX_SAFE_INTEGER;
    const safeRight = Number.isFinite(rightDistance) ? rightDistance : Number.MAX_SAFE_INTEGER;
    return safeLeft - safeRight;
  });
}

function extractCityFromLocationText(value) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }

  const slashParts = text.split('/').map((item) => item.trim()).filter(Boolean);
  if (slashParts.length > 1) {
    return slashParts[slashParts.length - 1];
  }

  const commaParts = text.split(',').map((item) => item.trim()).filter(Boolean);
  if (commaParts.length > 1) {
    return commaParts[commaParts.length - 1];
  }

  return text;
}

function resolveNearestRestaurantCity(restaurants) {
  const sorted = sortByDistanceAscending(Array.isArray(restaurants) ? restaurants : []);
  for (const restaurant of sorted) {
    const city = extractCityFromLocationText(restaurant?.location);
    if (city) {
      return city;
    }
  }
  return '';
}

export function useMarketplaceData() {
  const [restaurants, setRestaurants] = useState([]);
  const [favoriteSlugs, setFavoriteSlugs] = useState([]);
  const [recentSlugs, setRecentSlugs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [detectedAddress, setDetectedAddress] = useState('');
  const [detectedCity, setDetectedCity] = useState('');
  const location = useCurrentLocation();

  const refreshPersistedLists = useCallback(async () => {
    const [favorites, recents] = await Promise.all([
      getFavoriteRestaurantSlugs(),
      getRecentRestaurantSlugs(),
    ]);
    setFavoriteSlugs(favorites);
    setRecentSlugs(recents);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadMarketplace() {
      setLoading(true);
      const loadedRestaurants = await fetchMarketplaceRestaurants();
      if (!isMounted) {
        return;
      }
      setRestaurants(Array.isArray(loadedRestaurants) ? loadedRestaurants : []);
      await refreshPersistedLists();
      if (isMounted) {
        setLoading(false);
      }
    }

    loadMarketplace();

    return () => {
      isMounted = false;
    };
  }, [refreshPersistedLists]);

  const restaurantsBySlug = useMemo(() => mapRestaurantsBySlug(restaurants), [restaurants]);

  const filteredRestaurants = useMemo(
    // Phase 2: extend with backend-powered ranking + advanced filters (open-now, events, delivery SLA).
    () => filterRestaurants(restaurants, searchQuery, selectedCategory),
    [restaurants, searchQuery, selectedCategory],
  );
  const searchRestaurants = useMemo(
    () => filterRestaurants(restaurants, searchQuery, 'all'),
    [restaurants, searchQuery],
  );

  const filteredBySlug = useMemo(() => mapRestaurantsBySlug(filteredRestaurants), [filteredRestaurants]);

  const recentRestaurants = useMemo(
    () => recentSlugs.map((slug) => filteredBySlug.get(slug)).filter(Boolean),
    [filteredBySlug, recentSlugs],
  );

  const favoriteRestaurants = useMemo(
    () => favoriteSlugs.map((slug) => filteredBySlug.get(slug)).filter(Boolean),
    [favoriteSlugs, filteredBySlug],
  );

  const nearbyFeed = useNearbyRestaurants({
    enabled: !location.loading && !location.error,
    latitude: location.latitude,
    longitude: location.longitude,
    radiusKm: 5,
  });

  const nearbyRestaurantsByLocation = useMemo(
    () => sortByDistanceAscending(nearbyFeed.restaurants || []),
    [nearbyFeed.restaurants],
  );

  const nearbyFilteredRestaurants = useMemo(
    () =>
      filterRestaurants(
        nearbyRestaurantsByLocation,
        searchQuery,
        selectedCategory,
      ).slice(0, 8),
    [nearbyRestaurantsByLocation, searchQuery, selectedCategory],
  );
  const nearbyRestaurantKeys = useMemo(
    () =>
      nearbyRestaurantsByLocation
        .map((restaurant) => getRestaurantKey(restaurant))
        .filter(Boolean),
    [nearbyRestaurantsByLocation],
  );

  useEffect(() => {
    let cancelled = false;

    async function resolveDetectedCity() {
      if (!Number.isFinite(Number(location.latitude)) || !Number.isFinite(Number(location.longitude))) {
        setDetectedAddress('');
        setDetectedCity('');
        return;
      }

      const [city, address] = await Promise.all([
        reverseGeocodeCity({
          latitude: location.latitude,
          longitude: location.longitude,
        }),
        reverseGeocodeAddress({
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      ]);

      if (!cancelled) {
        setDetectedAddress(address || '');
        setDetectedCity(city || '');
      }
    }

    resolveDetectedCity();

    return () => {
      cancelled = true;
    };
  }, [location.latitude, location.longitude]);

  const fallbackCity = useMemo(() => {
    const fromNearby = resolveNearestRestaurantCity(nearbyRestaurantsByLocation);
    if (fromNearby) {
      return fromNearby;
    }
    return resolveNearestRestaurantCity(filteredRestaurants);
  }, [nearbyRestaurantsByLocation, filteredRestaurants]);

  const locationLabel = useMemo(() => {
    if (detectedCity) {
      return detectedCity;
    }
    if (fallbackCity) {
      return fallbackCity;
    }
    if (location.loading) {
      return 'Locating...';
    }
    if (location.error) {
      return 'Location off';
    }
    return 'Near you';
  }, [detectedCity, fallbackCity, location.error, location.loading]);
  const locationAddress = useMemo(() => {
    if (detectedAddress) {
      return detectedAddress;
    }
    if (detectedCity) {
      return detectedCity;
    }
    if (fallbackCity) {
      return fallbackCity;
    }
    if (location.loading) {
      return 'Locating...';
    }
    if (location.error) {
      return 'Location off';
    }
    return 'Near you';
  }, [detectedAddress, detectedCity, fallbackCity, location.error, location.loading]);

  const nearbyLoading =
    location.loading || (!location.error && nearbyFeed.loading);
  const nearbyError = location.error || nearbyFeed.error || null;

  const toggleFavorite = useCallback(async (slug) => {
    if (!slug) {
      return;
    }

    setFavoriteSlugs((previous) => {
      const next = previous.includes(slug)
        ? previous.filter((item) => item !== slug)
        : [slug, ...previous];
      setFavoriteRestaurantSlugs(next);
      return next;
    });
  }, []);

  const findRestaurantBySlug = useCallback(
    (slug) => restaurantsBySlug.get(slug) || null,
    [restaurantsBySlug],
  );

  return {
    categories: MARKETPLACE_CATEGORIES,
    favoriteRestaurants,
    favoriteSlugs,
    findRestaurantBySlug,
    filteredRestaurants,
    nearbyRestaurantKeys,
    locationAddress,
    locationLatitude: location.latitude,
    locationLabel,
    locationLongitude: location.longitude,
    loading,
    nearbyError,
    nearbyLoading,
    nearbyRestaurants: nearbyFilteredRestaurants,
    recentRestaurants,
    refreshPersistedLists,
    searchRestaurants,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    toggleFavorite,
  };
}
