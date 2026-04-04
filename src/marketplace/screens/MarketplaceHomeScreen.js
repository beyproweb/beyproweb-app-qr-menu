import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CategoryChips } from '../components/CategoryChips';
import { MarketplaceSearchBar } from '../components/MarketplaceSearchBar';
import { RestaurantCard } from '../components/RestaurantCard';
import { SectionBlock, SectionEmptyState } from '../components/SectionBlock';

function HorizontalRestaurantRail({ favoriteSlugs, onOpenRestaurant, onToggleFavorite, restaurants }) {
  const list = Array.isArray(restaurants) ? restaurants : [];
  if (!list.length) {
    return <SectionEmptyState message="No places found nearby. Try another area or search." />;
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
    return <SectionEmptyState message="No places found nearby. Try another area or search." />;
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
  filteredRestaurants,
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
      <MarketplaceSearchBar onChangeText={onSetSearchQuery} value={searchQuery} />
      <CategoryChips
        categories={categories}
        onSelectCategory={onSelectCategory}
        selectedCategory={selectedCategory}
      />

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color="#253140" />
          <Text style={styles.loadingText}>Loading places...</Text>
        </View>
      ) : (
        <View style={styles.sectionsWrap}>
          <SectionBlock title="Recently visited">
            <HorizontalRestaurantRail
              favoriteSlugs={favoriteSlugs}
              onOpenRestaurant={onOpenRestaurant}
              onToggleFavorite={onToggleFavorite}
              restaurants={recentRestaurants}
            />
          </SectionBlock>

          <SectionBlock title="Favorites">
            <HorizontalRestaurantRail
              favoriteSlugs={favoriteSlugs}
              onOpenRestaurant={onOpenRestaurant}
              onToggleFavorite={onToggleFavorite}
              restaurants={favoriteRestaurants}
            />
          </SectionBlock>

          <SectionBlock title="Popular places">
            <HorizontalRestaurantRail
              favoriteSlugs={favoriteSlugs}
              onOpenRestaurant={onOpenRestaurant}
              onToggleFavorite={onToggleFavorite}
              restaurants={featuredRestaurants}
            />
          </SectionBlock>

          <SectionBlock title="Nearby">
            <VerticalRestaurantList
              favoriteSlugs={favoriteSlugs}
              onOpenRestaurant={onOpenRestaurant}
              onToggleFavorite={onToggleFavorite}
              restaurants={nearbyRestaurants}
            />
          </SectionBlock>

          <SectionBlock title="All places">
            <VerticalRestaurantList
              favoriteSlugs={favoriteSlugs}
              onOpenRestaurant={onOpenRestaurant}
              onToggleFavorite={onToggleFavorite}
              restaurants={filteredRestaurants}
            />
          </SectionBlock>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
  },
  loadingState: {
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
    borderRadius: 14,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 26,
  },
  loadingText: {
    color: '#667281',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionsWrap: {
    gap: 36,
  },
  horizontalRailContent: {
    gap: 14,
    paddingRight: 10,
  },
  verticalList: {
    gap: 14,
  },
});
