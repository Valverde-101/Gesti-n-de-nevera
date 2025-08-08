import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import React from 'react';
import {createRoot} from 'react-dom/client';

if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root') || document.createElement('div');
  if (!rootTag.parentNode) {
    rootTag.id = 'root';
    document.body.appendChild(rootTag);
  }
  const root = createRoot(rootTag);
  root.render(<App />);
} else {
  AppRegistry.registerComponent(appName, () => App);
}
