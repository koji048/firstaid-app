# Testing Conventions

## Overview

This project follows a comprehensive testing strategy to ensure code quality and reliability. We use Jest as the test runner and React Native Testing Library for component testing.

## Test File Organization

### Naming Convention

- Unit tests: `ComponentName.test.tsx` or `functionName.test.ts`
- Integration tests: `Feature.integration.test.ts`
- E2E tests: `UserFlow.e2e.ts`

### File Location

- Component tests: Same directory as component
- Hook tests: `src/hooks/__tests__/`
- Utility tests: `src/utils/__tests__/`
- Service tests: `src/services/__tests__/`

## Test Structure

### Basic Test Template

```typescript
import React from 'react';
import { render, fireEvent } from '@utils/test/test-utils';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    const { getByText } = render(<ComponentName title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('handles user interaction', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<ComponentName onPress={onPressMock} testID="component" />);

    fireEvent.press(getByTestId('component'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});
```

## Testing Guidelines

### 1. Component Testing

- Test render output
- Test user interactions
- Test conditional rendering
- Test prop validation
- Test accessibility

Example:

```typescript
describe('EmergencyButton', () => {
  it('should be accessible', () => {
    const { getByA11yLabel } = render(<EmergencyButton onPress={() => {}} />);
    expect(getByA11yLabel('Emergency Call Button')).toBeTruthy();
  });
});
```

### 2. Hook Testing

- Test initial state
- Test state updates
- Test side effects
- Test cleanup

Example:

```typescript
import { renderHook, act } from '@testing-library/react-native';

describe('useTimer', () => {
  it('increments timer', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.start();
    });

    expect(result.current.time).toBeGreaterThan(0);
  });
});
```

### 3. Redux Testing

- Test reducers with different actions
- Test selectors
- Test async thunks
- Test middleware effects

Example:

```typescript
describe('authSlice', () => {
  it('handles login success', () => {
    const initialState = { user: null, isAuthenticated: false };
    const user = { id: '1', email: 'test@example.com' };

    const newState = authReducer(initialState, setUser(user));

    expect(newState.user).toEqual(user);
    expect(newState.isAuthenticated).toBe(true);
  });
});
```

### 4. Service Testing

- Mock external dependencies
- Test success scenarios
- Test error handling
- Test retry logic

Example:

```typescript
describe('EmergencyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches emergency contacts', async () => {
    const mockContacts = [createMockEmergencyContact()];
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockContacts),
      }),
    );

    const contacts = await EmergencyService.getEmergencyContacts();

    expect(contacts).toEqual(mockContacts);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/emergency-contacts'));
  });
});
```

## Test Utilities

### Custom Render

Use the custom render function that includes all providers:

```typescript
import { render } from '@utils/test/test-utils';

const { getByText } = render(<MyComponent />, {
  preloadedState: {
    auth: { isAuthenticated: true },
  },
});
```

### Mock Data Generators

Use provided mock data generators for consistency:

```typescript
import {
  createMockUser,
  createMockEmergencyContact,
  createMockGuide,
} from '@utils/test/test-utils';

const user = createMockUser({ email: 'custom@example.com' });
```

## Coverage Requirements

Maintain the following coverage thresholds:

- Branches: 70%
- Functions: 80%
- Lines: 80%
- Statements: 80%

Run coverage report:

```bash
npm test -- --coverage
```

## Best Practices

### Do's

1. Write descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Test one thing per test
4. Use data-testid for element selection
5. Mock external dependencies
6. Test edge cases
7. Keep tests isolated and independent

### Don'ts

1. Don't test implementation details
2. Don't use snapshot tests for dynamic content
3. Don't test third-party libraries
4. Don't leave console.logs in tests
5. Don't skip error scenarios

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test Button.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"
```

## Debugging Tests

```bash
# Run tests with verbose output
npm test -- --verbose

# Run single test file with debugging
node --inspect-brk ./node_modules/.bin/jest --runInBand path/to/test.ts
```

## Continuous Integration

All PRs must pass:

1. All unit tests
2. Coverage thresholds
3. No console errors
4. No TypeScript errors
