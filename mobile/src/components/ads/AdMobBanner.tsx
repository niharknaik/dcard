import React from 'react';
import {Platform} from 'react-native';

interface Props {
  androidUnitId?: string | null;
  iosUnitId?: string | null;
}

/**
 * Thin wrapper around react-native-google-mobile-ads' BannerAd. The SDK is
 * loaded lazily so the app (and Jest) keep working when it isn't installed —
 * in that case this renders nothing and the house-ad path remains the default.
 */
export function AdMobBanner({androidUnitId, iosUnitId}: Props) {
  const unitId = Platform.OS === 'ios' ? iosUnitId : androidUnitId;
  if (!unitId) {
    return null;
  }

  let mod: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require('react-native-google-mobile-ads');
  } catch {
    return null;
  }

  const BannerAd = mod?.BannerAd;
  const size = mod?.BannerAdSize?.ANCHORED_ADAPTIVE_BANNER ?? 'ANCHORED_ADAPTIVE_BANNER';
  if (!BannerAd) {
    return null;
  }

  return <BannerAd unitId={unitId} size={size} />;
}
