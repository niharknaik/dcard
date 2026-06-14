import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {colors, radius, spacing} from '@/theme';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface Props {
  label: string;
  tone?: StatusTone;
}

const TONES: Record<StatusTone, {bg: string; fg: string}> = {
  success: {bg: colors.successContainer, fg: colors.success},
  warning: {bg: colors.warningContainer, fg: colors.warning},
  danger: {bg: colors.errorContainer, fg: colors.error},
  info: {bg: colors.primaryContainer, fg: colors.primary},
  neutral: {bg: colors.surfaceAlt, fg: colors.muted},
};

/** Map a free-form status string to a semantic tone. */
export function toneForStatus(status?: string | null): StatusTone {
  switch ((status ?? '').toLowerCase()) {
    case 'paid':
    case 'captured':
    case 'active':
    case 'success':
      return 'success';
    case 'pending':
    case 'created':
    case 'processing':
      return 'warning';
    case 'failed':
    case 'suspended':
    case 'cancelled':
      return 'danger';
    case 'refunded':
      return 'info';
    default:
      return 'neutral';
  }
}

/**
 * Small pill that conveys state with colour + label. Pairs with `toneForStatus`.
 */
export function StatusBadge({label, tone = 'neutral'}: Props) {
  const {bg, fg} = TONES[tone];
  return (
    <View style={[styles.badge, {backgroundColor: bg}]}>
      <View style={[styles.dot, {backgroundColor: fg}]} />
      <Text style={[styles.label, {color: fg}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    gap: spacing.xs,
  },
  dot: {width: 6, height: 6, borderRadius: radius.pill},
  label: {fontSize: 12, fontWeight: '600', textTransform: 'capitalize'},
});
