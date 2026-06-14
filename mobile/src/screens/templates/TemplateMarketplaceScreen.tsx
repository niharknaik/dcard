import React, {useCallback, useState} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Card as PaperCard, Chip, Text} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MarketplaceStackParamList} from '@/navigation/types';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {EmptyState} from '@/components/ui/EmptyState';
import {templatesApi} from '@/api/templates.api';
import {Template, TemplateCategory} from '@/types';
import {colors, radius, spacing} from '@/theme';

type Props = NativeStackScreenProps<MarketplaceStackParamList, 'TemplateMarketplace'>;

function priceLabel(t: Template): string {
  if (t.is_unlocked) return 'Unlocked';
  if (t.is_free) return 'Free';
  const parts: string[] = [];
  if (t.price > 0) parts.push(`₹${t.price}`);
  if (t.price_points > 0) parts.push(`${t.price_points} pts`);
  return parts.join('  ·  ') || 'Free';
}

export function TemplateMarketplaceScreen({navigation}: Props) {
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [cats, list] = await Promise.all([
        templatesApi.categories(),
        templatesApi.list(activeCategory ? {category_id: activeCategory} : {}),
      ]);
      setCategories(cats);
      setTemplates(list);
    } finally {
      setRefreshing(false);
    }
  }, [activeCategory]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <ScreenContainer scroll={false} style={styles.container}>
      <FlatList
        data={templates}
        keyExtractor={item => String(item.id)}
        refreshing={refreshing}
        onRefresh={load}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.filters}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={[{id: 0, name: 'All'} as TemplateCategory, ...categories]}
              keyExtractor={item => String(item.id)}
              contentContainerStyle={styles.chips}
              renderItem={({item}) => {
                const selected = item.id === 0 ? activeCategory === null : activeCategory === item.id;
                return (
                  <Chip
                    selected={selected}
                    onPress={() => setActiveCategory(item.id === 0 ? null : item.id)}
                    style={[styles.chip, selected && styles.chipSelected]}>
                    {item.name}
                  </Chip>
                );
              }}
            />
          </View>
        }
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.cardWrap}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('TemplateDetail', {templateId: item.id})}>
            <PaperCard mode="elevated" style={styles.card}>
              {item.thumbnail ? (
                <PaperCard.Cover source={{uri: item.thumbnail}} style={styles.cover} />
              ) : (
                <View style={[styles.cover, styles.coverFallback, {backgroundColor: item.color_scheme || colors.primary}]}>
                  <Text style={styles.coverInitial}>{item.name.charAt(0)}</Text>
                </View>
              )}
              <PaperCard.Content style={styles.cardContent}>
                <Text variant="titleSmall" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text
                  variant="bodySmall"
                  style={[styles.price, item.is_unlocked && styles.unlocked]}>
                  {priceLabel(item)}
                </Text>
              </PaperCard.Content>
            </PaperCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !refreshing ? (
            <EmptyState icon="palette-swatch" title="No templates" subtitle="Check back soon for new designs." />
          ) : null
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {padding: 0},
  list: {padding: spacing.md, flexGrow: 1},
  row: {gap: spacing.sm},
  filters: {marginBottom: spacing.sm},
  chips: {gap: spacing.xs, paddingVertical: spacing.xs},
  chip: {backgroundColor: colors.surface},
  chipSelected: {backgroundColor: colors.primaryContainer},
  cardWrap: {flex: 1, marginBottom: spacing.sm},
  card: {backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden'},
  cover: {height: 130},
  coverFallback: {alignItems: 'center', justifyContent: 'center'},
  coverInitial: {color: colors.onPrimary, fontSize: 40, fontWeight: '800'},
  cardContent: {paddingVertical: spacing.sm},
  price: {color: colors.muted, marginTop: 2},
  unlocked: {color: colors.success, fontWeight: '700'},
});
