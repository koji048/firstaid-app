import * as Sentry from '@sentry/react-native';

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || '',
    debug: __DEV__,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    integrations: [Sentry.reactNativeTracingIntegration()],
    beforeSend: (event) => {
      // Filter out sensitive information
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }

      // Don't send events in development unless explicitly enabled
      if (__DEV__ && !process.env.SENTRY_ENABLE_IN_DEV) {
        return null;
      }

      return event;
    },
  });
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional', context);
    }
    Sentry.captureException(error);
  });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

export const setUser = (user: { id: string; username?: string }) => {
  Sentry.setUser({
    id: user.id,
    username: user.username,
  });
};

export const clearUser = () => {
  Sentry.setUser(null);
};

export const addBreadcrumb = (breadcrumb: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, any>;
}) => {
  Sentry.addBreadcrumb(breadcrumb);
};
