import { useCallback, useEffect, useMemo, useState } from 'react';

import { getRecentRestaurantSlugs } from '../../storage/sessionStore';
import { fetchMarketplaceRestaurants } from '../services/marketplaceCatalogService';
import {
  getFavoriteRestaurantSlugs,
  setFavoriteRestaurantSlugs,
} from '../services/marketplaceStorageService';
import { filterRestaurants, mapRestaurantsBySlug } from '../utils/restaurantFilters';

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

function sortByDistanceAscending(restaurants) {
  return [...restaurants].sort((left, right) => {
    const leftDistance = Number(left.distance_km);
    const rightDistance = Number(right.distance_km);
    const safeLeft = Number.isFinite(leftDistance) ? leftDistance : Number.MAX_SAFE_INTEGER;
    const safeRight = Number.isFinite(rightDistance) ? rightDistance : Number.MAX_SAFE_INTEGER;
    return safeLeft - safeRight;
  });
}

export function useMarketplaceData() {
  const [restaurants, setRestaurants] = useState([]);
  const [favoriteSlugs, setFavoriteSlugs] = useState([]);
  const [recentSlugs, setRecentSlugs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

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

  const filteredBySlug = useMemo(() => mapRestaurantsBySlug(filteredRestaurants), [filteredRestaurants]);

  const recentRestaurants = useMemo(
    () => recentSlugs.map((slug) => filteredBySlug.get(slug)).filter(Boolean),
    [filteredBySlug, recentSlugs],
  );

  const favoriteRestaurants = useMemo(
    () => favoriteSlugs.map((slug) => filteredBySlug.get(slug)).filter(Boolean),
    [favoriteSlugs, filteredBySlug],
  );

  const featuredRestaurants = useMemo(
    () => filteredRestaurants.filter((restaurant) => restaurant.is_featured),
    [filteredRestaurants],
  );

  const nearbyRestaurants = useMemo(
    () => sortByDistanceAscending(filteredRestaurants).slice(0, 8),
    [filteredRestaurants],
  );

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
    featuredRestaurants,
    findRestaurantBySlug,
    filteredRestaurants,
    loading,
    nearbyRestaurants,
    recentRestaurants,
    refreshPersistedLists,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    toggleFavorite,
  };
}
