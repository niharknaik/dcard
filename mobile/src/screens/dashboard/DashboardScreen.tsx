import React, {useCallback, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Card as PaperCard, Text} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {AdSlot} from '@/components/ads/AdSlot';
import {analyticsApi} from '@/api/analytics.api';
import {cardsApi} from '@/api/cards.api';
import {useAuthStore} from '@/store/auth.store';
import {AnalyticsSummary} from '@/types';
import {colors, spacing} from '@/theme';

function StatCard({label, value}: {label: string; value: number | string}) {
  return (
    <PaperCard style={styles.stat} mode="elevated">
      <PaperCard.Content>
        <Text variant="headlineSmall" style={styles.statValue}>
          {value}
        </Text>
        <Text variant="bodySmall" style={styles.statLabel}>
          {label}
        </Text>
      </PaperCard.Content>
    </PaperCard>
  );
}

export function DashboardScreen() {
  const user = useAuthStore(s => s.user);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [cardCount, setCardCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [analytics, cards] = await Promise.all([analyticsApi.summary('daily'), cardsApi.list()]);
      setSummary(analytics);
      setCardCount(cards.length);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const totals = summary?.totals;

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={load}>
      <Text variant="headlineSmall" style={styles.greeting}>
        Hi, {user?.name?.split(' ')[0] ?? 'there'} 👋
      </Text>
      <Text variant="bodyMedium" style={styles.muted}>
        Here's how your cards are performing.
      </Text>

      <AdSlot placement="dashboard_top" />

      <View style={styles.grid}>
        <StatCard label="Cards" value={cardCount} />
        <StatCard label="Views (30d)" value={totals?.views ?? 0} />
        <StatCard label="Unique visitors" value={totals?.unique_visitors ?? 0} />
        <StatCard label="QR scans" value={totals?.qr_scans ?? 0} />
        <StatCard label="Link clicks" value={totals?.link_clicks ?? 0} />
        <StatCard label="Contact saves" value={totals?.contact_saves ?? 0} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greeting: {color: colors.text, fontWeight: '700'},
  muted: {color: colors.muted, marginBottom: spacing.md},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  stat: {flexBasis: '48%', flexGrow: 1, backgroundColor: colors.surface},
  statValue: {color: colors.primary, fontWeight: '700'},
  statLabel: {color: colors.muted},
});
