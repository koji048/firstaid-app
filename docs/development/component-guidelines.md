# Component Usage Guidelines

## Overview

This project uses React Native Elements as the base UI component library, with custom wrapper components to ensure consistency and theme integration.

## Base Components

### Button

Use the custom Button component from `@components/common` instead of native TouchableOpacity:

```typescript
import { Button } from '@components/common';

<Button title="Emergency Call" onPress={handleEmergency} variant="danger" size="large" />;
```

### Card

For container components with elevation:

```typescript
import { Card } from '@components/common';

<Card variant="elevated">
  <Text>Card content</Text>
</Card>;
```

### LoadingSpinner

For loading states:

```typescript
import { LoadingSpinner } from '@components/common';

<LoadingSpinner visible={isLoading} message="Loading guides..." overlay />;
```

### ErrorBoundary

Wrap screens or complex components:

```typescript
import { ErrorBoundary } from '@components/common';

<ErrorBoundary onReset={handleReset}>
  <ComplexComponent />
</ErrorBoundary>;
```

## React Native Elements Components

For components not wrapped yet, use React Native Elements directly:

```typescript
import { Input, ListItem, Avatar, Badge } from 'react-native-elements';
```

## Theme Integration

Always use the theme system for colors and styles:

```typescript
import { useAppTheme } from '@styles/ThemeProvider';

const MyComponent = () => {
  const { colors, theme } = useAppTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={[theme.typography.title1, { color: colors.text }]}>Title</Text>
    </View>
  );
};
```

## Best Practices

1. **Consistency**: Use existing components before creating new ones
2. **Theme-aware**: Always use theme colors and typography
3. **Accessibility**: Include testID props for testing
4. **Performance**: Use React.memo for expensive components
5. **Type Safety**: Define TypeScript interfaces for all props

## Component Creation Template

When creating new components:

```typescript
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@styles/ThemeProvider';

interface ComponentNameProps {
  title: string;
  onPress?: () => void;
  testID?: string;
}

export const ComponentName = memo<ComponentNameProps>(
  ({ title, onPress, testID = 'component-name' }) => {
    const { colors, theme } = useAppTheme();

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]} testID={testID}>
        <Text style={[theme.typography.body, { color: colors.text }]}>{title}</Text>
      </View>
    );
  },
);

ComponentName.displayName = 'ComponentName';

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

## Icon Usage

React Native Elements includes vector icons. Common usage:

```typescript
import { Icon } from 'react-native-elements';

<Icon name="heart" type="font-awesome" color={colors.danger} size={24} />;
```

Common icon types:

- `material` - Material Icons
- `material-community` - Material Community Icons
- `font-awesome` - Font Awesome Icons
- `ionicon` - Ionicons
- `feather` - Feather Icons

## Form Components

For forms, use React Native Elements form components:

```typescript
import { Input, CheckBox, ButtonGroup } from 'react-native-elements';

<Input
  placeholder="Email"
  leftIcon={{ type: 'material', name: 'email' }}
  errorMessage={errors.email}
  onChangeText={handleEmailChange}
/>;
```

## Lists

Use ListItem for consistent list rendering:

```typescript
import { ListItem } from 'react-native-elements';

{
  contacts.map((contact, i) => (
    <ListItem key={i} bottomDivider>
      <ListItem.Content>
        <ListItem.Title>{contact.name}</ListItem.Title>
        <ListItem.Subtitle>{contact.phone}</ListItem.Subtitle>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  ));
}
```
