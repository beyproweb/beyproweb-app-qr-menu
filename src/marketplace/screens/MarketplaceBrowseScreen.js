import React from 'react';
import {
  ActivityIndicator,
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
    icon: '🍔',
    id: 'food',
    label: 'Restaurants',
  },
  {
    badge: 'NEW',
    icon: '🎉',
    id: 'live_music',
    label: 'Events',
  },
  {
    badge: '',
    icon: '🛒',
    id: 'grocery',
    label: 'Grocery',
  },
  {
    badge: '',
    icon: '🎟',
    id: 'tickets',
    label: 'Tickets',
  },
  {
    badge: '',
    icon: '🔍',
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

function HeaderIconButton({ badgeCount, icon }) {
  return (
    <Pressable style={({ pressed }) => [styles.headerIconButton, pressed ? styles.scalePressed : null]}>
      <Text style={styles.headerIconText}>{icon}</Text>
      {badgeCount ? (
        <View style={styles.iconBadge}>
          <Text style={styles.iconBadgeText}>{badgeCount}</Text>
        </View>
      ) : null}
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
        <Text style={styles.categoryIcon}>{item.icon}</Text>
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
          ⭐ {rating} ({reviewCount})
        </Text>
        <View style={styles.deliveryBadge}>
          <Text style={styles.deliveryBadgeText}>Free Delivery</Text>
        </View>
      </View>
    </Pressable>
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
          ⭐ {rating} • {attendees} attending
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

function BottomNavigation() {
  const [activeTab, setActiveTab] = React.useState('home');
  const tabs = [
    { icon: '🏠', id: 'home', label: 'Home' },
    { icon: '🔍', id: 'explore', label: 'Explore' },
    { icon: '🧾', id: 'orders', label: 'Orders' },
    { icon: '👤', id: 'profile', label: 'Profile' },
  ];

  return (
    <View style={styles.bottomNavWrap}>
      <View style={styles.bottomNav}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={({ pressed }) => [
                styles.bottomNavItem,
                isActive ? styles.bottomNavItemActive : null,
                pressed ? styles.scalePressed : null,
              ]}
            >
              <Text style={styles.bottomNavIcon}>{tab.icon}</Text>
              <Text style={[styles.bottomNavLabel, isActive ? styles.bottomNavLabelActive : null]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function MarketplaceBrowseScreen({
  featuredRestaurants,
  filteredRestaurants,
  loading,
  onOpenRestaurant,
  onOpenTickets,
  onSelectCategory,
  onSetSearchQuery,
  searchQuery,
  selectedCategory,
}) {
  const topPicks = React.useMemo(() => {
    const featured = Array.isArray(featuredRestaurants) ? featuredRestaurants : [];
    if (featured.length) {
      return featured.slice(0, 8);
    }
    const fallback = Array.isArray(filteredRestaurants) ? filteredRestaurants : [];
    return fallback.slice(0, 8);
  }, [featuredRestaurants, filteredRestaurants]);

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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topHeader}>
          <Pressable style={({ pressed }) => [styles.locationButton, pressed ? styles.scalePressed : null]}>
            <Text style={styles.locationButtonText}>📍 Izmir</Text>
          </Pressable>
          <Image resizeMode="contain" source={BEYALL_LOGO} style={styles.logo} />
          <View style={styles.headerIconsWrap}>
            <HeaderIconButton icon="🔔" />
            <HeaderIconButton badgeCount={2} icon="🛒" />
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            onChangeText={onSetSearchQuery}
            placeholder="Search for restaurants, events..."
            placeholderTextColor="#8b95a1"
            returnKeyType="search"
            style={styles.searchInput}
            value={searchQuery}
          />
          <Text style={styles.searchSparkle}>✨</Text>
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
              <Text style={styles.heroEmojiLarge}>🍔</Text>
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
          <Text style={styles.sectionTitle}>Top Picks</Text>
        </View>
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color="#5B2EFF" />
            <Text style={styles.loadingText}>Loading popular places...</Text>
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
      </ScrollView>
      <BottomNavigation />
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
    paddingBottom: 116,
    paddingTop: 12,
  },
  topHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 42,
  },
  locationButton: {
    backgroundColor: '#f4f6fb',
    borderRadius: 999,
    minWidth: 88,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  locationButtonText: {
    color: '#283241',
    fontSize: 13,
    fontWeight: '700',
  },
  logo: {
    height: 38,
    width: 102,
  },
  headerIconsWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    alignItems: 'center',
    backgroundColor: '#f4f6fb',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    position: 'relative',
    width: 34,
  },
  headerIconText: {
    fontSize: 16,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: '#f43f5e',
    borderRadius: 999,
    height: 16,
    justifyContent: 'center',
    minWidth: 16,
    position: 'absolute',
    right: -3,
    top: -3,
  },
  iconBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
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
  searchInput: {
    color: '#111827',
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    minHeight: 48,
  },
  searchSparkle: {
    fontSize: 18,
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
  heroEmojiLarge: {
    fontSize: 44,
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
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  categoryPillActive: {
    borderWidth: 0,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
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
  bottomNavWrap: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopColor: '#ebeff7',
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 12,
  },
  bottomNavItem: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    gap: 3,
    minHeight: 50,
    justifyContent: 'center',
  },
  bottomNavItemActive: {
    backgroundColor: '#f1ecff',
  },
  bottomNavIcon: {
    fontSize: 18,
  },
  bottomNavLabel: {
    color: '#667085',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomNavLabelActive: {
    color: '#5B2EFF',
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
  },
});
