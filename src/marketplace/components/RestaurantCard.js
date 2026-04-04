import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  formatDistanceLabel,
  getRestaurantFeatureBadges,
} from '../utils/restaurantPresentation';
import { FeatureBadgeList } from './FeatureBadgeList';

function OpenStatusBadge({ isOpen }) {
  return (
    <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}>
      <Text style={[styles.statusText, isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>
        {isOpen ? 'Open' : 'Closed'}
      </Text>
    </View>
  );
}

export function RestaurantCard({
  compact,
  isFavorite,
  onPress,
  onToggleFavorite,
  restaurant,
}) {
  if (!restaurant) {
    return null;
  }

  const featureBadges = getRestaurantFeatureBadges(restaurant);
  const distanceLabel = formatDistanceLabel(restaurant.distance_km);
  const avatarUri = String(restaurant.app_icon || restaurant.logo || '').trim();

  return (
    <Pressable onPress={onPress} style={[styles.card, compact ? styles.cardCompact : null]}>
      <View style={styles.coverWrap}>
        <Image resizeMode="cover" source={{ uri: restaurant.cover_image }} style={styles.coverImage} />
        <View style={styles.coverTopRow}>
          <OpenStatusBadge isOpen={restaurant.is_open} />
          <Pressable
            hitSlop={10}
            onPress={(event) => {
              event.stopPropagation();
              onToggleFavorite?.(restaurant.slug);
            }}
            style={[styles.favoriteButton, isFavorite ? styles.favoriteButtonActive : null]}
          >
            <Text style={[styles.favoriteText, isFavorite ? styles.favoriteTextActive : null]}>
              {isFavorite ? '★' : '☆'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.logo} />
          ) : (
            <View style={[styles.logo, styles.logoFallback]}>
              <Text style={styles.logoFallbackText}>
                {String(restaurant.name || '?').trim().charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View style={styles.titleBlock}>
            <Text numberOfLines={1} style={styles.name}>
              {restaurant.name}
            </Text>
            <Text numberOfLines={1} style={styles.venueType}>
              {restaurant.venue_type}
            </Text>
          </View>
        </View>

        {distanceLabel ? <Text style={styles.distance}>{distanceLabel}</Text> : null}

        <FeatureBadgeList badges={featureBadges} compact={compact} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0f1720',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    width: 292,
    elevation: 2,
  },
  cardCompact: {
    width: '100%',
  },
  coverWrap: {
    height: 152,
    position: 'relative',
  },
  coverImage: {
    height: '100%',
    width: '100%',
  },
  coverTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 12,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  statusBadge: {
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusOpen: {
    backgroundColor: '#e8f8ef',
  },
  statusClosed: {
    backgroundColor: '#f8e9eb',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextOpen: {
    color: '#17753d',
  },
  statusTextClosed: {
    color: '#a33544',
  },
  favoriteButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 999,
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: '#151c24',
  },
  favoriteText: {
    color: '#3a4652',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 17,
  },
  favoriteTextActive: {
    color: '#f8d34b',
  },
  content: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  logo: {
    alignItems: 'center',
    borderColor: '#e8edf3',
    borderRadius: 10,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  logoFallback: {
    backgroundColor: '#f3f7fb',
  },
  logoFallbackText: {
    color: '#415161',
    fontSize: 16,
    fontWeight: '700',
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    color: '#141b22',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  venueType: {
    color: '#9aa5b1',
    fontSize: 11,
    fontWeight: '400',
    marginTop: 3,
  },
  distance: {
    color: '#b6bfc9',
    fontSize: 11,
    fontWeight: '400',
  },
});
