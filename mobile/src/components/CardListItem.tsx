import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Avatar, Card as PaperCard, Chip, Icon, Text} from 'react-native-paper';
import {colors, radius, spacing} from '@/theme';
import {initials} from '@/utils/format';
import {Card} from '@/types';

interface Props {
  card: Card;
  onPress: () => void;
}

export function CardListItem({card, onPress}: Props) {
  const subtitle = [card.designation, card.company].filter(Boolean).join(' · ') || card.slug;

  return (
    <PaperCard style={styles.card} onPress={onPress} mode="contained">
      <PaperCard.Content style={styles.content}>
        {card.profile_photo ? (
          <Avatar.Image size={52} source={{uri: card.profile_photo}} />
        ) : (
          <Avatar.Text
            size={52}
            label={initials(card.full_name)}
            style={styles.avatar}
            color={colors.primary}
          />
        )}
        <View style={styles.info}>
          <Text variant="titleMedium" numberOfLines={1} style={styles.name}>
            {card.full_name}
          </Text>
          <Text variant="bodySmall" style={styles.muted} numberOfLines={1}>
            {subtitle}
          </Text>
          <View style={styles.meta}>
            <Chip compact icon="eye" style={styles.chip} textStyle={styles.chipText}>
              {card.views_count}
            </Chip>
            {card.is_default ? (
              <Chip compact icon="star" style={styles.chip} textStyle={styles.chipText}>
                Default
              </Chip>
            ) : null}
            {!card.is_published ? (
              <Chip compact icon="eye-off" style={styles.draftChip} textStyle={styles.draftChipText}>
                Draft
              </Chip>
            ) : null}
          </View>
        </View>
        <Icon source="chevron-right" size={22} color={colors.muted} />
      </PaperCard.Content>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs},
  avatar: {backgroundColor: colors.primaryContainer},
  info: {flex: 1, gap: 2},
  name: {color: colors.text},
  muted: {color: colors.muted},
  meta: {flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs},
  chip: {backgroundColor: colors.surfaceAlt},
  chipText: {color: colors.textSecondary},
  draftChip: {backgroundColor: colors.warningContainer},
  draftChipText: {color: colors.warning},
});
