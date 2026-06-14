import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon, IconButton, Text, TouchableRipple} from 'react-native-paper';
import {colors, radius, spacing} from '@/theme';
import {formatDate} from '@/utils/format';
import {AppNotification} from '@/types';

interface Props {
  notification: AppNotification;
  onPress: () => void;
  onDelete: () => void;
}

const ICONS: Record<string, string> = {
  new_lead: 'account-plus',
  subscription_activated: 'check-decagram',
  subscription_expiring: 'clock-alert',
  view_milestone: 'trophy',
  payment_success: 'credit-card-check',
  payment_failed: 'credit-card-remove',
  payment_refunded: 'cash-refund',
  announcement: 'bullhorn',
};

export function NotificationItem({notification, onPress, onDelete}: Props) {
  const unread = !notification.is_read;

  return (
    <TouchableRipple onPress={onPress} borderless style={styles.ripple}>
      <View style={[styles.row, unread && styles.unread]}>
        <View style={[styles.iconCircle, unread && styles.iconCircleUnread]}>
          <Icon source={ICONS[notification.type] ?? 'bell'} size={20} color={colors.primary} />
        </View>
        <View style={styles.body}>
          <Text variant="titleSmall" numberOfLines={1} style={styles.title}>
            {notification.title}
          </Text>
          <Text variant="bodySmall" style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text variant="labelSmall" style={styles.date}>
            {formatDate(notification.created_at)}
          </Text>
        </View>
        {unread ? <View style={styles.unreadDot} /> : null}
        <IconButton icon="close" size={18} iconColor={colors.muted} onPress={onDelete} />
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  ripple: {borderRadius: radius.lg, marginBottom: spacing.sm},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.sm,
    gap: spacing.sm,
  },
  unread: {backgroundColor: colors.primaryContainer, borderColor: colors.primaryContainer},
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleUnread: {backgroundColor: colors.surface},
  body: {flex: 1, paddingVertical: spacing.sm, gap: 2},
  title: {color: colors.text},
  message: {color: colors.muted},
  date: {color: colors.muted, marginTop: 2},
  unreadDot: {width: 8, height: 8, borderRadius: radius.pill, backgroundColor: colors.primary},
});
