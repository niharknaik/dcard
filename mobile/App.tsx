import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PaperProvider} from 'react-native-paper';
import {RootNavigator} from '@/navigation/RootNavigator';
import {theme} from '@/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
        <RootNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
