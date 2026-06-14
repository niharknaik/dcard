import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {colors, spacing} from '@/theme';

interface Props {
  /** Optional caption shown beneath the spinner. */
  message?: string;
}

export function LoadingView({message}: Props) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? (
        <Text variant="bodyMedium" style={styles.message}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  message: {color: colors.muted},
});
