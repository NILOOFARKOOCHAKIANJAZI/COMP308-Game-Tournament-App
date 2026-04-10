import React, { createContext, useContext, useMemo } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';

import { GET_ME } from '../graphql/queries.js';
import { LOGOUT_MUTATION } from '../graphql/mutations.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const apolloClient = useApolloClient();

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery(GET_ME, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only'
  });

  const [logoutMutation, { loading: logoutLoading }] = useMutation(LOGOUT_MUTATION);

  const user = data?.me ?? null;
  const isAuthenticated = Boolean(user);
  const role = user?.role ?? null;

  const refreshAuth = async () => {
    try {
      await refetch();
    } catch (err) {
      console.error('Auth refresh failed:', err);
    }
  };

  const logoutCurrentUser = async () => {
    try {
      await logoutMutation();
      await apolloClient.clearStore();
      await refetch();
      return { success: true };
    } catch (err) {
      console.error('Logout failed:', err);
      return {
        success: false,
        message: err.message || 'Logout failed'
      };
    }
  };

  const value = useMemo(
    () => ({
      user,
      role,
      isAuthenticated,
      loading,
      error,
      logoutLoading,
      refreshAuth,
      logoutCurrentUser
    }),
    [user, role, isAuthenticated, loading, error, logoutLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}