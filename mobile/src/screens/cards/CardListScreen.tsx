import React, {useCallback, useState} from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {FAB} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CardsStackParamList} from '@/navigation/types';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {EmptyState} from '@/components/ui/EmptyState';
import {AdSlot} from '@/components/ads/AdSlot';
import {CardListItem} from '@/components/CardListItem';
import {cardsApi} from '@/api/cards.api';
import {Card} from '@/types';
import {colors, spacing} from '@/theme';

type Props = NativeStackScreenProps<CardsStackParamList, 'CardList'>;

export function CardListScreen({navigation}: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setCards(await cardsApi.list());
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
        data={cards}
        keyExtractor={item => String(item.id)}
        refreshing={refreshing}
        onRefresh={load}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<AdSlot placement="card_list" />}
        renderItem={({item}) => (
          <CardListItem card={item} onPress={() => navigation.navigate('CardEditor', {cardId: item.id})} />
        )}
        ListEmptyComponent={
          !refreshing ? <EmptyState icon="card-account-details" title="No cards yet" subtitle="Create your first digital card." /> : null
        }
      />
      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('CardEditor')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {padding: 0},
  list: {padding: spacing.md, flexGrow: 1},
  fab: {position: 'absolute', right: spacing.md, bottom: spacing.md, backgroundColor: colors.primary},
});
