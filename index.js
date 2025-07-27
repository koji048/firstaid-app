/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initSentry } from './src/services/sentry';

// Initialize Sentry before app starts
initSentry();

AppRegistry.registerComponent(appName, () => App);
