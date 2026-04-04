import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useMarketplaceData } from '../hooks/useMarketplaceData';
import { MarketplaceHomeScreen } from './MarketplaceHomeScreen';

export function MarketplaceNavigator({ onOpenRestaurantFlow }) {
  const marketplace = useMarketplaceData();

  const handleOpenRestaurant = (slug) => {
    onOpenRestaurantFlow?.({ action: 'order', slug });
  };

  return (
    <View style={styles.container}>
      <MarketplaceHomeScreen
        categories={marketplace.categories}
        favoriteRestaurants={marketplace.favoriteRestaurants}
        favoriteSlugs={marketplace.favoriteSlugs}
        featuredRestaurants={marketplace.featuredRestaurants}
        filteredRestaurants={marketplace.filteredRestaurants}
        loading={marketplace.loading}
        nearbyRestaurants={marketplace.nearbyRestaurants}
        onOpenRestaurant={handleOpenRestaurant}
        onSelectCategory={marketplace.setSelectedCategory}
        onSetSearchQuery={marketplace.setSearchQuery}
        onToggleFavorite={marketplace.toggleFavorite}
        recentRestaurants={marketplace.recentRestaurants}
        searchQuery={marketplace.searchQuery}
        selectedCategory={marketplace.selectedCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
});
