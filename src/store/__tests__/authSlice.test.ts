import authReducer, { clearAuth, setError, setUser } from '../slices/authSlice';
import type { User } from '@types';

describe('authSlice', () => {
  const initialState = {
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setUser', () => {
    const user: User = {
      id: '1',
      email: 'test@example.com',
      hasCompletedOnboarding: true,
    };

    const actual = authReducer(initialState, setUser(user));
    expect(actual.user).toEqual(user);
    expect(actual.isAuthenticated).toBe(true);
  });

  it('should handle clearAuth', () => {
    const stateWithUser = {
      ...initialState,
      user: { id: '1', email: 'test@example.com' } as User,
      isAuthenticated: true,
    };

    const actual = authReducer(stateWithUser, clearAuth());
    expect(actual).toEqual(initialState);
  });

  it('should handle setError', () => {
    const errorMessage = 'Authentication failed';
    const actual = authReducer(initialState, setError(errorMessage));

    expect(actual.error).toBe(errorMessage);
    expect(actual.isLoading).toBe(false);
  });
});
