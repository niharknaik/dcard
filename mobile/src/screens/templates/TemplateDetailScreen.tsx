import React, {useCallback, useEffect, useState} from 'react';
import {Image, Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, Chip, Dialog, List, Portal, Snackbar, Text} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MarketplaceStackParamList} from '@/navigation/types';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {CardPreviewMock} from '@/components/CardPreviewMock';
import {templatesApi} from '@/api/templates.api';
import {cardsApi} from '@/api/cards.api';
import {apiErrorMessage} from '@/api/client';
import {CheckoutCancelled, unlockTemplate} from '@/services/checkout';
import {useAuthStore} from '@/store/auth.store';
import {Card, Template, TemplateUnlockMethod} from '@/types';
import {colors, radius, spacing} from '@/theme';

type Props = NativeStackScreenProps<MarketplaceStackParamList, 'TemplateDetail'>;

const SAMPLE_PROFILES = [
  {name: 'Aarav Mehta', role: 'Product Designer', company: 'Lumen'},
  {name: 'Sara Khan', role: 'Marketing Lead', company: 'Vertex'},
  {name: 'Daniel Osei', role: 'Founder', company: 'Cobalt'},
  {name: 'Priya Nair', role: 'Photographer', company: 'Studio Nair'},
  {name: 'Leo Martin', role: 'Consultant', company: 'Meridian'},
];

const COLOR_PRESETS = ['#6366F1', '#0EA5E9', '#10B981', '#F97316', '#E11D48', '#8B5CF6', '#0F172A', '#D946EF'];

export function TemplateDetailScreen({route}: Props) {
  const {templateId} = route.params;
  const user = useAuthStore(s => s.user);

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [snack, setSnack] = useState('');

  const [pickerOpen, setPickerOpen] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [color, setColor] = useState<string | null>(null);
  const [sample] = useState(() => SAMPLE_PROFILES[Math.floor(Math.random() * SAMPLE_PROFILES.length)]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTemplate(await templatesApi.get(templateId));
    } catch (e) {
      setSnack(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    load();
  }, [load]);

  const onUnlock = async (method: TemplateUnlockMethod) => {
    if (!template) return;
    setBusy(true);
    try {
      await unlockTemplate(template, method, user);
      setSnack('Template unlocked!');
      await load();
    } catch (e) {
      if (!(e instanceof CheckoutCancelled)) {
        setSnack(apiErrorMessage(e));
      }
    } finally {
      setBusy(false);
    }
  };

  const openCardPicker = async () => {
    try {
      setCards(await cardsApi.list());
      setPickerOpen(true);
    } catch (e) {
      setSnack(apiErrorMessage(e));
    }
  };

  const applyToCard = async (cardId: number) => {
    if (!template) return;
    setPickerOpen(false);
    setBusy(true);
    try {
      await templatesApi.apply(template.id, cardId, activeColor);
      setSnack('Template applied to your card.');
    } catch (e) {
      setSnack(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading || !template) {
    return (
      <ScreenContainer>
        <ActivityIndicator style={{marginTop: spacing.xl}} color={colors.primary} />
      </ScreenContainer>
    );
  }

  const activeColor = color ?? template.color_scheme ?? colors.primary;
  const gallery = template.preview_images ?? [];
  const swatches = Array.from(new Set([template.color_scheme || colors.primary, ...COLOR_PRESETS]));

  return (
    <ScreenContainer>
      {/* Live preview of how the card will look */}
      <Text variant="labelLarge" style={styles.sectionLabel}>
        Live preview · sample card
      </Text>
      <CardPreviewMock
        color={activeColor}
        layout={template.layout}
        name={sample.name}
        role={sample.role}
        company={sample.company}
      />

      {/* Colour customisation */}
      <Text variant="labelLarge" style={styles.sectionLabel}>
        Customise colour
      </Text>
      <View style={styles.swatches}>
        {swatches.map(c => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            style={[
              styles.swatch,
              {backgroundColor: c},
              activeColor.toLowerCase() === c.toLowerCase() && styles.swatchActive,
            ]}
          />
        ))}
      </View>

      {/* Uploaded template gallery */}
      {gallery.length > 0 ? (
        <>
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Template gallery
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previews}>
            {gallery.map((uri, i) => (
              <Image key={i} source={{uri}} style={styles.preview} />
            ))}
          </ScrollView>
        </>
      ) : null}

      <Text variant="headlineSmall" style={styles.title}>
        {template.name}
      </Text>
      {template.category ? <Chip style={styles.cat}>{template.category.name}</Chip> : null}

      {template.description ? (
        <Text variant="bodyMedium" style={styles.desc}>
          {template.description}
        </Text>
      ) : null}

      <View style={styles.tags}>
        {template.has_portfolio ? <Chip compact style={styles.tag}>Portfolio</Chip> : null}
        {template.has_contact ? <Chip compact style={styles.tag}>Contact</Chip> : null}
        {template.has_social ? <Chip compact style={styles.tag}>Social</Chip> : null}
        <Chip compact style={styles.tag}>{template.layout}</Chip>
      </View>

      <View style={styles.actions}>
        {template.is_unlocked ? (
          <Button mode="contained" icon="check-decagram" loading={busy} disabled={busy} onPress={openCardPicker}>
            Apply to a card
          </Button>
        ) : template.is_free ? (
          <Button mode="contained" loading={busy} disabled={busy} onPress={() => onUnlock('free')}>
            Unlock for free
          </Button>
        ) : (
          <>
            {template.price_points > 0 ? (
              <Button mode="contained" icon="star-four-points" loading={busy} disabled={busy} onPress={() => onUnlock('points')}>
                Unlock with {template.price_points} points
              </Button>
            ) : null}
            {template.price > 0 ? (
              <Button mode="contained-tonal" icon="credit-card" loading={busy} disabled={busy} onPress={() => onUnlock('money')}>
                Buy for ₹{template.price}
              </Button>
            ) : null}
            {template.price > 0 && template.price_points > 0 ? (
              <Button mode="outlined" loading={busy} disabled={busy} onPress={() => onUnlock('mixed')}>
                Pay with money + points
              </Button>
            ) : null}
          </>
        )}
      </View>

      <Portal>
        <Dialog visible={pickerOpen} onDismiss={() => setPickerOpen(false)}>
          <Dialog.Title>Apply to which card?</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              {cards.length === 0 ? (
                <Text style={styles.muted}>You have no cards yet. Create one first.</Text>
              ) : (
                cards.map(card => (
                  <List.Item
                    key={card.id}
                    title={card.full_name}
                    description={card.designation ?? undefined}
                    left={props => <List.Icon {...props} icon="card-account-details" />}
                    onPress={() => applyToCard(card.id)}
                  />
                ))
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setPickerOpen(false)}>Close</Button>
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
  sectionLabel: {color: colors.muted, marginTop: spacing.lg, marginBottom: spacing.sm},
  swatches: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm},
  swatch: {width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent'},
  swatchActive: {borderColor: colors.text},
  previews: {marginBottom: spacing.sm},
  preview: {width: 200, height: 280, borderRadius: radius.lg, marginRight: spacing.sm, backgroundColor: colors.surfaceAlt},
  title: {fontWeight: '700', marginTop: spacing.lg},
  cat: {alignSelf: 'flex-start', marginTop: spacing.xs, marginBottom: spacing.sm},
  desc: {color: colors.textSecondary, marginBottom: spacing.md},
  tags: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg},
  tag: {backgroundColor: colors.surfaceAlt},
  actions: {gap: spacing.sm},
  muted: {color: colors.muted, padding: spacing.md},
});
