/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@store/store';
import { ThemeProvider } from '@styles/ThemeProvider';
import { ErrorBoundary } from '@components/common/ErrorBoundary';
import RootNavigator from '@navigation/RootNavigator';

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ErrorBoundary>
          <RootNavigator />
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
