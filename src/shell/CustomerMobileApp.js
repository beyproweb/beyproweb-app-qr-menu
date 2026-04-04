import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as SplashScreen from 'expo-splash-screen';

import { UI_TEXT } from '../config/constants';
import { useAppLinks } from '../linking/useAppLinks';
import { MarketplaceNavigator } from '../marketplace/screens/MarketplaceNavigator';
import { ErrorState } from '../ui/ErrorState';
import { LoadingState } from '../ui/LoadingState';
import { CustomerWebAppContainer } from '../webview/CustomerWebAppContainer';

const INITIAL_PAGE_LOAD_TIMEOUT_MS = 45000;

SplashScreen.preventAutoHideAsync().catch(() => {});

export function CustomerMobileApp() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef(null);
  const hasHiddenSplashRef = useRef(false);
  const hasRedirectedOnWebRef = useRef(false);

  const {
    appMode,
    applyRoute,
    initializing,
    navigationKey,
    openRestaurantRoute,
    targetWebUrl,
    trackInternalWebNavigation,
  } = useAppLinks();

  const [canGoBack, setCanGoBack] = useState(false);
  const [hasLoadedInitialPage, setHasLoadedInitialPage] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [retryVersion, setRetryVersion] = useState(0);

  const hideNativeSplash = useCallback(() => {
    if (hasHiddenSplashRef.current) {
      return;
    }

    hasHiddenSplashRef.current = true;
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (initializing || appMode !== 'web') {
      return;
    }

    setIsPageLoading(true);
    setPageError(null);
  }, [appMode, initializing, navigationKey, retryVersion]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBack || !webViewRef.current) {
        return false;
      }

      webViewRef.current.goBack();
      return true;
    });

    return () => subscription.remove();
  }, [canGoBack]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return undefined;
    }

    if (appMode !== 'web' || initializing || hasLoadedInitialPage || pageError) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setIsPageLoading(false);
      setPageError({
        description: 'Initial page load timed out.',
        type: 'timeout',
        url: targetWebUrl,
      });
      hideNativeSplash();
    }, INITIAL_PAGE_LOAD_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [appMode, hasLoadedInitialPage, hideNativeSplash, initializing, pageError, targetWebUrl]);

  useEffect(() => {
    if (
      Platform.OS !== 'web' ||
      appMode !== 'web' ||
      initializing ||
      !targetWebUrl ||
      hasRedirectedOnWebRef.current
    ) {
      return;
    }

    hasRedirectedOnWebRef.current = true;

    if (typeof window !== 'undefined' && window.location?.href !== targetWebUrl) {
      window.location.replace(targetWebUrl);
    }
  }, [appMode, initializing, targetWebUrl]);

  useEffect(() => {
    if (initializing || appMode !== 'marketplace') {
      return;
    }

    hideNativeSplash();
  }, [appMode, hideNativeSplash, initializing]);

  const effectiveNavigationKey = useMemo(
    () => `${navigationKey}-${retryVersion}`,
    [navigationKey, retryVersion],
  );
  const safeTopInset = useMemo(() => {
    const topInset = Number(insets.top || 0);
    if (Platform.OS === 'android') {
      const statusBarHeight = Number(StatusBar.currentHeight || 0);
      // Android often reports both inset and status bar height for the same area.
      // Subtract to avoid a double top gap.
      return Math.max(topInset - statusBarHeight, 0);
    }
    return Math.max(topInset, 0);
  }, [insets.top]);

  const safeBottomInset = useMemo(() => {
    const bottomInset = Number(insets.bottom || 0);
    if (Platform.OS === 'android') {
      return Math.max(bottomInset, 12);
    }
    return Math.max(bottomInset, 8);
  }, [insets.bottom]);

  const handleRetry = useCallback(() => {
    setHasLoadedInitialPage(false);
    setPageError(null);
    setIsPageLoading(true);
    setRetryVersion((previousVersion) => previousVersion + 1);
  }, []);

  const handleLoadEnd = useCallback(
    (loadedUrl) => {
      setIsPageLoading(false);
      setPageError(null);
      setHasLoadedInitialPage(true);
      trackInternalWebNavigation(loadedUrl);
      hideNativeSplash();
    },
    [hideNativeSplash, trackInternalWebNavigation],
  );

  const handleLoadStart = useCallback(
    (loadingUrl) => {
      setIsPageLoading(true);
      setPageError(null);
      trackInternalWebNavigation(loadingUrl);
    },
    [trackInternalWebNavigation],
  );

  const handlePageError = useCallback(
    (error) => {
      setIsPageLoading(false);
      setPageError(error);
      hideNativeSplash();
    },
    [hideNativeSplash],
  );

  const handleMarketplaceRequest = useCallback(() => {
    applyRoute({ appMode: 'marketplace' });
  }, [applyRoute]);

  if (initializing) {
    return <LoadingState subtitle={UI_TEXT.loadingSubtitle} title={UI_TEXT.loadingTitle} />;
  }

  if (appMode === 'marketplace') {
    return (
      <View style={styles.safeArea}>
        <View
          style={[
            styles.container,
            {
              paddingBottom: safeBottomInset,
              paddingTop: safeTopInset,
            },
          ]}
        >
          <MarketplaceNavigator onOpenRestaurantFlow={openRestaurantRoute} />
        </View>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <LoadingState subtitle={UI_TEXT.webRedirectSubtitle} title={UI_TEXT.webRedirectTitle} />
    );
  }

  return (
    <View style={styles.safeArea}>
      <View
        style={[
          styles.container,
          {
            paddingBottom: safeBottomInset,
            paddingTop: safeTopInset,
          },
        ]}
      >
        <CustomerWebAppContainer
          navigationKey={effectiveNavigationKey}
          onMarketplaceRequest={handleMarketplaceRequest}
          onNavigationStateChange={(navigationState) => {
            setCanGoBack(navigationState.canGoBack);
          }}
          onPageError={handlePageError}
          onPageLoadEnd={handleLoadEnd}
          onPageLoadStart={handleLoadStart}
          onTrackInternalUrl={trackInternalWebNavigation}
          sourceUrl={targetWebUrl}
          webViewRef={webViewRef}
        />

        {!hasLoadedInitialPage && isPageLoading && !pageError ? (
          <View pointerEvents="none" style={styles.loadingOverlay}>
            <LoadingState title={UI_TEXT.pageLoading} />
          </View>
        ) : null}

        {pageError ? (
          <ErrorState
            actionLabel={UI_TEXT.retryButton}
            description={
              pageError?.description
                ? `${UI_TEXT.errorDescription} (${pageError.description})`
                : UI_TEXT.errorDescription
            }
            onRetry={handleRetry}
            title={UI_TEXT.errorTitle}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  container: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
});
