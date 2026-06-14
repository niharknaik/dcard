import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Icon, Text} from 'react-native-paper';
import {colors, radius, spacing} from '@/theme';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/**
 * Friendly full-screen error with an optional retry. Use for failed loads.
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'Please check your connection and try again.',
  onRetry,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Icon source="alert-circle-outline" size={40} color={colors.error} />
      </View>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={styles.message}>
        {message}
      </Text>
      {onRetry ? (
        <Button mode="contained" onPress={onRetry} style={styles.button} icon="refresh">
          Try again
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm},
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {color: colors.text, textAlign: 'center'},
  message: {color: colors.muted, textAlign: 'center', maxWidth: 260, lineHeight: 20},
  button: {marginTop: spacing.md},
});
