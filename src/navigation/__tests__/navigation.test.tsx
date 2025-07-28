import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '@store/store';
import RootNavigator from '../RootNavigator';

describe('Navigation', () => {
  it('should render without crashing', () => {
    const component = (
      <Provider store={store}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </Provider>
    );

    // Since we're not authenticated, should show welcome screen
    expect(() => render(component)).not.toThrow();
  });
});
