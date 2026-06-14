import React, {useCallback, useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {Card as PaperCard, Chip, Text} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {EmptyState} from '@/components/ui/EmptyState';
import {paymentsApi} from '@/api/payments.api';
import {Payment} from '@/types';
import {colors, spacing} from '@/theme';
import {formatCurrency, formatDate} from '@/utils/format';

const STATUS_COLORS: Record<string, string> = {
  paid: colors.secondary,
  captured: colors.secondary,
  pending: colors.muted,
  failed: colors.error,
  refunded: colors.muted,
};

export function PaymentHistoryScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setPayments(await paymentsApi.history());
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <ScreenContainer scroll={false} style={styles.container}>
      <FlatList
        data={payments}
        keyExtractor={item => String(item.id)}
        refreshing={refreshing}
        onRefresh={load}
        contentContainerStyle={styles.list}
        renderItem={({item}) => {
          const statusColor = STATUS_COLORS[item.status] ?? colors.muted;
          return (
            <PaperCard style={styles.card} mode="elevated">
              <PaperCard.Content>
                <Text variant="titleMedium" style={styles.amount}>
                  {formatCurrency(item.amount, item.currency)}
                </Text>
                {item.plan ? <Text style={styles.muted}>{item.plan.name} plan</Text> : null}
                <Text variant="labelSmall" style={styles.meta}>
                  {item.invoice_number ?? item.transaction_id}
                </Text>
                <Text variant="labelSmall" style={styles.meta}>
                  {formatDate(item.paid_at ?? item.created_at)}
                  {item.method ? ` · ${item.method}` : ''}
                </Text>
                <Chip compact style={[styles.statusChip, {backgroundColor: statusColor}]} textStyle={styles.statusText}>
                  {item.status}
                </Chip>
              </PaperCard.Content>
            </PaperCard>
          );
        }}
        ListEmptyComponent={
          !refreshing ? <EmptyState icon="receipt" title="No payments yet" subtitle="Your subscription payments appear here." /> : null
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {padding: 0},
  list: {padding: spacing.md, flexGrow: 1},
  card: {marginBottom: spacing.sm, backgroundColor: colors.surface},
  amount: {color: colors.text},
  muted: {color: colors.muted, marginTop: 2},
  meta: {color: colors.muted, marginTop: spacing.xs},
  statusChip: {alignSelf: 'flex-start', marginTop: spacing.sm},
  statusText: {color: colors.surface, textTransform: 'capitalize'},
});
