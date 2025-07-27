import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-elements';
import { Colors, Typography } from '@styles/theme';
import { captureException } from '@services/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Send error to Sentry with additional context
    captureException(error, {
      errorInfo: errorInfo.componentStack,
      errorBoundary: true,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops!</Text>
          <Text style={styles.message}>Something went wrong. Please try again.</Text>
          {__DEV__ && this.state.error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorTitle}>Error Details:</Text>
              <Text style={styles.errorText}>{this.state.error.toString()}</Text>
            </View>
          )}
          <Button
            title="Try Again"
            onPress={this.handleReset}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    ...Typography.title1,
    color: Colors.text,
    marginBottom: 16,
  },
  message: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  errorDetails: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    maxWidth: '100%',
  },
  errorTitle: {
    ...Typography.footnote,
    color: Colors.danger,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    ...Typography.caption1,
    color: Colors.textSecondary,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    ...Typography.headline,
    color: '#FFFFFF',
  },
});
