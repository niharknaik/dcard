import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius, spacing} from '@/theme';

function initials(name: string): string {
  return name
    .split(' ')
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * A live, realistic preview of how a card looks with a given template — driven
 * by the template's primary colour and layout. Mirrors the web CardPreviewMock.
 */
export function CardPreviewMock({
  color,
  layout,
  name,
  role,
  company,
}: {
  color: string;
  layout?: string;
  name: string;
  role: string;
  company: string;
}) {
  const split = layout === 'split';
  const handle = (company || 'studio').toLowerCase().replace(/[^a-z0-9]/g, '');
  const first = name.split(' ')[0].toLowerCase();

  return (
    <View style={styles.card}>
      <View style={[styles.header, {backgroundColor: color}, split ? styles.headerSplit : styles.headerCentered]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{initials(name)}</Text>
        </View>
        <View style={split ? styles.txtSplit : styles.txtCentered}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>
            {role}
            {company ? ` · ${company}` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {['phone', 'whatsapp', 'email-outline', 'web'].map(n => (
          <View key={n} style={styles.tile}>
            <Icon name={n} size={16} color={color} />
          </View>
        ))}
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>EMAIL</Text>
          <Text style={styles.rowVal}>{first}@{handle}.co</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>WEBSITE</Text>
          <Text style={styles.rowVal}>{handle}.co/{first}</Text>
        </View>
        <View style={[styles.save, {backgroundColor: color}]}>
          <Text style={styles.saveTxt}>Save contact</Text>
          <Icon name="arrow-right" size={14} color="#fff" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 290,
    alignSelf: 'center',
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...{shadowColor: '#0F172A', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: {width: 0, height: 8}, elevation: 5},
  },
  header: {paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: 36},
  headerCentered: {alignItems: 'center'},
  headerSplit: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: {color: '#fff', fontWeight: '800', fontSize: 18},
  txtCentered: {alignItems: 'center', marginTop: spacing.sm},
  txtSplit: {flex: 1},
  name: {color: '#fff', fontWeight: '800', fontSize: 16},
  role: {color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2},
  actions: {flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.md, marginTop: -20},
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...{shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: {width: 0, height: 2}, elevation: 2},
  },
  body: {paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.sm},
  row: {backgroundColor: colors.surfaceAlt, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 6},
  rowLabel: {color: colors.muted, fontSize: 9, letterSpacing: 0.5},
  rowVal: {color: colors.text, fontSize: 12, fontWeight: '600'},
  save: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 10},
  saveTxt: {color: '#fff', fontWeight: '700', fontSize: 12},
});
