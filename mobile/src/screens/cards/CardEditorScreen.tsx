import React, {useCallback, useEffect, useState} from 'react';
import {Alert, Image, StyleSheet, View} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {Button, Divider, IconButton, List, Menu, Snackbar, Text, TextInput} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScreenContainer} from '@/components/ui/ScreenContainer';
import {CardsStackParamList} from '@/navigation/types';
import {CardInput, cardsApi} from '@/api/cards.api';
import {apiErrorMessage} from '@/api/client';
import {Card, Service, SocialLink} from '@/types';
import {colors, spacing} from '@/theme';

type Props = NativeStackScreenProps<CardsStackParamList, 'CardEditor'>;

const EMPTY: CardInput = {full_name: ''};

// Must match the backend SocialPlatform enum (App\Enums\SocialPlatform).
const PLATFORMS = ['whatsapp', 'instagram', 'facebook', 'linkedin', 'youtube', 'x', 'telegram', 'github'];

export function CardEditorScreen({route, navigation}: Props) {
  const cardId = route.params?.cardId;
  const isEdit = !!cardId;

  const [form, setForm] = useState<CardInput>(EMPTY);
  const [card, setCard] = useState<Card | null>(null);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState('');

  // Add-social-link form state.
  const [platform, setPlatform] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [platformMenu, setPlatformMenu] = useState(false);
  const [addingLink, setAddingLink] = useState(false);

  // Add-service form state.
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [addingService, setAddingService] = useState(false);

  // Image upload state ('profile_photo' | 'banner' while that upload runs).
  const [uploading, setUploading] = useState<'profile_photo' | 'banner' | null>(null);

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
      try {
        setServices(await cardsApi.listServices(cardId));
      } catch {
        setServices(data.services ?? []);
      }
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

  const onAddLink = async () => {
    if (!cardId || !platform || !linkUrl.trim()) {
      setSnack('Pick a platform and enter a URL.');
      return;
    }
    setAddingLink(true);
    try {
      const link = await cardsApi.addSocialLink(cardId, {platform, url: linkUrl.trim()});
      setLinks(prev => [...prev, link]);
      setPlatform('');
      setLinkUrl('');
    } catch (e) {
      setSnack(apiErrorMessage(e));
    } finally {
      setAddingLink(false);
    }
  };

  const onAddService = async () => {
    if (!cardId || !serviceName.trim()) {
      setSnack('Enter a service name.');
      return;
    }
    setAddingService(true);
    try {
      const payload: {name: string; price?: number} = {name: serviceName.trim()};
      const priceNum = parseFloat(servicePrice);
      if (!Number.isNaN(priceNum)) {
        payload.price = priceNum;
      }
      const svc = await cardsApi.addService(cardId, payload);
      setServices(prev => [...prev, svc]);
      setServiceName('');
      setServicePrice('');
    } catch (e) {
      setSnack(apiErrorMessage(e));
    } finally {
      setAddingService(false);
    }
  };

  const pickAndUpload = async (field: 'profile_photo' | 'banner') => {
    if (!cardId) {
      return;
    }
    const res = await launchImageLibrary({mediaType: 'photo', quality: 0.8, selectionLimit: 1});
    const asset = res.assets?.[0];
    if (res.didCancel || !asset?.uri) {
      return;
    }
    setUploading(field);
    try {
      const updated = await cardsApi.uploadImages(cardId, {
        [field]: {uri: asset.uri, fileName: asset.fileName, type: asset.type},
      });
      setCard(updated);
      setSnack(field === 'banner' ? 'Banner updated.' : 'Profile photo updated.');
    } catch (e) {
      setSnack(apiErrorMessage(e));
    } finally {
      setUploading(null);
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
          <Text variant="titleMedium">Photos</Text>
          <View style={styles.photoRow}>
            <View style={styles.photoCol}>
              <Text style={styles.muted}>Profile photo</Text>
              {card.profile_photo ? (
                <Image source={{uri: card.profile_photo}} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.placeholder]} />
              )}
              <Button
                mode="outlined"
                icon="camera"
                onPress={() => pickAndUpload('profile_photo')}
                loading={uploading === 'profile_photo'}
                disabled={!!uploading}>
                Choose
              </Button>
            </View>
            <View style={styles.photoCol}>
              <Text style={styles.muted}>Banner</Text>
              {card.banner ? (
                <Image source={{uri: card.banner}} style={styles.banner} />
              ) : (
                <View style={[styles.banner, styles.placeholder]} />
              )}
              <Button
                mode="outlined"
                icon="image"
                onPress={() => pickAndUpload('banner')}
                loading={uploading === 'banner'}
                disabled={!!uploading}>
                Choose
              </Button>
            </View>
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
          <View style={styles.addRow}>
            <Menu
              visible={platformMenu}
              onDismiss={() => setPlatformMenu(false)}
              anchor={
                <Button mode="outlined" onPress={() => setPlatformMenu(true)} style={styles.platformBtn}>
                  {platform || 'Platform'}
                </Button>
              }>
              {PLATFORMS.map(p => (
                <Menu.Item
                  key={p}
                  title={p}
                  onPress={() => {
                    setPlatform(p);
                    setPlatformMenu(false);
                  }}
                />
              ))}
            </Menu>
            <TextInput
              label="URL"
              value={linkUrl}
              onChangeText={setLinkUrl}
              autoCapitalize="none"
              keyboardType="url"
              mode="outlined"
              style={styles.flex}
            />
          </View>
          <Button mode="contained-tonal" icon="plus" onPress={onAddLink} loading={addingLink} disabled={addingLink} style={styles.addBtn}>
            Add social link
          </Button>

          <Divider style={styles.divider} />
          <Text variant="titleMedium">Services</Text>
          {services.length === 0 ? <Text style={styles.muted}>No services added.</Text> : null}
          {services.map(svc => (
            <List.Item
              key={svc.id}
              title={svc.name}
              description={svc.price != null ? `₹${svc.price}` : undefined}
              left={props => <List.Icon {...props} icon="briefcase-outline" />}
              right={() => (
                <IconButton
                  icon="delete"
                  onPress={async () => {
                    await cardsApi.removeService(svc.id);
                    setServices(prev => prev.filter(s => s.id !== svc.id));
                  }}
                />
              )}
            />
          ))}
          <View style={styles.addRow}>
            <TextInput label="Service name" value={serviceName} onChangeText={setServiceName} mode="outlined" style={styles.flex} />
            <TextInput label="Price" value={servicePrice} onChangeText={setServicePrice} keyboardType="numeric" mode="outlined" style={styles.priceInput} />
          </View>
          <Button mode="contained-tonal" icon="plus" onPress={onAddService} loading={addingService} disabled={addingService} style={styles.addBtn}>
            Add service
          </Button>

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
  addRow: {flexDirection: 'row', gap: spacing.sm, alignItems: 'center', marginTop: spacing.sm},
  flex: {flex: 1},
  platformBtn: {justifyContent: 'center'},
  priceInput: {width: 110},
  addBtn: {marginTop: spacing.sm, alignSelf: 'flex-start'},
  photoRow: {flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm},
  photoCol: {flex: 1, alignItems: 'center', gap: spacing.sm},
  avatar: {width: 80, height: 80, borderRadius: 40},
  banner: {width: '100%', height: 64, borderRadius: 8},
  placeholder: {backgroundColor: colors.surfaceAlt},
});
