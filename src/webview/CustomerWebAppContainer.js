import React, { useCallback } from 'react';
import { Linking } from 'react-native';

import * as WebBrowser from 'expo-web-browser';
import { WebView } from 'react-native-webview';

import { isInternalBeyproHost } from '../linking/routeResolver';
import { isHttpUrl, safeParseUrl } from '../utils/url';

function openExternalUrl(url) {
  if (!url) {
    return;
  }

  const parsedUrl = safeParseUrl(url);

  if (!parsedUrl) {
    Linking.openURL(url).catch(() => {});
    return;
  }

  if (isHttpUrl(parsedUrl)) {
    WebBrowser.openBrowserAsync(url).catch(() => {});
    return;
  }

  Linking.openURL(url).catch(() => {});
}

function shouldAllowInAppNavigation(url) {
  const parsedUrl = safeParseUrl(url);
  if (!parsedUrl) {
    return false;
  }

  if (parsedUrl.protocol === 'about:' || parsedUrl.protocol === 'data:') {
    return true;
  }

  if (!isHttpUrl(parsedUrl)) {
    return false;
  }

  return isInternalBeyproHost(parsedUrl.host);
}

export function CustomerWebAppContainer({
  navigationKey,
  onMarketplaceRequest,
  onNavigationStateChange,
  onPageError,
  onPageLoadEnd,
  onPageLoadStart,
  onTrackInternalUrl,
  sourceUrl,
  webViewRef,
}) {
  const handleShouldStartLoadWithRequest = useCallback((request) => {
    const nextUrl = request.url;
    const allowInAppNavigation = shouldAllowInAppNavigation(nextUrl);

    if (!allowInAppNavigation) {
      openExternalUrl(nextUrl);
      return false;
    }

    return true;
  }, []);

  const handleMessage = useCallback(
    (event) => {
      const rawPayload = String(event?.nativeEvent?.data || '').trim();
      if (!rawPayload) {
        return;
      }

      let payload = null;
      try {
        payload = JSON.parse(rawPayload);
      } catch {
        return;
      }

      if (payload?.action === 'OPEN_MARKETPLACE') {
        onMarketplaceRequest?.();
      }
    },
    [onMarketplaceRequest],
  );

  return (
    <WebView
      allowsFullscreenVideo
      allowsBackForwardNavigationGestures
      allowsInlineMediaPlayback
      allowsLinkPreview={false}
      allowsProtectedMedia
      autoManageStatusBarEnabled
      automaticallyAdjustContentInsets
      cacheEnabled
      contentInsetAdjustmentBehavior="automatic"
      domStorageEnabled
      geolocationEnabled
      javaScriptEnabled
      javaScriptCanOpenWindowsAutomatically
      key={`customer-webview-${navigationKey}`}
      mediaPlaybackRequiresUserAction={false}
      mixedContentMode="compatibility"
      onError={({ nativeEvent }) => {
        onPageError?.({
          description: nativeEvent.description || 'Network request failed.',
          type: 'network',
          url: nativeEvent.url || sourceUrl,
        });
      }}
      onHttpError={({ nativeEvent }) => {
        const parsedErrorUrl = safeParseUrl(nativeEvent.url || '');
        const isInternalErrorUrl = parsedErrorUrl ? isInternalBeyproHost(parsedErrorUrl.host) : false;
        const statusCode = Number(nativeEvent.statusCode || 0);

        // Ignore non-critical HTTP errors (e.g. 404 on secondary resources).
        // We only surface server-side failures for internal pages.
        if (!isInternalErrorUrl || statusCode < 500) {
          return;
        }

        onPageError?.({
          description: `HTTP ${nativeEvent.statusCode}`,
          statusCode: nativeEvent.statusCode,
          type: 'http',
          url: nativeEvent.url || sourceUrl,
        });
      }}
      onLoadEnd={({ nativeEvent }) => {
        onTrackInternalUrl?.(nativeEvent.url);
        onPageLoadEnd?.(nativeEvent.url);
      }}
      onLoadStart={({ nativeEvent }) => {
        onTrackInternalUrl?.(nativeEvent.url);
        onPageLoadStart?.(nativeEvent.url);
      }}
      onNavigationStateChange={(navigationState) => {
        onTrackInternalUrl?.(navigationState.url);
        onNavigationStateChange?.(navigationState);
      }}
      onMessage={handleMessage}
      onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      originWhitelist={['*']}
      pullToRefreshEnabled
      ref={webViewRef}
      setSupportMultipleWindows={false}
      sharedCookiesEnabled
      source={{ uri: sourceUrl }}
      style={{ flex: 1 }}
      thirdPartyCookiesEnabled
    />
  );
}
