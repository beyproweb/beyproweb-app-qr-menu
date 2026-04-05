import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  accentEnd: '#7C3AED',
  accentStart: '#5B2EFF',
  border: '#d6d7e3',
  darkText: '#1A1A1A',
  lightText: '#5d6371',
  surface: '#FFFFFF',
  surfaceSoft: '#F8F8F8',
};

const BRAND_LOGO = require('../../../assets/Vibrant _beyall_ logo design.png');

function SocialButton({ dark, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialButton,
        dark ? styles.appleButton : styles.googleButton,
        pressed && styles.socialButtonPressed,
      ]}
    >
      <Text style={[styles.socialButtonText, dark ? styles.appleButtonText : styles.googleButtonText]}>
        {label}
      </Text>
    </Pressable>
  );
}

function PhoneNumberField({ onChangeText, onSubmitEditing, value }) {
  return (
    <View style={styles.phoneFieldWrap}>
      <View style={styles.countryCodePill}>
        <Text style={styles.countryCodeText}>+90</Text>
      </View>
      <TextInput
        keyboardType="phone-pad"
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        placeholder="Phone number"
        placeholderTextColor="#8f95a2"
        returnKeyType="done"
        selectionColor={COLORS.accentStart}
        style={styles.phoneInput}
        value={value}
      />
    </View>
  );
}

export function MarketplaceHomeScreen({
  phoneInput,
  onChangePhoneInput,
  onContinueWithApple,
  onContinueWithGoogle,
  onContinueWithPhone,
}) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(91,46,255,0.18)', 'rgba(124,58,237,0)']}
        end={{ x: 1, y: 0.8 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={[styles.edgeGlow, styles.leftGlow]}
      />
      <LinearGradient
        colors={['rgba(124,58,237,0)', 'rgba(91,46,255,0.18)']}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={[styles.edgeGlow, styles.rightGlow]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardWrap}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoWrap}>
            <Image resizeMode="contain" source={BRAND_LOGO} style={styles.logo} />
          </View>

          <View style={styles.headerWrap}>
            <Text style={styles.title}>Welcome to Beyall</Text>
            <Text style={styles.subtitle}>Order food, reserve tables, buy tickets and more</Text>
          </View>

          <View style={styles.authCard}>
            <SocialButton
              dark
              label="Continue with Apple"
              onPress={() => onContinueWithApple?.()}
            />
            <SocialButton
              label="Continue with Google"
              onPress={() => onContinueWithGoogle?.()}
            />
            <PhoneNumberField
              onChangeText={onChangePhoneInput}
              onSubmitEditing={() => onContinueWithPhone?.()}
              value={phoneInput}
            />
          </View>

          <View style={styles.footerWrap}>
            <Text style={styles.footerText}>Terms & Privacy</Text>
            <Text style={styles.footerSupport}>Need help? Get support</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceSoft,
    flex: 1,
    overflow: 'hidden',
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
  },
  edgeGlow: {
    borderRadius: 180,
    height: 320,
    position: 'absolute',
    width: 180,
  },
  leftGlow: {
    left: -96,
    top: 80,
  },
  rightGlow: {
    bottom: 90,
    right: -96,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 26,
    marginTop: 6,
  },
  logo: {
    height: 96,
    width: 220,
  },
  headerWrap: {
    alignItems: 'center',
    marginBottom: 26,
    paddingHorizontal: 8,
  },
  title: {
    color: COLORS.darkText,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.lightText,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    marginTop: 9,
    textAlign: 'center',
  },
  authCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 14,
    shadowColor: '#171a2d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
  },
  socialButton: {
    alignItems: 'center',
    borderRadius: 14,
    minHeight: 52,
    justifyContent: 'center',
    marginBottom: 10,
    paddingHorizontal: 14,
  },
  socialButtonPressed: {
    opacity: 0.9,
  },
  appleButton: {
    backgroundColor: '#0f0f12',
  },
  googleButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  appleButtonText: {
    color: '#ffffff',
  },
  googleButtonText: {
    color: COLORS.darkText,
  },
  phoneFieldWrap: {
    alignItems: 'center',
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 54,
    paddingHorizontal: 8,
  },
  countryCodePill: {
    alignItems: 'center',
    backgroundColor: '#efeff6',
    borderRadius: 10,
    minWidth: 56,
    justifyContent: 'center',
    marginRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  countryCodeText: {
    color: COLORS.darkText,
    fontSize: 14,
    fontWeight: '700',
  },
  phoneInput: {
    color: COLORS.darkText,
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 52,
  },
  footerWrap: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 26,
  },
  footerText: {
    color: '#7d8391',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerSupport: {
    color: COLORS.accentStart,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
});
