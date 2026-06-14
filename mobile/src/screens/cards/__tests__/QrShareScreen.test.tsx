import React from 'react';
import Share from 'react-native-share';
import {fireEvent, renderWithProviders, screen, waitFor} from '@/test-utils/render';
import {QrShareScreen} from '@/screens/cards/QrShareScreen';
import {Card} from '@/types';

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: {open: jest.fn()},
}));

// Render-free QR stub that hands back a ref whose toDataURL yields fixed base64.
jest.mock('react-native-qrcode-svg', () => ({
  __esModule: true,
  default: ({getRef}: {getRef?: (c: unknown) => void}) => {
    getRef?.({toDataURL: (cb: (d: string) => void) => cb('BASE64DATA')});
    return null;
  },
}));

const shareOpen = Share.open as jest.Mock;

const card = {
  id: 1,
  slug: 'jane',
  full_name: 'Jane Doe',
  public_url: 'https://dcard.test/jane',
  qr_url: 'https://dcard.test/jane/qr',
  is_published: true,
  is_default: false,
  views_count: 0,
} as Card;

function setup() {
  renderWithProviders(
    <QrShareScreen
      navigation={{} as never}
      route={{key: 'QrShare', name: 'QrShare', params: {card}} as never}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  shareOpen.mockResolvedValue(undefined);
});

describe('QrShareScreen', () => {
  it('shows the card name and public URL', () => {
    setup();
    expect(screen.getByText('Jane Doe')).toBeOnTheScreen();
    expect(screen.getByText('https://dcard.test/jane')).toBeOnTheScreen();
  });

  it('shares the public link', async () => {
    setup();
    fireEvent.press(screen.getByText('Share link'));

    await waitFor(() => expect(shareOpen).toHaveBeenCalledTimes(1));
    expect(shareOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://dcard.test/jane',
        message: expect.stringContaining('https://dcard.test/jane'),
      }),
    );
  });

  it('shares the QR as a base64 PNG via the svg ref', async () => {
    setup();
    fireEvent.press(screen.getByText('Share QR'));

    await waitFor(() => expect(shareOpen).toHaveBeenCalledTimes(1));
    expect(shareOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'data:image/png;base64,BASE64DATA',
        type: 'image/png',
        filename: 'card-jane',
      }),
    );
  });

  it('swallows a share cancellation without throwing', async () => {
    shareOpen.mockRejectedValue(new Error('cancelled'));
    setup();

    expect(() => fireEvent.press(screen.getByText('Share link'))).not.toThrow();
    await waitFor(() => expect(shareOpen).toHaveBeenCalled());
  });
});
