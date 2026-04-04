import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CategoryChips } from '../components/CategoryChips';
import { MarketplaceSearchBar } from '../components/MarketplaceSearchBar';
import { RestaurantCard } from '../components/RestaurantCard';
import { SectionBlock, SectionEmptyState } from '../components/SectionBlock';

function HorizontalRestaurantRail({ favoriteSlugs, onOpenRestaurant, onToggleFavorite, restaurants }) {
  const list = Array.isArray(restaurants) ? restaurants : [];
  if (!list.length) {
    return <SectionEmptyState message="No matching restaurants right now." />;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.horizontalRailContent}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {list.map((restaurant) => (
        <RestaurantCard
          isFavorite={favoriteSlugs.includes(restaurant.slug)}
          key={restaurant.id}
          onPress={() => onOpenRestaurant?.(restaurant.slug)}
          onToggleFavorite={onToggleFavorite}
          restaurant={restaurant}
        />
      ))}
    </ScrollView>
  );
}

function VerticalRestaurantList({ favoriteSlugs, onOpenRestaurant, onToggleFavorite, restaurants }) {
  const list = Array.isArray(restaurants) ? restaurants : [];
  if (!list.length) {
    return <SectionEmptyState message="Nearby discovery will improve as more venues are synced." />;
  }

  return (
    <View style={styles.verticalList}>
      {list.map((restaurant) => (
        <RestaurantCard
          compact
          isFavorite={favoriteSlugs.includes(restaurant.slug)}
          key={restaurant.id}
          onPress={() => onOpenRestaurant?.(restaurant.slug)}
          onToggleFavorite={onToggleFavorite}
          restaurant={restaurant}
        />
      ))}
    </View>
  );
}

export function MarketplaceHomeScreen({
  categories,
  favoriteRestaurants,
  favoriteSlugs,
  featuredRestaurants,
  loading,
  nearbyRestaurants,
  onOpenRestaurant,
  onSelectCategory,
  onSetSearchQuery,
  onToggleFavorite,
  recentRestaurants,
  searchQuery,
  selectedCategory,
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Beypro Marketplace</Text>
        <Text style={styles.subtitle}>Discover restaurants powered by Beypro</Text>
      </View>

      <MarketplaceSearchBar onChangeText={onSetSearchQuery} value={searchQuery} />
      <CategoryChips
        categories={categories}
        onSelectCategory={onSelectCategory}
        selectedCategory={selectedCategory}
      />

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color="#253140" />
          <Text style={styles.loadingText}>Loading marketplace...</Text>
        </View>
      ) : (
        <View style={styles.sectionsWrap}>
          <SectionBlock subtitle="Based on your latest visits" title="Recent Restaurants">
            <HorizontalRestaurantRail
              favoriteSlugs={favoriteSlugs}
              onOpenRestaurant={onOpenRestaurant}
              onToggleFavorite={onToggleFavorite}
              restaurants={recentRestaurants}
            />
          </SectionBlock>

          <SectionBlock subtitle="Saved locally on this device" title="Favorite Restaurants">
            <HorizontalRestaurantRail
              favoriteSlugs={favoriteSlugs}
              onOpenRestaurant={onOpenRestaurant}
              onToggleFavorite={onToggleFavorite}
              restaurants={favoriteRestaurants}
            />
          </SectionBlock>

          <SectionBlock subtitle="Curated by Beypro" title="Featured Restaurants">
            <HorizontalRestaurantRail
              favoriteSlugs={favoriteSlugs}
              onOpenRestaurant={onOpenRestaurant}
              onToggleFavorite={onToggleFavorite}
              restaurants={featuredRestaurants}
            />
          </SectionBlock>

          <SectionBlock subtitle="Closest venues right now" title="Nearby Restaurants">
            <VerticalRestaurantList
              favoriteSlugs={favoriteSlugs}
              onOpenRestaurant={onOpenRestaurant}
              onToggleFavorite={onToggleFavorite}
              restaurants={nearbyRestaurants}
            />
          </SectionBlock>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 8,
  },
  header: {
    gap: 4,
    marginBottom: 2,
  },
  title: {
    color: '#0f1720',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: '#63707d',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingState: {
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
    borderColor: '#e6ebf1',
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 24,
  },
  loadingText: {
    color: '#667281',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionsWrap: {
    gap: 24,
  },
  horizontalRailContent: {
    gap: 12,
    paddingRight: 6,
  },
  verticalList: {
    gap: 12,
  },
});
