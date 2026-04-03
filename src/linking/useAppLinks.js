import { useCallback, useEffect, useState } from 'react';

import * as Linking from 'expo-linking';

import { getLastRestaurantSlug, setLastRestaurantSlug } from '../storage/sessionStore';
import {
  buildDefaultWebUrl,
  extractSlugFromInternalWebUrl,
  mapIncomingUrlToWebRoute,
} from './routeResolver';

const BOOTSTRAP_TIMEOUT_MS = 8000;

export function useAppLinks() {
  const [state, setState] = useState({
    activeSlug: null,
    initializing: true,
    navigationKey: 0,
    targetWebUrl: buildDefaultWebUrl(null),
  });

  const applyRoute = useCallback((route) => {
    if (!route || !route.webUrl) {
      return;
    }

    setState((previousState) => ({
      ...previousState,
      activeSlug: route.slug || null,
      navigationKey: previousState.navigationKey + 1,
      targetWebUrl: route.webUrl,
    }));

    if (route.slug) {
      setLastRestaurantSlug(route.slug);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const finishBootstrap = (route) => {
      if (!isMounted || !route?.webUrl) {
        return;
      }

      setState((previousState) => ({
        ...previousState,
        activeSlug: route.slug || null,
        initializing: false,
        navigationKey: previousState.navigationKey + 1,
        targetWebUrl: route.webUrl,
      }));

      if (route.slug) {
        setLastRestaurantSlug(route.slug);
      }
    };

    async function bootstrapFromInitialLink() {
      let initialUrl = null;
      let savedSlug = null;

      try {
        [initialUrl, savedSlug] = await Promise.all([
          Linking.getInitialURL(),
          getLastRestaurantSlug(),
        ]);
      } catch {
        try {
          savedSlug = await getLastRestaurantSlug();
        } catch {
          savedSlug = null;
        }
      }

      const initialRoute = mapIncomingUrlToWebRoute(initialUrl);
      const fallbackRoute = {
        slug: savedSlug || null,
        webUrl: buildDefaultWebUrl(savedSlug),
      };

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      finishBootstrap(initialRoute || fallbackRoute);
    }

    timeoutId = setTimeout(() => {
      const fallbackRoute = {
        slug: null,
        webUrl: buildDefaultWebUrl(null),
      };
      finishBootstrap(fallbackRoute);
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
  }, [applyRoute]);

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

    setLastRestaurantSlug(slug);
  }, []);

  return {
    ...state,
    applyRoute,
    trackInternalWebNavigation,
  };
}
