import {create} from 'zustand';
import {adsApi} from '@/api/ads.api';
import {Ad, AdPlacement, AdsPayload} from '@/types';

interface AdsState {
  payload: AdsPayload | null;
  loaded: boolean;
  loading: boolean;
  /** Fetch once per session; safe to call from every AdSlot. */
  ensureLoaded: () => Promise<void>;
  reload: () => Promise<void>;
  adFor: (placement: AdPlacement) => Ad | null;
}

export const useAdsStore = create<AdsState>((set, get) => ({
  payload: null,
  loaded: false,
  loading: false,

  ensureLoaded: async () => {
    if (get().loaded || get().loading) {
      return;
    }
    await get().reload();
  },

  reload: async () => {
    set({loading: true});
    try {
      const payload = await adsApi.get();
      set({payload, loaded: true});
    } catch {
      // Ads are non-critical — never block the UI on a failed fetch.
      set({loaded: true});
    } finally {
      set({loading: false});
    }
  },

  adFor: placement => get().payload?.placements?.[placement] ?? null,
}));
