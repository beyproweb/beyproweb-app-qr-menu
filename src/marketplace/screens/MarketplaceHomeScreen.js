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
  danger: '#b42318',
  darkText: '#1A1A1A',
  lightText: '#5d6371',
  surface: '#FFFFFF',
  surfaceSoft: '#F8F8F8',
};

const BRAND_LOGO = require('../../../assets/Vibrant _beyall_ logo design.png');

function SocialButton({ dark, disabled, label, onPress }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.socialButton,
        dark ? styles.appleButton : styles.googleButton,
        disabled ? styles.disabledButton : null,
        pressed && !disabled ? styles.socialButtonPressed : null,
      ]}
    >
      <Text style={[styles.socialButtonText, dark ? styles.appleButtonText : styles.googleButtonText]}>
        {label}
      </Text>
    </Pressable>
  );
}

function AuthField({
  autoCapitalize = 'none',
  autoCorrect = false,
  keyboardType = 'default',
  onChangeText,
  placeholder,
  secureTextEntry = false,
  value,
}) {
  return (
    <TextInput
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      keyboardType={keyboardType}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#8f95a2"
      secureTextEntry={secureTextEntry}
      selectionColor={COLORS.accentStart}
      style={styles.authInput}
      value={value}
    />
  );
}

export function MarketplaceHomeScreen({
  authError,
  authLoading,
  authMode,
  formValues,
  onCancelAuth,
  onChangeField,
  onContinueWithApple,
  onContinueWithGoogle,
  onSubmitAuth,
  onSwitchAuthMode,
}) {
  const isRegister = authMode === 'register';

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
            <Text style={styles.subtitle}>One account across all restaurants</Text>
          </View>

          <View style={styles.authModeRow}>
            <Pressable
              onPress={() => onSwitchAuthMode?.('login')}
              style={[styles.authModeButton, !isRegister ? styles.authModeButtonActive : null]}
            >
              <Text style={[styles.authModeText, !isRegister ? styles.authModeTextActive : null]}>Log in</Text>
            </Pressable>
            <Pressable
              onPress={() => onSwitchAuthMode?.('register')}
              style={[styles.authModeButton, isRegister ? styles.authModeButtonActive : null]}
            >
              <Text style={[styles.authModeText, isRegister ? styles.authModeTextActive : null]}>Sign up</Text>
            </Pressable>
          </View>

          <View style={styles.authCard}>
            <SocialButton
              dark
              disabled={authLoading}
              label="Continue with Apple"
              onPress={() => onContinueWithApple?.()}
            />
            <SocialButton
              disabled={authLoading}
              label="Continue with Google"
              onPress={() => onContinueWithGoogle?.()}
            />

            {isRegister ? (
              <AuthField
                autoCapitalize="words"
                onChangeText={(value) => onChangeField?.('name', value)}
                placeholder="Full name"
                value={formValues?.name}
              />
            ) : null}

            <AuthField
              keyboardType={isRegister ? 'phone-pad' : 'default'}
              onChangeText={(value) => onChangeField?.(isRegister ? 'phone' : 'login', value)}
              placeholder={isRegister ? 'Phone number' : 'Phone or email'}
              value={isRegister ? formValues?.phone : formValues?.login}
            />

            {isRegister ? (
              <AuthField
                keyboardType="email-address"
                onChangeText={(value) => onChangeField?.('email', value)}
                placeholder="Email (optional)"
                value={formValues?.email}
              />
            ) : null}

            {isRegister ? (
              <AuthField
                autoCapitalize="words"
                onChangeText={(value) => onChangeField?.('address', value)}
                placeholder="Address (optional)"
                value={formValues?.address}
              />
            ) : null}

            <AuthField
              onChangeText={(value) => onChangeField?.('password', value)}
              placeholder="Password"
              secureTextEntry
              value={formValues?.password}
            />

            {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

            <Pressable
              disabled={authLoading}
              onPress={() => onSubmitAuth?.()}
              style={({ pressed }) => [
                styles.primaryAction,
                authLoading ? styles.disabledButton : null,
                pressed && !authLoading ? styles.socialButtonPressed : null,
              ]}
            >
              <LinearGradient
                colors={[COLORS.accentStart, COLORS.accentEnd]}
                end={{ x: 1, y: 0.5 }}
                start={{ x: 0, y: 0.5 }}
                style={styles.primaryActionGradient}
              >
                <Text style={styles.primaryActionText}>
                  {authLoading ? 'Please wait...' : isRegister ? 'Create account' : 'Continue'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.footerWrap}>
            <Text style={styles.footerText}>Your account works in every Beyall restaurant</Text>
            <Text style={styles.footerSupport}>No repeated sign-in needed</Text>
            {typeof onCancelAuth === 'function' ? (
              <Pressable
                disabled={authLoading}
                onPress={onCancelAuth}
                style={({ pressed }) => [
                  styles.secondaryAction,
                  authLoading ? styles.disabledButton : null,
                  pressed && !authLoading ? styles.socialButtonPressed : null,
                ]}
              >
                <Text style={styles.secondaryActionText}>Back to marketplace</Text>
              </Pressable>
            ) : null}
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
    marginBottom: 24,
    marginTop: 6,
  },
  logo: {
    height: 96,
    width: 220,
  },
  headerWrap: {
    alignItems: 'center',
    marginBottom: 18,
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
  authModeRow: {
    backgroundColor: '#eceef8',
    borderRadius: 14,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 4,
  },
  authModeButton: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  authModeButtonActive: {
    backgroundColor: '#ffffff',
  },
  authModeText: {
    color: '#667085',
    fontSize: 14,
    fontWeight: '700',
  },
  authModeTextActive: {
    color: COLORS.darkText,
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
    minHeight: 50,
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
    fontSize: 15,
    fontWeight: '700',
  },
  appleButtonText: {
    color: '#ffffff',
  },
  googleButtonText: {
    color: COLORS.darkText,
  },
  authInput: {
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    color: COLORS.darkText,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 10,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  primaryAction: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryActionGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 14,
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.65,
  },
  footerWrap: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 22,
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
  secondaryAction: {
    alignItems: 'center',
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 14,
    minHeight: 40,
    paddingHorizontal: 18,
  },
  secondaryActionText: {
    color: COLORS.darkText,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
});
