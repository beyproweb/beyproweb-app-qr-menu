import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORY_ITEMS = [
  {
    badge: '',
    id: 'food',
    label: 'Restaurants',
  },
  {
    badge: 'NEW',
    id: 'live_music',
    label: 'Events',
  },
  {
    badge: '',
    id: 'grocery',
    label: 'Grocery',
  },
  {
    badge: '',
    id: 'tickets',
    label: 'Tickets',
  },
  {
    badge: '',
    id: 'all',
    label: 'All',
  },
];

const EVENT_DATE_BADGES = ['Apr 25', 'Apr 26', 'Apr 27', 'May 2', 'May 4', 'May 9'];

const BEYALL_LOGO = require('../../../assets/Vibrant _beyall_ logo design.png');

function slugScore(slug) {
  const text = String(slug || '');
  let total = 0;
  for (let index = 0; index < text.length; index += 1) {
    total += text.charCodeAt(index) * (index + 1);
  }
  return total || 100;
}

function ratingLabel(slug) {
  const rating = 4.1 + (slugScore(slug) % 9) * 0.1;
  return rating.toFixed(1);
}

function reviewCountLabel(slug) {
  return String(60 + (slugScore(slug) % 640));
}

function attendeesLabel(slug) {
  return String(130 + (slugScore(slug) % 930));
}

function resolveCoverImage(restaurant) {
  return String(restaurant?.cover_image || restaurant?.logo || restaurant?.app_icon || '').trim();
}

function HeaderMenuButton({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.drawerTriggerButton, pressed ? styles.scalePressed : null]}
    >
      <View style={styles.menuGlyphWrap}>
        <View style={styles.menuGlyphLine} />
        <View style={[styles.menuGlyphLine, styles.menuGlyphLineMid]} />
        <View style={styles.menuGlyphLine} />
      </View>
    </Pressable>
  );
}

function CategoryPill({ isActive, item, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.categoryPillWrap, pressed ? styles.scalePressed : null]}
    >
      <LinearGradient
        colors={
          isActive
            ? ['#5B2EFF', '#7C3AED', '#F59E0B']
            : ['#f7f7fd', '#f2f4fb']
        }
        end={{ x: 1, y: 0.5 }}
        start={{ x: 0, y: 0.5 }}
        style={[styles.categoryPill, isActive ? styles.categoryPillActive : null]}
      >
        <Text style={[styles.categoryLabel, isActive ? styles.categoryLabelActive : null]}>
          {item.label}
        </Text>
        {item.badge ? (
          <View style={styles.categoryNewBadge}>
            <Text style={styles.categoryNewBadgeText}>{item.badge}</Text>
          </View>
        ) : null}
      </LinearGradient>
    </Pressable>
  );
}

function TopPickCard({ onOpenRestaurant, restaurant }) {
  if (!restaurant) {
    return null;
  }

  const imageUri = resolveCoverImage(restaurant);
  const distanceKm = Number(restaurant?.distance_km);
  const hasDistance = Number.isFinite(distanceKm) && distanceKm >= 0;
  const rating = ratingLabel(restaurant.slug);
  const reviewCount = reviewCountLabel(restaurant.slug);

  return (
    <Pressable
      onPress={() => onOpenRestaurant?.(restaurant.slug)}
      style={({ pressed }) => [styles.topPickCard, pressed ? styles.scalePressed : null]}
    >
      {imageUri ? (
        <Image resizeMode="cover" source={{ uri: imageUri }} style={styles.topPickImage} />
      ) : (
        <View style={[styles.topPickImage, styles.topPickImageFallback]}>
          <Text style={styles.topPickFallbackText}>
            {String(restaurant.name || '?').trim().charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
      )}
      <View style={styles.topPickContent}>
        <Text numberOfLines={1} style={styles.topPickName}>
          {restaurant.name}
        </Text>
        <Text style={styles.topPickMeta}>
          {hasDistance ? `${distanceKm.toFixed(1)} km away` : `${rating} rating (${reviewCount})`}
        </Text>
        <View style={styles.deliveryBadge}>
          <Text style={styles.deliveryBadgeText}>Free Delivery</Text>
        </View>
      </View>
    </Pressable>
  );
}

function NearbySkeletonRow() {
  return (
    <ScrollView
      contentContainerStyle={styles.horizontalCardsContent}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {[0, 1, 2].map((index) => (
        <View key={`nearby-skeleton-${index}`} style={styles.topPickCard}>
          <View style={[styles.topPickImage, styles.skeletonBlock]} />
          <View style={styles.topPickContent}>
            <View style={[styles.skeletonLine, styles.skeletonLinePrimary]} />
            <View style={[styles.skeletonLine, styles.skeletonLineSecondary]} />
            <View style={[styles.skeletonLine, styles.skeletonLineTertiary]} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function EventCard({ index, onOpenTickets, restaurant }) {
  if (!restaurant) {
    return null;
  }

  const imageUri = resolveCoverImage(restaurant);
  const dateText = EVENT_DATE_BADGES[index % EVENT_DATE_BADGES.length];
  const attendees = attendeesLabel(restaurant.slug);
  const rating = ratingLabel(restaurant.slug);

  return (
    <View style={styles.eventCard}>
      <Pressable
        onPress={() => onOpenTickets?.(restaurant.slug)}
        style={({ pressed }) => [styles.eventImageWrap, pressed ? styles.scalePressed : null]}
      >
        {imageUri ? (
          <Image resizeMode="cover" source={{ uri: imageUri }} style={styles.eventImage} />
        ) : (
          <View style={[styles.eventImage, styles.topPickImageFallback]}>
            <Text style={styles.topPickFallbackText}>
              {String(restaurant.name || '?').trim().charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <View style={styles.eventDateBadge}>
          <Text style={styles.eventDateText}>{dateText}</Text>
        </View>
      </Pressable>
      <View style={styles.eventContent}>
        <Text numberOfLines={1} style={styles.eventTitle}>
          {restaurant.name}
        </Text>
        <Text style={styles.eventMeta}>
          {rating} rating | {attendees} attending
        </Text>
        <Pressable
          onPress={() => onOpenTickets?.(restaurant.slug)}
          style={({ pressed }) => [styles.eventCtaWrap, pressed ? styles.scalePressed : null]}
        >
          <LinearGradient
            colors={['#5B2EFF', '#7C3AED']}
            end={{ x: 1, y: 0.5 }}
            start={{ x: 0, y: 0.5 }}
            style={styles.eventCtaButton}
          >
            <Text style={styles.eventCtaText}>Get Tickets</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

export function MarketplaceBrowseScreen({
  currentCustomer,
  filteredRestaurants,
  isAuthenticated,
  locationLabel,
  nearbyError,
  nearbyLoading,
  nearbyRestaurants,
  onLogout,
  onOpenAuth,
  onOpenRestaurant,
  onOpenTickets,
  onSelectCategory,
  onSetSearchQuery,
  searchQuery,
  selectedCategory,
}) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = React.useState('home');
  const [headerElevated, setHeaderElevated] = React.useState(false);
  const topPicks = React.useMemo(() => {
    const nearbyList = Array.isArray(nearbyRestaurants) ? nearbyRestaurants : [];
    return nearbyList.slice(0, 8);
  }, [nearbyRestaurants]);

  const nearbyEvents = React.useMemo(() => {
    const list = Array.isArray(filteredRestaurants) ? filteredRestaurants : [];
    const events = list.filter((restaurant) => {
      const venue = String(restaurant?.venue_type || '').toLowerCase();
      return (
        Boolean(restaurant?.supports_tickets) ||
        venue.includes('event') ||
        venue.includes('concert') ||
        venue.includes('music') ||
        venue.includes('festival')
      );
    });
    if (events.length) {
      return events.slice(0, 6);
    }
    return topPicks.slice(0, 6);
  }, [filteredRestaurants, topPicks]);

  const normalizedLocationLabel = React.useMemo(
    () => String(locationLabel || 'Locating...').trim().toUpperCase(),
    [locationLabel],
  );
  const customerDisplayName = React.useMemo(
    () => String(currentCustomer?.name || 'Customer').trim(),
    [currentCustomer?.name],
  );
  const nearbyStateError = String(nearbyError || '').trim();
  const drawerTabs = React.useMemo(
    () => [
      { id: 'home', label: 'Home' },
      { id: 'explore', label: 'Explore' },
      { id: 'orders', label: 'Orders' },
      { id: 'profile', label: 'Profile' },
    ],
    [],
  );

  const handleSelectDrawerTab = React.useCallback((tabId) => {
    setActiveDrawerTab(tabId);
    setIsDrawerOpen(false);
  }, []);

  const handleOpenAuthFromDrawer = React.useCallback((action) => {
    setIsDrawerOpen(false);
    onOpenAuth?.(action);
  }, [onOpenAuth]);

  const handleScroll = React.useCallback((event) => {
    const offsetY = Number(event?.nativeEvent?.contentOffset?.y || 0);
    const shouldElevate = offsetY > 8;
    setHeaderElevated((previous) => (previous === shouldElevate ? previous : shouldElevate));
  }, []);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['rgba(91,46,255,0.12)', 'rgba(124,58,237,0)']}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={[styles.edgeGlow, styles.edgeGlowLeft]}
      />
      <LinearGradient
        colors={['rgba(34,197,94,0)', 'rgba(245,158,11,0.1)', 'rgba(124,58,237,0.12)']}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={[styles.edgeGlow, styles.edgeGlowRight]}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={[styles.stickyHeaderWrap, headerElevated ? styles.stickyHeaderElevated : null]}>
          <View style={styles.topHeader}>
            <HeaderMenuButton onPress={() => setIsDrawerOpen(true)} />
            <View style={styles.headerSearchSlot}>
              <View style={[styles.searchContainer, styles.searchContainerInHeader]}>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  onChangeText={onSetSearchQuery}
                  placeholder="Search restaurants, events..."
                  placeholderTextColor="#8b95a1"
                  returnKeyType="search"
                  style={[styles.searchInput, styles.searchInputInHeader]}
                  value={searchQuery}
                />
              </View>
            </View>
            <View style={styles.headerRightControls}>
              <Pressable style={({ pressed }) => [styles.locationButton, pressed ? styles.scalePressed : null]}>
                <View style={styles.locationIconWrap}>
                  <View style={styles.locationGlyph} />
                  <View style={styles.locationGlyphStem} />
                </View>
                <Text numberOfLines={1} style={styles.locationButtonText}>
                  {normalizedLocationLabel}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.heroWrap}>
          <LinearGradient
            colors={['#f5f1ff', '#efe8ff', '#fef3df']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.heroCard}
          >
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTitle}>Discover Popular Deals!</Text>
              <Text style={styles.heroSubtitle}>Exclusive offers you don't want to miss</Text>
              <Pressable style={({ pressed }) => [styles.heroButtonWrap, pressed ? styles.scalePressed : null]}>
                <LinearGradient
                  colors={['#5B2EFF', '#7C3AED']}
                  end={{ x: 1, y: 0.5 }}
                  start={{ x: 0, y: 0.5 }}
                  style={styles.heroButton}
                >
                  <Text style={styles.heroButtonText}>Get Deals</Text>
                </LinearGradient>
              </Pressable>
            </View>
            <View style={styles.heroVisual}>
              <View style={styles.heroChip}>
                <Text style={styles.heroChipText}>MARKET</Text>
              </View>
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>% OFF</Text>
              </View>
            </View>
          </LinearGradient>
          <View style={styles.heroDots}>
            <View style={[styles.heroDot, styles.heroDotActive]} />
            <View style={styles.heroDot} />
            <View style={styles.heroDot} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.categoriesRow}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {CATEGORY_ITEMS.map((item) => (
            <CategoryPill
              isActive={item.id === selectedCategory}
              item={item}
              key={item.id}
              onPress={() => onSelectCategory?.(item.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Restaurants</Text>
        </View>
        {nearbyLoading ? (
          <NearbySkeletonRow />
        ) : nearbyStateError ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Unable to detect nearby restaurants.</Text>
            <Text style={styles.loadingSubText}>{nearbyStateError}</Text>
          </View>
        ) : topPicks.length === 0 ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>No restaurants near you</Text>
            <Text style={styles.loadingSubText}>Try changing category or search radius.</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.horizontalCardsContent}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {topPicks.map((restaurant) => (
              <TopPickCard
                key={restaurant.id}
                onOpenRestaurant={onOpenRestaurant}
                restaurant={restaurant}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Events</Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.horizontalCardsContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {nearbyEvents.map((restaurant, index) => (
            <EventCard
              index={index}
              key={`${restaurant.id}-event`}
              onOpenTickets={onOpenTickets || onOpenRestaurant}
              restaurant={restaurant}
            />
          ))}
        </ScrollView>

        <View style={styles.bottomLogoWrap}>
          <Image resizeMode="contain" source={BEYALL_LOGO} style={styles.bottomPageLogo} />
        </View>
      </ScrollView>

      <View pointerEvents={isDrawerOpen ? 'auto' : 'none'} style={styles.drawerRoot}>
        <Pressable
          onPress={() => setIsDrawerOpen(false)}
          style={[styles.drawerBackdrop, !isDrawerOpen ? styles.drawerBackdropHidden : null]}
        />
        <View style={[styles.drawerPanel, !isDrawerOpen ? styles.drawerPanelClosed : null]}>
          <View style={styles.drawerLocationBadge}>
            <Text numberOfLines={1} style={styles.drawerLocationText}>
              {normalizedLocationLabel}
            </Text>
          </View>
          <View style={styles.drawerTabList}>
            {drawerTabs.map((tab) => {
              const isActive = activeDrawerTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => handleSelectDrawerTab(tab.id)}
                  style={({ pressed }) => [
                    styles.drawerTabButton,
                    isActive ? styles.drawerTabButtonActive : null,
                    pressed ? styles.scalePressed : null,
                  ]}
                >
                  <View style={[styles.drawerTabDot, isActive ? styles.drawerTabDotActive : null]} />
                  <Text style={[styles.drawerTabLabel, isActive ? styles.drawerTabLabelActive : null]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.drawerAuthActions}>
            {isAuthenticated ? (
              <>
                <View style={styles.drawerProfileBadge}>
                  <Text numberOfLines={1} style={styles.drawerProfileText}>
                    {customerDisplayName}
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    setIsDrawerOpen(false);
                    onLogout?.();
                  }}
                  style={({ pressed }) => [
                    styles.drawerAuthButton,
                    styles.drawerAuthButtonGhost,
                    pressed ? styles.scalePressed : null,
                  ]}
                >
                  <Text style={styles.drawerAuthButtonGhostText}>Log out</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  onPress={() => handleOpenAuthFromDrawer('login')}
                  style={({ pressed }) => [
                    styles.drawerAuthButton,
                    styles.drawerAuthButtonGhost,
                    pressed ? styles.scalePressed : null,
                  ]}
                >
                  <Text style={styles.drawerAuthButtonGhostText}>Log in</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleOpenAuthFromDrawer('register')}
                  style={({ pressed }) => [
                    styles.drawerAuthButton,
                    styles.drawerAuthButtonPrimary,
                    pressed ? styles.scalePressed : null,
                  ]}
                >
                  <Text style={styles.drawerAuthButtonPrimaryText}>Sign up</Text>
                </Pressable>
              </>
            )}
          </View>
          <View style={styles.drawerFooterLogoWrap}>
            <Image resizeMode="contain" source={BEYALL_LOGO} style={styles.drawerFooterLogo} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  edgeGlow: {
    borderRadius: 190,
    height: 340,
    position: 'absolute',
    width: 190,
  },
  edgeGlowLeft: {
    left: -110,
    top: 120,
  },
  edgeGlowRight: {
    bottom: 180,
    right: -115,
  },
  content: {
    gap: 18,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 0,
  },
  stickyHeaderWrap: {
    backgroundColor: 'rgba(255,255,255,0)',
    borderBottomColor: 'transparent',
    borderBottomWidth: 1,
    marginHorizontal: -16,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 4,
  },
  stickyHeaderElevated: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderBottomColor: '#ebeff7',
  },
  topHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 36,
    position: 'relative',
  },
  headerSearchSlot: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
    maxWidth: 170,
  },
  headerRightControls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  locationButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    height: 32,
    justifyContent: 'center',
    maxHeight: 32,
    maxWidth: 82,
    minWidth: 72,
    paddingHorizontal: 2,
  },
  locationIconWrap: {
    alignItems: 'center',
    height: 11,
    justifyContent: 'flex-start',
    width: 8,
  },
  locationGlyph: {
    borderColor: '#334155',
    borderRadius: 999,
    borderWidth: 1.6,
    height: 8,
    width: 8,
  },
  locationGlyphStem: {
    backgroundColor: '#334155',
    borderRadius: 999,
    height: 3,
    marginTop: 1,
    width: 1.8,
  },
  locationButtonText: {
    color: '#283241',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  drawerTriggerButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 18,
  },
  menuGlyphWrap: {
    gap: 3,
    width: 14,
  },
  menuGlyphLine: {
    backgroundColor: '#334155',
    borderRadius: 999,
    height: 1.8,
    width: '100%',
  },
  menuGlyphLineMid: {
    width: '72%',
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e8ebf4',
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 14,
    shadowColor: '#13192e',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.045,
    shadowRadius: 12,
    elevation: 1,
  },
  searchContainerInHeader: {
    borderColor: '#e6ebf5',
    borderRadius: 11,
    minHeight: 32,
    paddingHorizontal: 9,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  searchInput: {
    color: '#111827',
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    minHeight: 48,
  },
  searchInputInHeader: {
    fontSize: 12,
    minHeight: 30,
  },
  bottomLogoWrap: {
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: 8,
  },
  bottomPageLogo: {
    height: 26,
    width: 128,
  },
  heroWrap: {
    gap: 11,
  },
  heroCard: {
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  heroTextBlock: {
    flex: 1,
    paddingRight: 8,
  },
  heroTitle: {
    color: '#1a1a1a',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    color: '#4c5564',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginTop: 6,
  },
  heroButtonWrap: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  heroButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  heroButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  heroVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 78,
  },
  heroChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(17,24,39,0.08)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroChipText: {
    color: '#1f2937',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  discountBadge: {
    alignItems: 'center',
    backgroundColor: '#22C55E',
    borderRadius: 999,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  discountBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  heroDots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  heroDot: {
    backgroundColor: '#d2d8e5',
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  heroDotActive: {
    backgroundColor: '#5B2EFF',
    width: 17,
  },
  categoriesRow: {
    gap: 10,
    paddingRight: 10,
  },
  categoryPillWrap: {
    borderRadius: 999,
  },
  categoryPill: {
    alignItems: 'center',
    borderColor: '#e9ecf5',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  categoryPillActive: {
    borderWidth: 0,
  },
  categoryLabel: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  categoryLabelActive: {
    color: '#ffffff',
  },
  categoryNewBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    marginLeft: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryNewBadgeText: {
    color: '#5B2EFF',
    fontSize: 9,
    fontWeight: '800',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#131a24',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  horizontalCardsContent: {
    gap: 13,
    paddingRight: 10,
  },
  topPickCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#13192e',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    width: 216,
    elevation: 2,
  },
  skeletonBlock: {
    backgroundColor: '#edf1f8',
  },
  skeletonLine: {
    backgroundColor: '#edf1f8',
    borderRadius: 999,
    height: 10,
  },
  skeletonLinePrimary: {
    width: '74%',
  },
  skeletonLineSecondary: {
    width: '48%',
  },
  skeletonLineTertiary: {
    width: '35%',
  },
  topPickImage: {
    height: 132,
    width: '100%',
  },
  topPickImageFallback: {
    alignItems: 'center',
    backgroundColor: '#ebeff9',
    justifyContent: 'center',
  },
  topPickFallbackText: {
    color: '#445165',
    fontSize: 34,
    fontWeight: '700',
  },
  topPickContent: {
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  topPickName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  topPickMeta: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '600',
  },
  deliveryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ecfdf3',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deliveryBadgeText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '700',
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#13192e',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.055,
    shadowRadius: 11,
    width: 252,
    elevation: 2,
  },
  eventImageWrap: {
    position: 'relative',
  },
  eventImage: {
    height: 146,
    width: '100%',
  },
  eventDateBadge: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    position: 'absolute',
    top: 10,
  },
  eventDateText: {
    color: '#1f2937',
    fontSize: 11,
    fontWeight: '800',
  },
  eventContent: {
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  eventTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  eventMeta: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
  },
  eventCtaWrap: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  eventCtaButton: {
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  eventCtaText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  drawerRoot: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  drawerBackdrop: {
    backgroundColor: 'rgba(2, 8, 23, 0.26)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  drawerBackdropHidden: {
    opacity: 0,
  },
  drawerPanel: {
    backgroundColor: '#ffffff',
    borderBottomRightRadius: 24,
    borderTopRightRadius: 24,
    bottom: 8,
    flexDirection: 'column',
    left: 0,
    paddingHorizontal: 18,
    paddingBottom: 14,
    paddingTop: 24,
    position: 'absolute',
    shadowColor: '#0f172a',
    shadowOffset: {
      width: 6,
      height: 0,
    },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    top: 8,
    width: 268,
    elevation: 16,
  },
  drawerPanelClosed: {
    transform: [{ translateX: -288 }],
  },
  drawerLocationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5fb',
    borderRadius: 999,
    marginTop: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  drawerLocationText: {
    color: '#334155',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  drawerTabList: {
    gap: 10,
    marginTop: 16,
  },
  drawerAuthActions: {
    gap: 10,
    marginTop: 18,
  },
  drawerFooterLogoWrap: {
    alignItems: 'center',
    marginTop: 14,
  },
  drawerFooterLogo: {
    height: 54,
    width: 210,
  },
  drawerProfileBadge: {
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  drawerProfileText: {
    color: '#4338ca',
    fontSize: 13,
    fontWeight: '700',
  },
  drawerAuthButton: {
    alignItems: 'center',
    borderRadius: 12,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  drawerAuthButtonGhost: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  drawerAuthButtonPrimary: {
    backgroundColor: '#5B2EFF',
  },
  drawerAuthButtonGhostText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '700',
  },
  drawerAuthButtonPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  drawerTabButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  drawerTabButtonActive: {
    backgroundColor: '#eef2ff',
  },
  drawerTabDot: {
    backgroundColor: '#c9d2e3',
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  drawerTabDotActive: {
    backgroundColor: '#5B2EFF',
  },
  drawerTabLabel: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  drawerTabLabelActive: {
    color: '#4c1d95',
  },
  scalePressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  loadingState: {
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    borderRadius: 14,
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 26,
  },
  loadingText: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingSubText: {
    color: '#8a93a1',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
