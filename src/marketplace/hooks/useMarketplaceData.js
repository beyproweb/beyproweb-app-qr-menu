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

const DEBUG_NEARBY =
  (typeof __DEV__ !== 'undefined' && __DEV__) ||
  (typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production');

function logNearbyDebug(label, payload = {}) {
  if (!DEBUG_NEARBY) {
    return;
  }
  // eslint-disable-next-line no-console
  console.log(`[nearby][data] ${label}`, payload);
}

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

function normalizeCityToken(value) {
  const text = String(value || '').trim().toLocaleLowerCase('tr-TR');
  if (!text) {
    return '';
  }
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/gi, '');
}

function buildAreaTokenSet(value) {
  const text = String(value || '').trim();
  if (!text) {
    return new Set();
  }
  const tokenSet = new Set();
  const segments = text.split(/[\/,;|]+/).map((segment) => segment.trim()).filter(Boolean);

  segments.forEach((segment) => {
    const normalizedSegment = normalizeCityToken(segment);
    if (normalizedSegment) {
      tokenSet.add(normalizedSegment);
    }

    const normalizedWords = String(segment)
      .toLocaleLowerCase('tr-TR')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ş/g, 's')
      .replace(/ç/g, 'c')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .split(/[^a-z0-9]+/gi)
      .map((word) => word.trim())
      .filter((word) => word.length >= 2 && !/^\d+$/.test(word));

    normalizedWords.forEach((word) => tokenSet.add(word));
  });

  return tokenSet;
}

function toFiniteCoordinate(value) {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function haversineDistanceKm(originLat, originLng, targetLat, targetLng) {
  const lat1 = toFiniteCoordinate(originLat);
  const lng1 = toFiniteCoordinate(originLng);
  const lat2 = toFiniteCoordinate(targetLat);
  const lng2 = toFiniteCoordinate(targetLng);
  if ([lat1, lng1, lat2, lng2].some((item) => item === null)) {
    return null;
  }

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);
  const startLatRad = toRadians(lat1);
  const endLatRad = toRadians(lat2);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(startLatRad) * Math.cos(endLatRad) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function resolveRestaurantDistanceKm(restaurant, userLatitude, userLongitude) {
  const apiDistanceKm = Number(restaurant?.distance_km);
  if (Number.isFinite(apiDistanceKm) && apiDistanceKm >= 0) {
    return apiDistanceKm;
  }

  return haversineDistanceKm(
    userLatitude,
    userLongitude,
    restaurant?.pos_location_lat,
    restaurant?.pos_location_lng,
  );
}

function getRestaurantDeliveryBlockReason(restaurant, detectedCity, userLatitude, userLongitude) {
  if (!restaurant || typeof restaurant !== 'object') {
    return 'invalid_payload';
  }
  if (!restaurant.supports_delivery) {
    return 'delivery_disabled';
  }
  const distanceKm = resolveRestaurantDistanceKm(restaurant, userLatitude, userLongitude);
  if (!Number.isFinite(distanceKm)) {
    return 'missing_distance_or_coords';
  }
  const configuredRangeKm = Number(restaurant?.delivery_range_km);
  if (Number.isFinite(configuredRangeKm) && configuredRangeKm > 0 && distanceKm > configuredRangeKm) {
    return 'outside_delivery_range';
  }
  if (!isRestaurantAllowedForCity(restaurant, detectedCity)) {
    return 'outside_delivery_city';
  }
  return null;
}

function isRestaurantAllowedForCity(restaurant, detectedCity) {
  const userCityToken = normalizeCityToken(detectedCity);
  if (!userCityToken) {
    return true;
  }

  const configuredCities = Array.isArray(restaurant?.delivery_zone_cities)
    ? restaurant.delivery_zone_cities
    : [];
  const configuredTokens = configuredCities
    .map((city) => normalizeCityToken(city))
    .filter(Boolean);
  const configuredTokenSet = new Set(configuredTokens);
  if (configuredTokenSet.size === 0) {
    return true;
  }

  const restaurantAreaTokens = new Set([
    ...buildAreaTokenSet(restaurant?.location),
    ...buildAreaTokenSet(restaurant?.city),
  ]);
  restaurantAreaTokens.delete('');

  const requestedMatchesConfiguredZone = configuredTokenSet.has(userCityToken);
  const requestedMatchesRestaurantArea = restaurantAreaTokens.has(userCityToken);
  const configuredZoneMatchesRestaurantArea = Array.from(configuredTokenSet).some((token) =>
    restaurantAreaTokens.has(token),
  );

  return (
    requestedMatchesConfiguredZone ||
    (requestedMatchesRestaurantArea && configuredZoneMatchesRestaurantArea)
  );
}

function isRestaurantDeliverable(restaurant, detectedCity, userLatitude, userLongitude) {
  return (
    getRestaurantDeliveryBlockReason(
      restaurant,
      detectedCity,
      userLatitude,
      userLongitude,
    ) === null
  );
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
  const [locationLookupReady, setLocationLookupReady] = useState(false);
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
    city: detectedCity,
    radiusKm: 5,
  });

  const nearbyNormalizedRestaurants = useMemo(
    () =>
      (nearbyFeed.restaurants || []).map((restaurant) => {
        const resolvedDistanceKm = resolveRestaurantDistanceKm(
          restaurant,
          location.latitude,
          location.longitude,
        );
        if (!Number.isFinite(resolvedDistanceKm)) {
          return restaurant;
        }
        return {
          ...restaurant,
          distance_km: Number(resolvedDistanceKm.toFixed(3)),
        };
      }),
    [location.latitude, location.longitude, nearbyFeed.restaurants],
  );

  const nearbyFilterStats = useMemo(() => {
    const stats = {
      total: nearbyNormalizedRestaurants.length,
      kept: 0,
      dropped: {
        invalid_payload: 0,
        delivery_disabled: 0,
        missing_distance_or_coords: 0,
        outside_delivery_range: 0,
        outside_delivery_city: 0,
        other: 0,
      },
    };

    nearbyNormalizedRestaurants.forEach((restaurant) => {
      const reason = getRestaurantDeliveryBlockReason(
        restaurant,
        detectedCity,
        location.latitude,
        location.longitude,
      );
      if (!reason) {
        stats.kept += 1;
        return;
      }
      if (Object.prototype.hasOwnProperty.call(stats.dropped, reason)) {
        stats.dropped[reason] += 1;
        return;
      }
      stats.dropped.other += 1;
    });

    return stats;
  }, [detectedCity, location.latitude, location.longitude, nearbyNormalizedRestaurants]);

  const nearbyRestaurantsByLocation = useMemo(
    () =>
      sortByDistanceAscending(
        nearbyNormalizedRestaurants.filter((restaurant) =>
          isRestaurantDeliverable(
            restaurant,
            detectedCity,
            location.latitude,
            location.longitude,
          ),
        ),
      ),
    [detectedCity, location.latitude, location.longitude, nearbyNormalizedRestaurants],
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
    logNearbyDebug('pipeline', {
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        loading: location.loading,
        error: location.error || null,
      },
      detected_city: detectedCity || null,
      location_lookup_ready: locationLookupReady,
      nearby_feed: {
        loading: nearbyFeed.loading,
        error: nearbyFeed.error || null,
        total: nearbyFeed.restaurants?.length || 0,
      },
      delivery_filter: nearbyFilterStats,
      final_visible_count: nearbyFilteredRestaurants.length,
      search_query: searchQuery || '',
      selected_category: selectedCategory,
    });
  }, [
    detectedCity,
    location.latitude,
    location.longitude,
    location.loading,
    location.error,
    locationLookupReady,
    nearbyFeed.loading,
    nearbyFeed.error,
    nearbyFeed.restaurants,
    nearbyFilterStats,
    nearbyFilteredRestaurants.length,
    searchQuery,
    selectedCategory,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function resolveDetectedCity() {
      if (
        toFiniteCoordinate(location.latitude) === null ||
        toFiniteCoordinate(location.longitude) === null
      ) {
        setDetectedAddress('');
        setDetectedCity('');
        setLocationLookupReady(true);
        return;
      }

      setLocationLookupReady(false);
      try {
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
      } finally {
        if (!cancelled) {
          setLocationLookupReady(true);
        }
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
