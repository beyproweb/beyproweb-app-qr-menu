const CATEGORY_MATCHERS = {
  all: () => true,
  food: (restaurant) => String(restaurant.venue_type || '').toLowerCase().includes('food'),
  cafe: (restaurant) => String(restaurant.venue_type || '').toLowerCase().includes('cafe'),
  pub: (restaurant) => String(restaurant.venue_type || '').toLowerCase().includes('pub'),
  live_music: (restaurant) => {
    const venueType = String(restaurant.venue_type || '').toLowerCase();
    return (
      venueType.includes('live') ||
      venueType.includes('music') ||
      venueType.includes('concert') ||
      venueType.includes('event') ||
      Boolean(restaurant.supports_tickets)
    );
  },
  grocery: (restaurant) =>
    Boolean(restaurant.supports_delivery) || Boolean(restaurant.supports_pickup),
  tickets: (restaurant) => Boolean(restaurant.supports_tickets),
  reservation: (restaurant) => Boolean(restaurant.supports_reservation),
  delivery: (restaurant) => Boolean(restaurant.supports_delivery),
};

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

export function matchRestaurantBySearch(restaurant, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    restaurant.name,
    restaurant.slug,
    restaurant.venue_type,
    restaurant.short_description,
    restaurant.location,
  ]
    .map(normalizeText)
    .join(' ');

  return haystack.includes(normalizedQuery);
}

export function matchRestaurantByCategory(restaurant, categoryId) {
  const normalizedCategory = normalizeText(categoryId) || 'all';
  const matcher = CATEGORY_MATCHERS[normalizedCategory] || CATEGORY_MATCHERS.all;
  return matcher(restaurant);
}

export function filterRestaurants(restaurants, query, categoryId) {
  const list = Array.isArray(restaurants) ? restaurants : [];
  return list.filter(
    (restaurant) =>
      matchRestaurantBySearch(restaurant, query) &&
      matchRestaurantByCategory(restaurant, categoryId),
  );
}

export function mapRestaurantsBySlug(restaurants) {
  const map = new Map();
  (Array.isArray(restaurants) ? restaurants : []).forEach((restaurant) => {
    if (restaurant && restaurant.slug) {
      map.set(restaurant.slug, restaurant);
    }
  });
  return map;
}
