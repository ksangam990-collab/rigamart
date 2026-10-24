import { describe, it, expect } from 'vitest';
import authReducer, {
  setAuthError,
  clearError,
  resetAuth,
  setCredentials
} from './authSlice';

describe('Redux authSlice Unit Test Suite', () => {
  const initialTestState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  };

  it('should return the initial state on undefined action', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state).toBeDefined();
    expect(state.isLoading).toBe(false);
  });

  it('should set error properly when setAuthError is dispatched', () => {
    const errorMsg = 'Google Sign-In was blocked by browser popup settings';
    const state = authReducer(initialTestState, setAuthError(errorMsg));
    expect(state.error).toBe(errorMsg);
  });

  it('should clear error when clearError is dispatched', () => {
    const stateWithError = { ...initialTestState, error: 'Some error' };
    const state = authReducer(stateWithError, clearError());
    expect(state.error).toBeNull();
  });

  it('should update user and accessToken when setCredentials is dispatched', () => {
    const mockUser = { _id: '123', name: 'John Doe', email: 'john@example.com' };
    const mockToken = 'mock-jwt-token-xyz';
    const state = authReducer(
      initialTestState,
      setCredentials({ user: mockUser, accessToken: mockToken })
    );

    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should reset auth state completely when resetAuth is dispatched', () => {
    const loggedInState = {
      user: { _id: '123' },
      accessToken: 'xyz',
      isAuthenticated: true,
      isLoading: false,
      error: 'stale'
    };
    const state = authReducer(loggedInState, resetAuth());
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });
});
