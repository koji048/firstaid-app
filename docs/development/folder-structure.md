# Folder Structure and Conventions

## Project Structure Overview

```
firstaid-app/
├── src/                        # Source code
│   ├── components/            # Reusable UI components
│   │   ├── common/           # Generic components (Button, Card, etc.)
│   │   ├── emergency/        # Emergency-specific components
│   │   ├── guides/           # Guide-related components
│   │   └── medical/          # Medical profile components
│   ├── screens/              # Screen components (Presentation Layer)
│   ├── navigation/           # Navigation configuration
│   ├── store/               # Redux store, slices (Business Logic Layer)
│   ├── services/            # API clients and external services (Data Access Layer)
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   ├── styles/              # Global styles and themes
│   └── platform/            # Platform-specific code (Infrastructure Layer)
├── android/                  # Android-specific code
├── ios/                     # iOS-specific code
├── __tests__/               # Test files
├── docs/                    # Documentation
│   ├── development/         # Development guides
│   ├── architecture/        # Architecture documentation
│   ├── stories/            # User stories
│   └── prd/                # Product requirements
└── .github/                 # GitHub Actions workflows
```

## Layer Architecture

### 1. Presentation Layer (`src/screens/` and `src/components/`)

- React components and screens
- UI logic and user interactions
- No business logic or API calls

### 2. Business Logic Layer (`src/store/`)

- Redux actions and reducers
- Application state management
- Business rules and data transformations

### 3. Data Access Layer (`src/services/`)

- API client implementations
- Local storage interfaces
- Data fetching and caching logic

### 4. Infrastructure Layer (`src/platform/`)

- Platform-specific implementations
- Native module bridges
- Device capabilities access

## Component Structure Convention

Each component follows this structure:

```
ComponentName/
├── ComponentName.tsx        # Component implementation
├── ComponentName.styles.ts  # Styles (using StyleSheet)
├── ComponentName.test.tsx   # Component tests
└── index.ts                # Export file
```

## Naming Conventions

### Files and Folders

- **Components**: PascalCase (e.g., `EmergencyButton.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useOfflineSync.ts`)
- **Services**: camelCase with '.service' suffix (e.g., `emergency.service.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase with '.types' suffix (e.g., `User.types.ts`)

### Code Conventions

- **Interfaces**: PascalCase with 'I' prefix optional (e.g., `UserProfile` or `IUserProfile`)
- **Type Aliases**: PascalCase (e.g., `AppState`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- **Functions**: camelCase (e.g., `findNearbyHospitals()`)
- **React Components**: PascalCase (e.g., `EmergencyButton`)

## Import Order Convention

1. External imports (React, React Native, third-party libraries)
2. Internal imports using aliases (@components, @screens, etc.)
3. Relative imports
4. Type imports

Example:

```typescript
// External imports
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Internal imports with aliases
import { Button } from '@components/common';
import { useEmergencyMode } from '@hooks/useEmergencyMode';
import { EmergencyService } from '@services/emergency.service';

// Relative imports
import { styles } from './EmergencyScreen.styles';

// Type imports
import type { EmergencyContact } from '@types';
```

## Module Aliases

The following aliases are configured for clean imports:

- `@` → `src/`
- `@components` → `src/components/`
- `@screens` → `src/screens/`
- `@navigation` → `src/navigation/`
- `@store` → `src/store/`
- `@services` → `src/services/`
- `@utils` → `src/utils/`
- `@types` → `src/types/`
- `@hooks` → `src/hooks/`
- `@styles` → `src/styles/`
- `@platform` → `src/platform/`

## Best Practices

1. **Single Responsibility**: Each component/function should have one clear purpose
2. **Composition over Inheritance**: Use hooks and composition patterns
3. **Type Safety**: Always define TypeScript types for props and state
4. **Testability**: Write components with testing in mind
5. **Performance**: Use React.memo for expensive components
6. **Accessibility**: Include testID props for E2E testing

## Example Component Template

```typescript
import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { styles } from './ComponentName.styles';

interface ComponentNameProps {
  title: string;
  onPress?: () => void;
  testID?: string;
}

export const ComponentName = memo<ComponentNameProps>(
  ({ title, onPress, testID = 'component-name' }) => {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.title}>{title}</Text>
      </View>
    );
  },
);

ComponentName.displayName = 'ComponentName';
```
