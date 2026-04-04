import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CustomerMobileApp } from './src/shell/CustomerMobileApp';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" translucent={false} />
      <CustomerMobileApp />
    </SafeAreaProvider>
  );
}
