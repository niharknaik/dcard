import React, {useCallback, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, Card as PaperCard, Dialog, Divider, List, Portal, Snackbar, Text, TextInput} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {EmptyState} from '@/components/ui/EmptyState';
import {rewardsApi} from '@/api/rewards.api';
import {apiErrorMessage} from '@/api/client';
import {RewardTransaction, RewardWallet} from '@/types';
import {colors, radius, spacing} from '@/theme';

export function RewardWalletScreen() {
  const [wallet, setWallet] = useState<RewardWallet | null>(null);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState('');

  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [w, txns] = await Promise.all([rewardsApi.wallet(), rewardsApi.transactions()]);
      setWallet(w);
      setTransactions(txns);
    } catch (e) {
      setSnack(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRedeem = async () => {
    const points = parseInt(redeemPoints, 10);
    if (!points || points <= 0) {
      setSnack('Enter a valid number of points.');
      return;
    }
    setRedeeming(true);
    try {
      const result = await rewardsApi.redeem(points);
      setWallet(result.wallet);
      setRedeemOpen(false);
      setRedeemPoints('');
      setSnack('Points redeemed.');
      await load();
    } catch (e) {
      setSnack(apiErrorMessage(e));
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <ActivityIndicator style={{marginTop: spacing.xl}} color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer refreshing={false} onRefresh={load}>
      <PaperCard mode="elevated" style={styles.balanceCard}>
        <PaperCard.Content>
          <Text variant="labelLarge" style={styles.balanceLabel}>
            Available points
          </Text>
          <Text variant="displaySmall" style={styles.balanceValue}>
            {wallet?.balance ?? 0}
          </Text>
          <View style={styles.lifetime}>
            <Text variant="bodySmall" style={styles.muted}>
              Earned {wallet?.lifetime_earned ?? 0}
            </Text>
            <Text variant="bodySmall" style={styles.muted}>
              Redeemed {wallet?.lifetime_redeemed ?? 0}
            </Text>
          </View>
        </PaperCard.Content>
      </PaperCard>

      <Button mode="contained" icon="gift-open" style={styles.redeem} onPress={() => setRedeemOpen(true)}>
        Redeem points
      </Button>

      <Text variant="titleMedium" style={styles.heading}>
        History
      </Text>

      {transactions.length === 0 ? (
        <EmptyState icon="history" title="No activity yet" subtitle="Earn points via referrals and rewards." />
      ) : (
        transactions.map(txn => (
          <View key={txn.id}>
            <List.Item
              title={txn.source_label}
              description={txn.description ?? new Date(txn.created_at).toLocaleDateString()}
              left={props => (
                <List.Icon
                  {...props}
                  icon={txn.type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle'}
                  color={txn.type === 'credit' ? colors.success : colors.error}
                />
              )}
              right={() => (
                <Text style={[styles.amount, {color: txn.type === 'credit' ? colors.success : colors.error}]}>
                  {txn.signed_points > 0 ? '+' : ''}
                  {txn.signed_points}
                </Text>
              )}
            />
            <Divider />
          </View>
        ))
      )}

      <Portal>
        <Dialog visible={redeemOpen} onDismiss={() => setRedeemOpen(false)}>
          <Dialog.Title>Redeem points</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Points"
              keyboardType="number-pad"
              value={redeemPoints}
              onChangeText={setRedeemPoints}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRedeemOpen(false)}>Cancel</Button>
            <Button loading={redeeming} disabled={redeeming} onPress={onRedeem}>
              Redeem
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={2800}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  balanceCard: {backgroundColor: colors.primary, borderRadius: radius.xl},
  balanceLabel: {color: colors.onPrimary, opacity: 0.85},
  balanceValue: {color: colors.onPrimary, fontWeight: '800', marginTop: spacing.xs},
  lifetime: {flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm},
  muted: {color: colors.onPrimary, opacity: 0.8},
  redeem: {marginTop: spacing.md},
  heading: {marginTop: spacing.lg, marginBottom: spacing.xs, fontWeight: '700'},
  amount: {alignSelf: 'center', fontWeight: '700'},
});
