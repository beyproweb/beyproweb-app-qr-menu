import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const COLORS = {
  accentGreen: '#22C55E',
  accentOrange: '#F59E0B',
  darkText: '#1A1A1A',
  gradientEnd: '#7C3AED',
  primary: '#5B2EFF',
  softWhite: '#F8F8F8',
};

export function MarketplaceLandingScreen({
  addressInput,
  onAddressInputChange,
  onContinue,
  onOpenAuth,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.brand}>Beypro</Text>
        <View style={styles.authActionsWrap}>
          <Pressable
            onPress={() => onOpenAuth?.('login')}
            style={[styles.authButton, styles.loginButton]}
          >
            <Text style={styles.loginButtonText}>Log in</Text>
          </Pressable>
          <Pressable onPress={() => onOpenAuth?.('register')} style={styles.authButtonPressable}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.gradientEnd]}
              end={{ x: 1, y: 0.5 }}
              start={{ x: 0, y: 0.5 }}
              style={[styles.authButton, styles.signupButton]}
            >
              <Text style={styles.signupButtonText}>Sign up</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      <View pointerEvents="box-none" style={styles.centerContent}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.gradientEnd]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.heroCard}
        >
          <Text style={styles.headline}>Order delivery near you</Text>
          <View style={styles.statusRow}>
            <Text style={[styles.statusPill, styles.preparingPill]}>Preparing</Text>
            <Text style={[styles.statusPill, styles.deliveredPill]}>Delivered</Text>
          </View>
        </LinearGradient>

        <View style={styles.searchRow}>
          <TextInput
            autoCapitalize="words"
            autoCorrect={false}
            onChangeText={onAddressInputChange}
            placeholder="Enter delivery address"
            placeholderTextColor="#5c5c5c"
            returnKeyType="search"
            style={styles.addressInput}
            value={addressInput}
          />
          <Pressable onPress={onContinue} style={styles.searchButtonPressable}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.gradientEnd]}
              end={{ x: 1, y: 0.5 }}
              start={{ x: 0, y: 0.5 }}
              style={styles.searchButton}
            >
              <Text style={styles.searchButtonText}>Search here</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <Pressable onPress={() => onOpenAuth?.('login')} style={styles.signInLinkWrap}>
          <Text style={styles.signInLink}>Or Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.softWhite,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 20,
  },
  brand: {
    color: COLORS.darkText,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  authActionsWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  authButton: {
    borderRadius: 999,
    borderWidth: 1,
    minWidth: 72,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  authButtonPressable: {
    borderRadius: 999,
  },
  loginButton: {
    backgroundColor: '#ffffff',
    borderColor: '#e7e7e7',
  },
  signupButton: {
    borderColor: COLORS.primary,
  },
  loginButtonText: {
    color: COLORS.darkText,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  signupButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 4,
  },
  heroCard: {
    borderRadius: 24,
    marginBottom: 18,
    paddingHorizontal: 18,
    paddingVertical: 22,
  },
  headline: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -0.7,
    lineHeight: 46,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  statusPill: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '700',
  },
  preparingPill: {
    backgroundColor: COLORS.accentOrange,
    color: '#ffffff',
  },
  deliveredPill: {
    backgroundColor: COLORS.accentGreen,
    color: '#ffffff',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  addressInput: {
    backgroundColor: '#ffffff',
    borderColor: '#ebeafb',
    borderWidth: 1,
    borderRadius: 12,
    color: COLORS.darkText,
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 54,
    paddingHorizontal: 16,
  },
  searchButton: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 54,
    minWidth: 116,
    paddingHorizontal: 16,
  },
  searchButtonPressable: {
    borderRadius: 12,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  signInLinkWrap: {
    alignSelf: 'flex-start',
    marginTop: 16,
    paddingVertical: 4,
  },
  signInLink: {
    color: COLORS.darkText,
    fontSize: 16,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
