import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  formatDistanceLabel,
  formatRestaurantSubtitle,
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
  const subtitle = formatRestaurantSubtitle(restaurant);
  const distanceLabel = formatDistanceLabel(restaurant.distance_km);

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
              {isFavorite ? 'Saved' : 'Save'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Image source={{ uri: restaurant.logo }} style={styles.logo} />
          <View style={styles.titleBlock}>
            <Text numberOfLines={1} style={styles.name}>
              {restaurant.name}
            </Text>
            <Text numberOfLines={1} style={styles.venueType}>
              {restaurant.venue_type}
            </Text>
          </View>
        </View>

        <Text numberOfLines={2} style={styles.subtitle}>
          {subtitle}
        </Text>
        {distanceLabel ? <Text style={styles.distance}>{distanceLabel}</Text> : null}

        <FeatureBadgeList badges={featureBadges} compact={compact} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e5eaf1',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#0f1720',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    width: 272,
    elevation: 3,
  },
  cardCompact: {
    width: '100%',
  },
  coverWrap: {
    height: 128,
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
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  favoriteButtonActive: {
    backgroundColor: '#151c24',
  },
  favoriteText: {
    color: '#22303e',
    fontSize: 11,
    fontWeight: '700',
  },
  favoriteTextActive: {
    color: '#ffffff',
  },
  content: {
    gap: 9,
    paddingHorizontal: 13,
    paddingTop: 12,
    paddingBottom: 13,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  logo: {
    borderColor: '#e6ecf3',
    borderRadius: 10,
    borderWidth: 1,
    height: 42,
    width: 42,
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    color: '#141b22',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.15,
  },
  venueType: {
    color: '#64707d',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  subtitle: {
    color: '#4f5b67',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  distance: {
    color: '#6e7a87',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
