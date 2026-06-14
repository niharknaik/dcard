import React, {useCallback, useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {Card as PaperCard, Chip, Searchbar, Text} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {EmptyState} from '@/components/ui/EmptyState';
import {AdSlot} from '@/components/ads/AdSlot';
import {leadsApi} from '@/api/leads.api';
import {Lead} from '@/types';
import {colors, spacing} from '@/theme';
import {formatDate} from '@/utils/format';

export function LeadListScreen() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (term?: string) => {
    setRefreshing(true);
    try {
      setLeads(await leadsApi.list(term ? {search: term} : undefined));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onMarkRead = async (lead: Lead) => {
    if (lead.is_read) {
      return;
    }
    await leadsApi.markRead(lead.id);
    setLeads(prev => prev.map(l => (l.id === lead.id ? {...l, is_read: true} : l)));
  };

  return (
    <ScreenContainer scroll={false} style={styles.container}>
      <Searchbar
        placeholder="Search leads"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => load(search)}
        onClearIconPress={() => load()}
        style={styles.search}
      />
      <AdSlot placement="leads_top" style={styles.ad} />
      <FlatList
        data={leads}
        keyExtractor={item => String(item.id)}
        refreshing={refreshing}
        onRefresh={() => load(search)}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <PaperCard style={styles.card} mode="elevated" onPress={() => onMarkRead(item)}>
            <PaperCard.Content>
              <Text variant="titleMedium">{item.name}</Text>
              {item.email ? <Text style={styles.muted}>{item.email}</Text> : null}
              {item.phone ? <Text style={styles.muted}>{item.phone}</Text> : null}
              {item.message ? <Text style={styles.message}>{item.message}</Text> : null}
              <Text variant="labelSmall" style={styles.date}>
                {item.card?.full_name} · {formatDate(item.created_at)}
              </Text>
              {!item.is_read ? (
                <Chip compact icon="circle" style={styles.newChip} textStyle={styles.newChipText}>
                  New
                </Chip>
              ) : null}
            </PaperCard.Content>
          </PaperCard>
        )}
        ListEmptyComponent={
          !refreshing ? <EmptyState icon="inbox-arrow-down" title="No leads yet" subtitle="Leads from your cards appear here." /> : null
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {padding: 0},
  search: {margin: spacing.md},
  ad: {marginHorizontal: spacing.md},
  list: {paddingHorizontal: spacing.md, flexGrow: 1},
  card: {marginBottom: spacing.sm, backgroundColor: colors.surface},
  muted: {color: colors.muted},
  message: {marginTop: spacing.xs},
  date: {color: colors.muted, marginTop: spacing.xs},
  newChip: {alignSelf: 'flex-start', marginTop: spacing.sm, backgroundColor: colors.primaryContainer},
  newChipText: {color: colors.primary},
});
