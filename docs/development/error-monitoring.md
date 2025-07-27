# Error Monitoring Setup

## Overview

This project uses Sentry for error tracking and performance monitoring. Errors are automatically captured and reported with context to help debug issues in production.

## Configuration

### Environment Variables

Set the following in your `.env` file:

```bash
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ENABLE_IN_DEV=false  # Set to true to enable in development
```

### Initialization

Sentry is initialized in the app entry point:

```typescript
import { initSentry } from '@services/sentry';

// Initialize before rendering
initSentry();
```

## Usage

### Automatic Error Capture

The ErrorBoundary component automatically captures React component errors:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Manual Error Capture

```typescript
import { captureException, captureMessage } from '@services/sentry';

try {
  // risky operation
} catch (error) {
  captureException(error as Error, {
    operation: 'fetchUserData',
    userId: user.id,
  });
}

// Capture custom messages
captureMessage('Payment processing started', 'info');
```

### User Context

Set user context for better error attribution:

```typescript
import { setUser, clearUser } from '@services/sentry';

// On login
setUser({ id: user.id, username: user.email });

// On logout
clearUser();
```

### Breadcrumbs

Add breadcrumbs for better error context:

```typescript
import { addBreadcrumb } from '@services/sentry';

addBreadcrumb({
  message: 'User navigated to emergency screen',
  category: 'navigation',
  level: 'info',
  data: { from: 'home', to: 'emergency' },
});
```

## Source Maps

For production builds, source maps are configured to provide readable stack traces:

1. iOS: Automatically handled by Sentry's React Native SDK
2. Android: Configure in `android/app/build.gradle`

## Privacy Considerations

- User emails and IP addresses are filtered out
- No sensitive medical information is logged
- Custom beforeSend filter removes PII

## Testing Error Reporting

```typescript
// Test button (dev only)
if (__DEV__) {
  <Button
    title="Test Crash"
    onPress={() => {
      throw new Error('Test Sentry Error');
    }}
  />;
}
```

## Performance Monitoring

Sentry automatically tracks:

- App start time
- Screen load times
- HTTP request duration
- JS bundle load time

## Best Practices

1. **Context is Key**: Always provide context when capturing errors
2. **User Privacy**: Never log sensitive user data
3. **Meaningful Messages**: Use descriptive error messages
4. **Breadcrumbs**: Add breadcrumbs for user actions
5. **Environment Separation**: Keep dev and prod errors separate

## Monitoring Dashboard

Access error reports at: https://sentry.io/organizations/[your-org]/issues/

Key metrics to monitor:

- Error rate trends
- Most frequent errors
- User impact (affected users)
- Performance metrics
- Release health
