import React from 'react';
import {Linking} from 'react-native';
import {fireEvent, renderWithProviders, screen} from '@/test-utils/render';
import {AdSlot} from '@/components/ads/AdSlot';
import {adsApi} from '@/api/ads.api';
import {AdsPayload} from '@/types';

jest.mock('@/api/ads.api', () => ({adsApi: {get: jest.fn(), track: jest.fn()}}));

// Override the global "disabled" ads-store mock with a controllable payload.
let mockPayload: AdsPayload | null;
jest.mock('@/store/ads.store', () => ({
  useAdsStore: (selector: (s: {payload: AdsPayload | null; ensureLoaded: () => Promise<void>}) => unknown) =>
    selector({payload: mockPayload, ensureLoaded: () => Promise.resolve()}),
}));

const ads = adsApi as jest.Mocked<typeof adsApi>;

function payload(over: Partial<AdsPayload> = {}): AdsPayload {
  return {
    enabled: true,
    admob: {enabled: false, android_banner_unit_id: null, ios_banner_unit_id: null},
    placements: {dashboard_top: null, card_list: null, leads_top: null, app_footer: null},
    ...over,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  ads.track.mockResolvedValue(undefined);
});

describe('AdSlot', () => {
  it('renders nothing and tracks nothing when ads are disabled', () => {
    mockPayload = payload({enabled: false});
    renderWithProviders(<AdSlot placement="dashboard_top" />);

    expect(screen.queryByLabelText('Promo')).toBeNull();
    expect(ads.track).not.toHaveBeenCalled();
  });

  it('renders nothing when the placement has no ad and AdMob is off', () => {
    mockPayload = payload();
    renderWithProviders(<AdSlot placement="dashboard_top" />);

    expect(ads.track).not.toHaveBeenCalled();
  });

  it('renders a house ad, tracks an impression, then tracks a click and opens the link', () => {
    const linkSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
    mockPayload = payload({
      placements: {
        dashboard_top: {id: 7, title: 'Promo', image: 'https://cdn/banner.png', link: 'https://promo.test'},
        card_list: null,
        leads_top: null,
        app_footer: null,
      },
    });
    renderWithProviders(<AdSlot placement="dashboard_top" />);

    expect(ads.track).toHaveBeenCalledWith(7, 'impression');

    fireEvent.press(screen.getByLabelText('Promo'));

    expect(ads.track).toHaveBeenCalledWith(7, 'click');
    expect(linkSpy).toHaveBeenCalledWith('https://promo.test');
  });

  it('only shows ads for the requested placement', () => {
    mockPayload = payload({
      placements: {
        dashboard_top: {id: 7, title: 'Promo', image: 'https://cdn/banner.png', link: null},
        card_list: null,
        leads_top: null,
        app_footer: null,
      },
    });
    renderWithProviders(<AdSlot placement="card_list" />);

    // No ad configured for card_list → nothing rendered, no impression.
    expect(screen.queryByLabelText('Promo')).toBeNull();
    expect(ads.track).not.toHaveBeenCalled();
  });
});
