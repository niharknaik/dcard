import React, {useCallback, useState} from 'react';
import {Share, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, Card as PaperCard, Divider, List, Snackbar, Text} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {EmptyState} from '@/components/ui/EmptyState';
import {referralsApi} from '@/api/referrals.api';
import {apiErrorMessage} from '@/api/client';
import {ReferralDashboard} from '@/types';
import {colors, radius, spacing} from '@/theme';

export function ReferralScreen() {
  const [data, setData] = useState<ReferralDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await referralsApi.dashboard());
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

  const onShare = async () => {
    if (!data) return;
    try {
      await Share.share({
        message: `Join me on DCard! Use my referral code ${data.referral_code} or sign up here: ${data.referral_link}`,
      });
    } catch {
      // user dismissed the share sheet
    }
  };

  if (loading || !data) {
    return (
      <ScreenContainer>
        <ActivityIndicator style={{marginTop: spacing.xl}} color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer refreshing={false} onRefresh={load}>
      <PaperCard mode="elevated" style={styles.hero}>
        <PaperCard.Content>
          <Text variant="labelLarge" style={styles.heroLabel}>
            Your referral code
          </Text>
          <Text variant="headlineMedium" style={styles.code}>
            {data.referral_code}
          </Text>
          <Text variant="bodySmall" style={styles.link} numberOfLines={1}>
            {data.referral_link}
          </Text>
          <Button mode="contained-tonal" icon="share-variant" style={styles.share} onPress={onShare}>
            Share & earn
          </Button>
        </PaperCard.Content>
      </PaperCard>

      <View style={styles.stats}>
        <PaperCard mode="elevated" style={styles.stat}>
          <PaperCard.Content>
            <Text variant="headlineSmall" style={styles.statValue}>
              {data.total_referrals}
            </Text>
            <Text variant="bodySmall" style={styles.muted}>
              Total referrals
            </Text>
          </PaperCard.Content>
        </PaperCard>
        <PaperCard mode="elevated" style={styles.stat}>
          <PaperCard.Content>
            <Text variant="headlineSmall" style={styles.statValue}>
              {data.total_points_earned}
            </Text>
            <Text variant="bodySmall" style={styles.muted}>
              Points earned
            </Text>
          </PaperCard.Content>
        </PaperCard>
      </View>

      <Text variant="titleMedium" style={styles.heading}>
        Your referrals
      </Text>

      {data.referrals.length === 0 ? (
        <EmptyState icon="account-multiple-plus" title="No referrals yet" subtitle="Share your code to start earning points." />
      ) : (
        data.referrals.map(ref => (
          <View key={ref.id}>
            <List.Item
              title={ref.referred?.name ?? 'New user'}
              description={new Date(ref.created_at).toLocaleDateString()}
              left={props => <List.Icon {...props} icon="account-check" color={colors.success} />}
              right={() => <Text style={styles.points}>+{ref.points_awarded}</Text>}
            />
            <Divider />
          </View>
        ))
      )}

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={2800}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {backgroundColor: colors.primary, borderRadius: radius.xl},
  heroLabel: {color: colors.onPrimary, opacity: 0.85},
  code: {color: colors.onPrimary, fontWeight: '800', letterSpacing: 2, marginTop: spacing.xs},
  link: {color: colors.onPrimary, opacity: 0.85, marginTop: spacing.xs},
  share: {marginTop: spacing.md, alignSelf: 'flex-start'},
  stats: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md},
  stat: {flex: 1, backgroundColor: colors.surface},
  statValue: {color: colors.primary, fontWeight: '800'},
  muted: {color: colors.muted},
  heading: {marginTop: spacing.lg, marginBottom: spacing.xs, fontWeight: '700'},
  points: {alignSelf: 'center', color: colors.success, fontWeight: '700'},
});
