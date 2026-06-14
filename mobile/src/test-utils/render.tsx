import React, {ReactElement} from 'react';
import {Text} from 'react-native';
import {render, RenderOptions} from '@testing-library/react-native';
import {PaperProvider} from 'react-native-paper';
import {SafeAreaProvider, initialWindowMetrics} from 'react-native-safe-area-context';
import {theme} from '@/theme';

// Paper renders icons from a native vector-icons font that isn't present under
// Jest; without an override it warns "no icon libraries installed" for every
// icon. Render the icon name as plain text so it's both silent and queryable.
const iconSettings = {
  icon: ({name}: {name?: string}) => <Text>{name}</Text>,
};

// Static metrics so SafeAreaProvider resolves synchronously in tests instead of
// waiting on a native onLayout measurement that never fires under Jest.
const metrics = initialWindowMetrics ?? {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 47, left: 0, right: 0, bottom: 34},
};

function Providers({children}: {children: React.ReactNode}) {
  return (
    <SafeAreaProvider initialMetrics={metrics}>
      <PaperProvider theme={theme} settings={iconSettings}>
        {children}
      </PaperProvider>
    </SafeAreaProvider>
  );
}

/**
 * Render a component inside the app's provider tree (Paper theme + safe area).
 * Use this instead of RNTL's bare `render` for anything that touches the theme,
 * icons, or paper components.
 */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, {wrapper: Providers, ...options});
}

// Re-export the rest of RNTL so tests have a single import site.
export * from '@testing-library/react-native';
