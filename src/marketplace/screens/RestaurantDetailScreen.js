import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  formatDistanceLabel,
  getRestaurantFeatureBadges,
} from '../utils/restaurantPresentation';
import { FeatureBadgeList } from '../components/FeatureBadgeList';

function ActionButton({ disabled, label, onPress, primary }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButton,
        primary ? styles.actionPrimary : styles.actionSecondary,
        disabled ? styles.actionDisabled : null,
      ]}
    >
      <Text
        style={[
          styles.actionLabel,
          primary ? styles.actionLabelPrimary : styles.actionLabelSecondary,
          disabled ? styles.actionLabelDisabled : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function RestaurantDetailScreen({
  isFavorite,
  onBack,
  onOpenRestaurantFlow,
  onToggleFavorite,
  restaurant,
}) {
  if (!restaurant) {
    return null;
  }

  const distanceLabel = formatDistanceLabel(restaurant.distance_km);
  const badges = getRestaurantFeatureBadges(restaurant);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonLabel}>Back</Text>
        </Pressable>
        <Pressable
          onPress={() => onToggleFavorite?.(restaurant.slug)}
          style={[styles.saveButton, isFavorite ? styles.saveButtonActive : null]}
        >
          <Text style={[styles.saveButtonLabel, isFavorite ? styles.saveButtonLabelActive : null]}>
            {isFavorite ? 'Saved' : 'Save'}
          </Text>
        </Pressable>
      </View>

      <Image resizeMode="cover" source={{ uri: restaurant.cover_image }} style={styles.coverImage} />

      <View style={styles.nameRow}>
        <Image source={{ uri: restaurant.logo }} style={styles.logo} />
        <View style={styles.nameBlock}>
          <Text numberOfLines={1} style={styles.name}>
            {restaurant.name}
          </Text>
          <Text numberOfLines={1} style={styles.meta}>
            {restaurant.venue_type}
            {distanceLabel ? ` · ${distanceLabel}` : ''}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{restaurant.short_description}</Text>
      <FeatureBadgeList badges={badges} />

      <View style={styles.actionsRow}>
        <ActionButton
          disabled={restaurant.supports_qr_order === false}
          label="Order"
          onPress={() => onOpenRestaurantFlow?.({ action: 'order', slug: restaurant.slug })}
          primary
        />
        <ActionButton
          disabled={restaurant.supports_reservation === false}
          label="Reserve"
          onPress={() => onOpenRestaurantFlow?.({ action: 'reserve', slug: restaurant.slug })}
        />
        <ActionButton
          disabled={restaurant.supports_tickets === false}
          label="Buy Ticket"
          onPress={() => onOpenRestaurantFlow?.({ action: 'tickets', slug: restaurant.slug })}
        />
      </View>

      <View style={styles.phaseTwoNote}>
        <Text style={styles.phaseTwoText}>
          Phase 2 hook: add richer profile modules (events, personalized offers, smart recommendations).
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 8,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: '#f2f5f9',
    borderColor: '#e4e9ef',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonLabel: {
    color: '#283544',
    fontSize: 13,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#f2f5f9',
    borderColor: '#e4e9ef',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveButtonActive: {
    backgroundColor: '#151c24',
    borderColor: '#151c24',
  },
  saveButtonLabel: {
    color: '#283544',
    fontSize: 13,
    fontWeight: '700',
  },
  saveButtonLabelActive: {
    color: '#ffffff',
  },
  coverImage: {
    borderRadius: 14,
    height: 210,
    width: '100%',
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  logo: {
    borderColor: '#e4eaf1',
    borderRadius: 12,
    borderWidth: 1,
    height: 56,
    width: 56,
  },
  nameBlock: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: '#111921',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  meta: {
    color: '#5f6d7b',
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    color: '#364250',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  actionsRow: {
    gap: 10,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 12,
  },
  actionPrimary: {
    backgroundColor: '#151c24',
  },
  actionSecondary: {
    backgroundColor: '#f4f6f9',
    borderColor: '#e3e8ef',
    borderWidth: 1,
  },
  actionDisabled: {
    opacity: 0.45,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionLabelPrimary: {
    color: '#ffffff',
  },
  actionLabelSecondary: {
    color: '#1d2a38',
  },
  actionLabelDisabled: {
    color: '#687482',
  },
  phaseTwoNote: {
    backgroundColor: '#f7f9fc',
    borderColor: '#e5ebf2',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  phaseTwoText: {
    color: '#607080',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
});
