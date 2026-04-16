import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockUseApolloClient = vi.fn();

vi.mock('@apollo/client', async () => {
  const actual = await vi.importActual('@apollo/client');
  return {
    ...actual,
    useQuery: (...args) => mockUseQuery(...args),
    useMutation: (...args) => mockUseMutation(...args),
    useApolloClient: () => mockUseApolloClient()
  };
});

import { AuthProvider, useAuth } from './AuthContext.jsx';

function TestConsumer() {
  const { user, role, isAuthenticated, loading } = useAuth();

  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="isAuthenticated">{String(isAuthenticated)}</div>
      <div data-testid="role">{role || ''}</div>
      <div data-testid="username">{user?.username || ''}</div>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseApolloClient.mockReturnValue({
      clearStore: vi.fn()
    });

    mockUseMutation.mockReturnValue([
      vi.fn(),
      { loading: false }
    ]);
  });

  it('sets unauthenticated state when GET_ME returns null', () => {
    mockUseQuery.mockReturnValue({
      data: { me: null },
      loading: false,
      error: null,
      refetch: vi.fn()
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('role')).toHaveTextContent('');
    expect(screen.getByTestId('username')).toHaveTextContent('');
  });

  it('sets authenticated state when GET_ME returns a user', () => {
    mockUseQuery.mockReturnValue({
      data: {
        me: {
          id: '1',
          username: 'Niloo',
          role: 'Admin'
        }
      },
      loading: false,
      error: null,
      refetch: vi.fn()
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('role')).toHaveTextContent('Admin');
    expect(screen.getByTestId('username')).toHaveTextContent('Niloo');
  });

  it('handles query failure by exposing error state and unauthenticated user', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('Network error'),
      refetch: vi.fn()
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('role')).toHaveTextContent('');
    expect(screen.getByTestId('username')).toHaveTextContent('');
  });
});