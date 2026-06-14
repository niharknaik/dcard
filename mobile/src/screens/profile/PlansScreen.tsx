import React, {useCallback, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Card as PaperCard, Chip, Text} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {subscriptionsApi} from '@/api/subscriptions.api';
import {apiErrorMessage} from '@/api/client';
import {CheckoutCancelled, purchasePlan} from '@/services/checkout';
import {useAuthStore} from '@/store/auth.store';
import {Plan} from '@/types';
import {colors, spacing} from '@/theme';
import {formatCurrency} from '@/utils/format';

export function PlansScreen() {
  const user = useAuthStore(state => state.user);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentCode, setCurrentCode] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [list, current] = await Promise.all([subscriptionsApi.plans(), subscriptionsApi.current()]);
      setPlans(list);
      setCurrentCode(current.plan?.code ?? null);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onChoose = async (plan: Plan) => {
    if (plan.price <= 0) {
      return;
    }
    setBusy(plan.id);
    setMessage('');
    try {
      await purchasePlan(plan, user);
      setMessage('Subscription activated.');
      await load();
    } catch (e) {
      if (e instanceof CheckoutCancelled) {
        return;
      }
      setMessage(apiErrorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.title}>
        Choose your plan
      </Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {plans.map(plan => {
        const isCurrent = plan.code === currentCode;
        return (
          <PaperCard key={plan.id} style={styles.card} mode="elevated">
            <PaperCard.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleLarge">{plan.name}</Text>
                {isCurrent ? <Chip compact>Current</Chip> : null}
              </View>
              <Text variant="headlineSmall" style={styles.price}>
                {plan.price > 0 ? formatCurrency(plan.price, plan.currency) : 'Free'}
                {plan.price > 0 ? <Text style={styles.period}> / {plan.billing_period}</Text> : null}
              </Text>
              {plan.features.map(f => (
                <Text key={f} style={styles.feature}>
                  • {f}
                </Text>
              ))}
              {!isCurrent && plan.price > 0 ? (
                <Button
                  mode="contained"
                  style={styles.button}
                  loading={busy === plan.id}
                  disabled={busy !== null}
                  onPress={() => onChoose(plan)}>
                  Upgrade
                </Button>
              ) : null}
            </PaperCard.Content>
          </PaperCard>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {color: colors.text, marginBottom: spacing.md},
  message: {color: colors.primary, marginBottom: spacing.sm},
  card: {marginBottom: spacing.md, backgroundColor: colors.surface},
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  price: {color: colors.primary, marginVertical: spacing.sm, fontWeight: '700'},
  period: {color: colors.muted, fontSize: 14},
  feature: {color: colors.text, marginBottom: 2},
  button: {marginTop: spacing.md},
});
