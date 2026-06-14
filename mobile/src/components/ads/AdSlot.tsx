import React, {useEffect, useRef} from 'react';
import {Image, Linking, Pressable, StyleSheet, View, ViewStyle} from 'react-native';
import {adsApi} from '@/api/ads.api';
import {useAdsStore} from '@/store/ads.store';
import {Ad, AdPlacement} from '@/types';
import {colors, radius, spacing} from '@/theme';
import {AdMobBanner} from './AdMobBanner';

interface Props {
  placement: AdPlacement;
  style?: ViewStyle;
}

/**
 * Renders the admin-controlled ad for a placement: a house ad if one exists,
 * otherwise an AdMob banner (fallback), otherwise nothing. Hidden entirely when
 * ads are disabled or the user is on a paid plan (decided server-side).
 */
export function AdSlot({placement, style}: Props) {
  const ensureLoaded = useAdsStore(s => s.ensureLoaded);
  const payload = useAdsStore(s => s.payload);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  if (!payload?.enabled) {
    return null;
  }

  const ad = payload.placements?.[placement] ?? null;
  if (ad) {
    return <HouseAd ad={ad} style={style} />;
  }

  if (payload.admob.enabled) {
    return (
      <View style={[styles.wrap, style]}>
        <AdMobBanner
          androidUnitId={payload.admob.android_banner_unit_id}
          iosUnitId={payload.admob.ios_banner_unit_id}
        />
      </View>
    );
  }

  return null;
}

function HouseAd({ad, style}: {ad: Ad; style?: ViewStyle}) {
  const trackedId = useRef<number | null>(null);

  useEffect(() => {
    if (trackedId.current !== ad.id) {
      trackedId.current = ad.id;
      adsApi.track(ad.id, 'impression').catch(() => {});
    }
  }, [ad.id]);

  if (!ad.image) {
    return null;
  }

  const onPress = () => {
    adsApi.track(ad.id, 'click').catch(() => {});
    if (ad.link) {
      Linking.openURL(ad.link).catch(() => {});
    }
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={ad.title}
      style={[styles.wrap, style]}>
      <Image source={{uri: ad.image}} style={styles.image} resizeMode="cover" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  image: {width: '100%', height: 96},
});
