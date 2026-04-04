import { useCallback, useEffect, useState } from 'react';

import * as Linking from 'expo-linking';

import { pushRecentRestaurantSlug, setLastRestaurantSlug } from '../storage/sessionStore';
import {
  buildRestaurantActionWebUrl,
  extractSlugFromInternalWebUrl,
  mapIncomingUrlToWebRoute,
} from './routeResolver';

const BOOTSTRAP_TIMEOUT_MS = 8000;

export function useAppLinks() {
  const [state, setState] = useState({
    activeSlug: null,
    appMode: 'marketplace',
    initializing: true,
    navigationKey: 0,
    targetWebUrl: null,
  });

  const persistLastVisit = useCallback((slug) => {
    if (!slug) {
      return;
    }

    setLastRestaurantSlug(slug);
    pushRecentRestaurantSlug(slug);
  }, []);

  const applyRoute = useCallback((route) => {
    if (!route) {
      return;
    }

    if (route.appMode === 'marketplace') {
      setState((previousState) => ({
        ...previousState,
        activeSlug: null,
        appMode: 'marketplace',
        navigationKey: previousState.navigationKey,
        targetWebUrl: null,
      }));
      return;
    }

    if (!route.webUrl) {
      return;
    }

    setState((previousState) => ({
      ...previousState,
      activeSlug: route.slug || null,
      appMode: 'web',
      navigationKey: previousState.navigationKey + 1,
      targetWebUrl: route.webUrl,
    }));

    if (route.slug) {
      persistLastVisit(route.slug);
    }
  }, [persistLastVisit]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const finishBootstrap = (nextState) => {
      if (!isMounted || !nextState) {
        return;
      }

      setState((previousState) => ({
        ...previousState,
        activeSlug: nextState.activeSlug || null,
        appMode: nextState.appMode,
        initializing: false,
        navigationKey: nextState.navigationKey
          ? previousState.navigationKey + 1
          : previousState.navigationKey,
        targetWebUrl: nextState.targetWebUrl || null,
      }));
    };

    async function bootstrapFromInitialLink() {
      let initialUrl = null;

      try {
        initialUrl = await Linking.getInitialURL();
      } catch {
        initialUrl = null;
      }

      const initialRoute = mapIncomingUrlToWebRoute(initialUrl);

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (initialRoute) {
        if (initialRoute.appMode === 'marketplace') {
          finishBootstrap({
            activeSlug: null,
            appMode: 'marketplace',
            navigationKey: false,
            targetWebUrl: null,
          });
          return;
        }

        finishBootstrap({
          activeSlug: initialRoute.slug || null,
          appMode: 'web',
          navigationKey: true,
          targetWebUrl: initialRoute.webUrl,
        });
        if (initialRoute.slug) {
          persistLastVisit(initialRoute.slug);
        }
        return;
      }

      finishBootstrap({
        activeSlug: null,
        appMode: 'marketplace',
        navigationKey: false,
        targetWebUrl: null,
      });
    }

    timeoutId = setTimeout(() => {
      finishBootstrap({
        activeSlug: null,
        appMode: 'marketplace',
        navigationKey: false,
        targetWebUrl: null,
      });
    }, BOOTSTRAP_TIMEOUT_MS);

    bootstrapFromInitialLink();

    const subscription = Linking.addEventListener('url', ({ url }) => {
      const route = mapIncomingUrlToWebRoute(url);
      if (route) {
        applyRoute(route);
      }
    });

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.remove();
    };
  }, [applyRoute, persistLastVisit]);

  const openRestaurantRoute = useCallback(
    ({ action = 'order', slug }) => {
      const webUrl = buildRestaurantActionWebUrl(slug, action);
      applyRoute({
        slug,
        webUrl,
      });
    },
    [applyRoute],
  );

  const trackInternalWebNavigation = useCallback((nextUrl) => {
    const slug = extractSlugFromInternalWebUrl(nextUrl);
    if (!slug) {
      return;
    }

    setState((previousState) => {
      if (previousState.activeSlug === slug) {
        return previousState;
      }

      return {
        ...previousState,
        activeSlug: slug,
      };
    });

    persistLastVisit(slug);
  }, [persistLastVisit]);

  return {
    ...state,
    applyRoute,
    openRestaurantRoute,
    trackInternalWebNavigation,
  };
}
