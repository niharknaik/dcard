import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon, Text} from 'react-native-paper';
import {colors, radius, spacing} from '@/theme';

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({icon = 'inbox', title, subtitle}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Icon source={icon} size={40} color={colors.primary} />
      </View>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="bodyMedium" style={styles.subtitle}>
          {subtitle}
        </Text>
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
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {color: colors.text, textAlign: 'center'},
  subtitle: {color: colors.muted, textAlign: 'center', maxWidth: 260, lineHeight: 20},
});
