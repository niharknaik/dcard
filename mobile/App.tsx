import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PaperProvider} from 'react-native-paper';
import {RootNavigator} from '@/navigation/RootNavigator';
import {endBilling, initBilling} from '@/services/playBilling';
import {theme} from '@/theme';

export default function App() {
  useEffect(() => {
    // Open the Google Play Billing connection on Android (no-op elsewhere) so
    // the first purchase doesn't pay the connection-setup latency. Closed on
    // unmount.
    initBilling();
    return () => {
      endBilling();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
        <RootNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
