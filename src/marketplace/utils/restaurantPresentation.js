export function getRestaurantFeatureBadges(restaurant) {
  if (restaurant == null) {
    return [];
  }

  const badges = [];

  if (restaurant.supports_qr_order) {
    badges.push('QR Order');
  }
  if (restaurant.supports_reservation) {
    badges.push('Reservation');
  }
  if (restaurant.supports_tickets) {
    badges.push('Tickets');
  }
  if (restaurant.supports_delivery) {
    badges.push('Delivery');
  }
  if (restaurant.supports_pickup) {
    badges.push('Pickup');
  }

  return badges;
}

export function formatRestaurantSubtitle(restaurant) {
  if (restaurant == null) {
    return '';
  }

  if (restaurant.short_description) {
    return restaurant.short_description;
  }

  return restaurant.venue_type || '';
}

export function formatDistanceLabel(distanceKm) {
  const value = Number(distanceKm);
  if (Number.isFinite(value) === false || value < 0) {
    return null;
  }

  return value.toFixed(1) + ' km away';
}
