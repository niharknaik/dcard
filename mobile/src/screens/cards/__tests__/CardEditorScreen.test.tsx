import React from 'react';
import {Alert, TextInput as RNTextInput} from 'react-native';
import {fireEvent, renderWithProviders, screen, waitFor} from '@/test-utils/render';
import {CardEditorScreen} from '@/screens/cards/CardEditorScreen';
import {cardsApi} from '@/api/cards.api';
import {Card, SocialLink} from '@/types';

jest.mock('@/api/cards.api', () => ({
  cardsApi: {
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    duplicate: jest.fn(),
    removeSocialLink: jest.fn(),
  },
}));

const cards = cardsApi as jest.Mocked<typeof cardsApi>;

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 5,
    slug: 'jane',
    full_name: 'Jane',
    designation: 'CEO',
    company: 'Acme',
    is_published: true,
    is_default: false,
    views_count: 0,
    public_url: 'https://dcard.test/jane',
    qr_url: 'https://dcard.test/jane/qr',
    social_links: [],
    ...overrides,
  };
}

function navStub() {
  return {navigate: jest.fn(), setParams: jest.fn(), replace: jest.fn(), goBack: jest.fn()};
}

function renderCreate() {
  const navigation = navStub();
  renderWithProviders(
    <CardEditorScreen
      navigation={navigation as never}
      route={{key: 'CardEditor', name: 'CardEditor', params: undefined} as never}
    />,
  );
  return {navigation};
}

async function renderEdit(card = makeCard()) {
  cards.get.mockResolvedValue(card);
  const navigation = navStub();
  renderWithProviders(
    <CardEditorScreen
      navigation={navigation as never}
      route={{key: 'CardEditor', name: 'CardEditor', params: {cardId: card.id}} as never}
    />,
  );
  // Wait for the loader to resolve into the edit form.
  await screen.findByText('Save changes');
  return {navigation, card};
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CardEditorScreen — create mode', () => {
  it('keeps Create disabled until a name is entered, then creates the card', async () => {
    cards.create.mockResolvedValue(makeCard({id: 99, full_name: 'New Card'}));
    const {navigation} = renderCreate();

    // Disabled while full_name is empty.
    fireEvent.press(screen.getByText('Create card'));
    expect(cards.create).not.toHaveBeenCalled();

    const [fullName] = screen.UNSAFE_getAllByType(RNTextInput);
    fireEvent.changeText(fullName, 'New Card');
    fireEvent.press(screen.getByText('Create card'));

    await waitFor(() =>
      expect(cards.create).toHaveBeenCalledWith(expect.objectContaining({full_name: 'New Card'})),
    );
    expect(navigation.setParams).toHaveBeenCalledWith({cardId: 99});
    expect(await screen.findByText('Card created.')).toBeOnTheScreen();
  });
});

describe('CardEditorScreen — edit mode', () => {
  it('loads the card, prefills the form and saves changes', async () => {
    await renderEdit();

    expect(screen.getByDisplayValue('Jane')).toBeOnTheScreen();
    cards.update.mockResolvedValue(makeCard());

    fireEvent.press(screen.getByText('Save changes'));

    await waitFor(() =>
      expect(cards.update).toHaveBeenCalledWith(5, expect.objectContaining({full_name: 'Jane'})),
    );
    expect(await screen.findByText('Card updated.')).toBeOnTheScreen();
  });

  it('confirms via Alert then deletes and navigates back', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    cards.remove.mockResolvedValue(undefined);
    const {navigation} = await renderEdit();

    fireEvent.press(screen.getByText('Delete card'));
    expect(alertSpy).toHaveBeenCalledTimes(1);

    // Invoke the destructive button supplied to Alert.alert.
    const buttons = alertSpy.mock.calls[0][2] as Array<{text?: string; onPress?: () => void}>;
    const del = buttons.find(b => b.text === 'Delete');
    await del?.onPress?.();

    expect(cards.remove).toHaveBeenCalledWith(5);
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });

  it('duplicates the card and replaces the route with the copy', async () => {
    cards.duplicate.mockResolvedValue(makeCard({id: 6}));
    const {navigation} = await renderEdit();

    fireEvent.press(screen.getByText('Duplicate'));

    await waitFor(() => expect(cards.duplicate).toHaveBeenCalledWith(5));
    expect(navigation.replace).toHaveBeenCalledWith('CardEditor', {cardId: 6});
  });

  it('navigates to QR share with the loaded card', async () => {
    const {navigation, card} = await renderEdit();

    fireEvent.press(screen.getByText('Share / QR'));

    expect(navigation.navigate).toHaveBeenCalledWith('QrShare', {card});
  });

  it('removes a social link from the list', async () => {
    const link: SocialLink = {
      id: 11,
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/jane',
      sort_order: 0,
      is_active: true,
    };
    cards.removeSocialLink.mockResolvedValue(undefined);
    await renderEdit(makeCard({social_links: [link]}));

    expect(screen.getByText('LinkedIn')).toBeOnTheScreen();
    // The delete IconButton renders its "delete" icon as text via the stub.
    fireEvent.press(screen.getByText('delete'));

    await waitFor(() => expect(cards.removeSocialLink).toHaveBeenCalledWith(11));
    await waitFor(() => expect(screen.queryByText('LinkedIn')).toBeNull());
  });
});
