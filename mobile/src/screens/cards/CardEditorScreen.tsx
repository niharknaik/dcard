import React, {useCallback, useEffect, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {Button, Divider, IconButton, List, Snackbar, Text, TextInput} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {CardsStackParamList} from '@/navigation/types';
import {CardInput, cardsApi} from '@/api/cards.api';
import {apiErrorMessage} from '@/api/client';
import {Card, SocialLink} from '@/types';
import {colors, spacing} from '@/theme';

type Props = NativeStackScreenProps<CardsStackParamList, 'CardEditor'>;

const EMPTY: CardInput = {full_name: ''};

export function CardEditorScreen({route, navigation}: Props) {
  const cardId = route.params?.cardId;
  const isEdit = !!cardId;

  const [form, setForm] = useState<CardInput>(EMPTY);
  const [card, setCard] = useState<Card | null>(null);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  const set = (key: keyof CardInput) => (value: string) => setForm(prev => ({...prev, [key]: value}));

  const load = useCallback(async () => {
    if (!cardId) {
      return;
    }
    setLoading(true);
    try {
      const data = await cardsApi.get(cardId);
      setCard(data);
      setLinks(data.social_links ?? []);
      setForm({
        full_name: data.full_name,
        designation: data.designation ?? '',
        company: data.company ?? '',
        phone: data.phone ?? '',
        whatsapp: data.whatsapp ?? '',
        email: data.email ?? '',
        website: data.website ?? '',
        address: data.address ?? '',
        about: data.about ?? '',
      });
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    load();
  }, [load]);

  const onSave = async () => {
    setSaving(true);
    try {
      if (isEdit && cardId) {
        await cardsApi.update(cardId, form);
        setSnack('Card updated.');
      } else {
        const created = await cardsApi.create(form);
        setCard(created);
        navigation.setParams({cardId: created.id});
        setSnack('Card created.');
      }
    } catch (e) {
      setSnack(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    if (!cardId) {
      return;
    }
    Alert.alert('Delete card', 'This action cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await cardsApi.remove(cardId);
          navigation.goBack();
        },
      },
    ]);
  };

  const onDuplicate = async () => {
    if (!cardId) {
      return;
    }
    try {
      const copy = await cardsApi.duplicate(cardId);
      navigation.replace('CardEditor', {cardId: copy.id});
    } catch (e) {
      setSnack(apiErrorMessage(e));
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <Text>Loading…</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <TextInput label="Full name *" value={form.full_name} onChangeText={set('full_name')} mode="outlined" style={styles.input} />
      <TextInput label="Designation" value={form.designation} onChangeText={set('designation')} mode="outlined" style={styles.input} />
      <TextInput label="Company" value={form.company} onChangeText={set('company')} mode="outlined" style={styles.input} />
      <TextInput label="Phone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" mode="outlined" style={styles.input} />
      <TextInput label="WhatsApp" value={form.whatsapp} onChangeText={set('whatsapp')} keyboardType="phone-pad" mode="outlined" style={styles.input} />
      <TextInput label="Email" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" mode="outlined" style={styles.input} />
      <TextInput label="Website" value={form.website} onChangeText={set('website')} autoCapitalize="none" mode="outlined" style={styles.input} />
      <TextInput label="Address" value={form.address} onChangeText={set('address')} mode="outlined" style={styles.input} />
      <TextInput label="About" value={form.about} onChangeText={set('about')} mode="outlined" multiline numberOfLines={4} style={styles.input} />

      <Button mode="contained" onPress={onSave} loading={saving} disabled={saving || !form.full_name} style={styles.save}>
        {isEdit ? 'Save changes' : 'Create card'}
      </Button>

      {isEdit && card ? (
        <>
          <View style={styles.actions}>
            <Button mode="outlined" icon="qrcode" onPress={() => navigation.navigate('QrShare', {card})}>
              Share / QR
            </Button>
            <Button mode="outlined" icon="content-copy" onPress={onDuplicate}>
              Duplicate
            </Button>
          </View>

          <Divider style={styles.divider} />
          <Text variant="titleMedium">Social links</Text>
          {links.length === 0 ? <Text style={styles.muted}>No links added.</Text> : null}
          {links.map(link => (
            <List.Item
              key={link.id}
              title={link.platform}
              description={link.url}
              left={props => <List.Icon {...props} icon="link-variant" />}
              right={() => (
                <IconButton
                  icon="delete"
                  onPress={async () => {
                    await cardsApi.removeSocialLink(link.id);
                    setLinks(prev => prev.filter(l => l.id !== link.id));
                  }}
                />
              )}
            />
          ))}

          <Button mode="text" textColor={colors.error} icon="trash-can" onPress={onDelete} style={styles.delete}>
            Delete card
          </Button>
        </>
      ) : null}

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={2500}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  input: {marginBottom: spacing.sm},
  save: {marginTop: spacing.sm},
  actions: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md},
  divider: {marginVertical: spacing.md},
  muted: {color: colors.muted, marginVertical: spacing.sm},
  delete: {marginTop: spacing.lg},
});
