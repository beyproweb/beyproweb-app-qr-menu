import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useMarketplaceData } from '../hooks/useMarketplaceData';
import { MarketplaceBrowseScreen } from './MarketplaceBrowseScreen';
import { MarketplaceHomeScreen } from './MarketplaceHomeScreen';

export function MarketplaceNavigator({ onOpenAuthFlow, onOpenRestaurantFlow }) {
  const marketplace = useMarketplaceData();
  const [phoneInput, setPhoneInput] = React.useState('');
  const [showMarketplaceBrowse, setShowMarketplaceBrowse] = React.useState(false);

  const handleOpenRestaurant = (slug) => {
    onOpenRestaurantFlow?.({ action: 'order', slug });
  };

  const handleOpenTickets = (slug) => {
    onOpenRestaurantFlow?.({ action: 'tickets', slug });
  };

  const handleOpenAuth = (action) => {
    onOpenAuthFlow?.(action);
  };

  const handleContinueWithPhone = () => {
    setShowMarketplaceBrowse(true);
  };

  return (
    <View style={styles.container}>
      {!showMarketplaceBrowse ? (
        <MarketplaceHomeScreen
          onChangePhoneInput={setPhoneInput}
          onContinueWithApple={() => handleOpenAuth('login')}
          onContinueWithGoogle={() => handleOpenAuth('login')}
          onContinueWithPhone={handleContinueWithPhone}
          phoneInput={phoneInput}
        />
      ) : (
        <MarketplaceBrowseScreen
          categories={marketplace.categories}
          favoriteRestaurants={marketplace.favoriteRestaurants}
          favoriteSlugs={marketplace.favoriteSlugs}
          filteredRestaurants={marketplace.filteredRestaurants}
          locationLabel={marketplace.locationLabel}
          nearbyError={marketplace.nearbyError}
          nearbyLoading={marketplace.nearbyLoading}
          nearbyRestaurants={marketplace.nearbyRestaurants}
          onOpenRestaurant={handleOpenRestaurant}
          onOpenAuth={handleOpenAuth}
          onOpenTickets={handleOpenTickets}
          onSelectCategory={marketplace.setSelectedCategory}
          onSetSearchQuery={marketplace.setSearchQuery}
          onToggleFavorite={marketplace.toggleFavorite}
          recentRestaurants={marketplace.recentRestaurants}
          searchQuery={marketplace.searchQuery}
          selectedCategory={marketplace.selectedCategory}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
});
