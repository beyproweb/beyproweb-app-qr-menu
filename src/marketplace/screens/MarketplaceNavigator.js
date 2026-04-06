import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useMarketplaceData } from '../hooks/useMarketplaceData';
import { MarketplaceBrowseScreen } from './MarketplaceBrowseScreen';
import { MarketplaceHomeScreen } from './MarketplaceHomeScreen';

function sanitizeFieldValue(value) {
  return String(value || '');
}

export function MarketplaceNavigator({ authState, onOpenAuthFlow, onOpenRestaurantFlow }) {
  const marketplace = useMarketplaceData();
  const [isAuthScreenVisible, setIsAuthScreenVisible] = React.useState(false);
  const [authMode, setAuthMode] = React.useState('login');
  const [pendingRestaurantFlow, setPendingRestaurantFlow] = React.useState(null);
  const [formValues, setFormValues] = React.useState({
    address: '',
    email: '',
    login: '',
    name: '',
    password: '',
    phone: '',
  });

  const handleOpenRestaurant = React.useCallback((slug) => {
    if (!slug) {
      return;
    }

    if (!authState?.isAuthenticated) {
      setAuthMode('login');
      setPendingRestaurantFlow({ action: 'order', slug });
      setIsAuthScreenVisible(true);
      return;
    }
    onOpenRestaurantFlow?.({ action: 'order', slug });
  }, [authState?.isAuthenticated, onOpenRestaurantFlow]);

  const handleOpenTickets = React.useCallback((slug) => {
    if (!slug) {
      return;
    }

    if (!authState?.isAuthenticated) {
      setAuthMode('login');
      setPendingRestaurantFlow({ action: 'tickets', slug });
      setIsAuthScreenVisible(true);
      return;
    }
    onOpenRestaurantFlow?.({ action: 'tickets', slug });
  }, [authState?.isAuthenticated, onOpenRestaurantFlow]);

  const handleOpenAuth = React.useCallback((action) => {
    setAuthMode(action === 'register' ? 'register' : 'login');
    setIsAuthScreenVisible(true);
  }, []);

  const handleChangeField = React.useCallback((field, value) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: sanitizeFieldValue(value),
    }));
  }, []);

  const handleSwitchAuthMode = React.useCallback((mode) => {
    setAuthMode(mode === 'register' ? 'register' : 'login');
  }, []);

  const handleCloseAuthScreen = React.useCallback(() => {
    setIsAuthScreenVisible(false);
    setPendingRestaurantFlow(null);
  }, []);

  React.useEffect(() => {
    if (!authState?.isAuthenticated || !pendingRestaurantFlow) {
      return;
    }

    onOpenRestaurantFlow?.(pendingRestaurantFlow);
    setPendingRestaurantFlow(null);
    setIsAuthScreenVisible(false);
  }, [authState?.isAuthenticated, onOpenRestaurantFlow, pendingRestaurantFlow]);

  const handleSubmitAuth = React.useCallback(async () => {
    if (!authState) {
      return;
    }

    if (authMode === 'register') {
      await authState.register?.({
        address: formValues.address,
        email: formValues.email,
        name: formValues.name,
        password: formValues.password,
        phone: formValues.phone,
      });
      return;
    }

    await authState.login?.({
      login: formValues.login,
      password: formValues.password,
    });
  }, [authMode, authState, formValues]);

  const handleContinueWithApple = React.useCallback(() => {
    onOpenAuthFlow?.('login');
  }, [onOpenAuthFlow]);

  const handleContinueWithGoogle = React.useCallback(() => {
    onOpenAuthFlow?.('login');
  }, [onOpenAuthFlow]);

  return (
    <View style={styles.container}>
      {isAuthScreenVisible ? (
        <MarketplaceHomeScreen
          authError={authState?.error}
          authLoading={Boolean(authState?.loading)}
          authMode={authMode}
          formValues={formValues}
          onCancelAuth={handleCloseAuthScreen}
          onChangeField={handleChangeField}
          onContinueWithApple={handleContinueWithApple}
          onContinueWithGoogle={handleContinueWithGoogle}
          onSubmitAuth={handleSubmitAuth}
          onSwitchAuthMode={handleSwitchAuthMode}
        />
      ) : (
        <MarketplaceBrowseScreen
          categories={marketplace.categories}
          currentCustomer={authState.customer}
          favoriteRestaurants={marketplace.favoriteRestaurants}
          favoriteSlugs={marketplace.favoriteSlugs}
          filteredRestaurants={marketplace.filteredRestaurants}
          isAuthenticated={authState.isAuthenticated}
          locationAddress={marketplace.locationAddress}
          locationLatitude={marketplace.locationLatitude}
          locationLabel={marketplace.locationLabel}
          locationLongitude={marketplace.locationLongitude}
          nearbyRestaurantKeys={marketplace.nearbyRestaurantKeys}
          nearbyError={marketplace.nearbyError}
          nearbyLoading={marketplace.nearbyLoading}
          nearbyRestaurants={marketplace.nearbyRestaurants}
          onLogout={authState.logout}
          onOpenRestaurant={handleOpenRestaurant}
          onOpenAuth={handleOpenAuth}
          onOpenTickets={handleOpenTickets}
          onSelectCategory={marketplace.setSelectedCategory}
          onSetSearchQuery={marketplace.setSearchQuery}
          onToggleFavorite={marketplace.toggleFavorite}
          recentRestaurants={marketplace.recentRestaurants}
          searchRestaurants={marketplace.searchRestaurants}
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
