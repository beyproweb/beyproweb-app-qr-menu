import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  clearSession,
  getStoredMarketplaceToken,
  loginMarketplaceSession,
  registerMarketplaceSession,
  restoreMarketplaceSession,
} from '../services/marketplaceAuthService';

const INITIAL_STATE = {
  customer: null,
  error: null,
  loading: true,
  token: '',
};

export function useMarketplaceAuth() {
  const [state, setState] = useState(INITIAL_STATE);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setState((previous) => ({ ...previous, error: null, loading: true }));

      try {
        const session = await restoreMarketplaceSession();
        if (cancelled) {
          return;
        }

        setState({
          customer: session?.customer || null,
          error: null,
          loading: false,
          token: String(session?.token || ''),
        });
      } catch {
        if (cancelled) {
          return;
        }

        setState({
          customer: null,
          error: null,
          loading: false,
          token: '',
        });
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async ({ login, password }) => {
    setState((previous) => ({ ...previous, error: null, loading: true }));
    try {
      const session = await loginMarketplaceSession({ login, password });
      const token = String(session?.token || '');
      setState({
        customer: session?.customer || null,
        error: null,
        loading: false,
        token,
      });
      return session;
    } catch (error) {
      setState((previous) => ({
        ...previous,
        error: String(error?.message || 'Login failed'),
        loading: false,
      }));
      return null;
    }
  }, []);

  const register = useCallback(async ({ address, email, name, password, phone }) => {
    setState((previous) => ({ ...previous, error: null, loading: true }));
    try {
      const session = await registerMarketplaceSession({
        address,
        email,
        name,
        password,
        phone,
      });
      const token = String(session?.token || '');
      setState({
        customer: session?.customer || null,
        error: null,
        loading: false,
        token,
      });
      return session;
    } catch (error) {
      setState((previous) => ({
        ...previous,
        error: String(error?.message || 'Registration failed'),
        loading: false,
      }));
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setState({
      customer: null,
      error: null,
      loading: false,
      token: '',
    });
  }, []);

  const refreshToken = useCallback(async () => {
    const storedToken = await getStoredMarketplaceToken();
    setState((previous) => ({
      ...previous,
      token: String(storedToken || ''),
    }));
  }, []);

  const isAuthenticated = Boolean(state.customer?.id && state.token);

  const webSyncPayload = useMemo(() => {
    if (!isAuthenticated) {
      return null;
    }

    return {
      customer: {
        address: state.customer.address || '',
        email: state.customer.email || '',
        id: state.customer.id,
        language: state.customer.language || '',
        name: state.customer.name || 'Customer',
        phone: state.customer.phone || '',
      },
      token: state.token,
    };
  }, [isAuthenticated, state.customer, state.token]);

  return {
    ...state,
    isAuthenticated,
    login,
    logout,
    refreshToken,
    register,
    webSyncPayload,
  };
}
