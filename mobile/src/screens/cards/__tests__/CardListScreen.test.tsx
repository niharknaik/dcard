import React from 'react';
import {fireEvent, renderWithProviders, screen, waitFor} from '@/test-utils/render';
import {CardListScreen} from '@/screens/cards/CardListScreen';
import {cardsApi} from '@/api/cards.api';
import {Card} from '@/types';

jest.mock('@/api/cards.api', () => ({
  cardsApi: {
    list: jest.fn(),
  },
}));

// Run the focus effect once on mount, no NavigationContainer required.
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void | (() => void)) => {
    const react = require('react');
    react.useEffect(() => cb(), [cb]);
  },
}));

const cards = cardsApi as jest.Mocked<typeof cardsApi>;

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 1,
    slug: 'alice',
    full_name: 'Alice',
    is_published: true,
    is_default: false,
    views_count: 5,
    public_url: 'https://dcard.test/alice',
    qr_url: 'https://dcard.test/alice/qr',
    ...overrides,
  };
}

function setup() {
  const navigation = {navigate: jest.fn()};
  renderWithProviders(
    <CardListScreen
      navigation={navigation as never}
      route={{key: 'CardList', name: 'CardList'} as never}
    />,
  );
  return {navigation};
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CardListScreen', () => {
  it('shows the empty state when there are no cards', async () => {
    cards.list.mockResolvedValue([]);
    setup();

    expect(await screen.findByText('No cards yet')).toBeOnTheScreen();
    expect(screen.getByText('Create your first digital card.')).toBeOnTheScreen();
  });

  it('renders a row per card', async () => {
    cards.list.mockResolvedValue([
      makeCard({id: 1, full_name: 'Alice'}),
      makeCard({id: 2, full_name: 'Bob', slug: 'bob'}),
    ]);
    setup();

    expect(await screen.findByText('Alice')).toBeOnTheScreen();
    expect(screen.getByText('Bob')).toBeOnTheScreen();
    expect(screen.queryByText('No cards yet')).toBeNull();
  });

  it('opens the editor for a tapped card with its id', async () => {
    cards.list.mockResolvedValue([makeCard({id: 7, full_name: 'Alice'})]);
    const {navigation} = setup();

    fireEvent.press(await screen.findByText('Alice'));

    expect(navigation.navigate).toHaveBeenCalledWith('CardEditor', {cardId: 7});
  });

  it('opens a blank editor from the FAB', async () => {
    cards.list.mockResolvedValue([makeCard({id: 7, full_name: 'Alice'})]);
    const {navigation} = setup();
    await screen.findByText('Alice');

    // The FAB's "plus" icon renders as text via the test icon stub; pressing it
    // bubbles to the FAB's onPress.
    fireEvent.press(screen.getByText('plus'));

    expect(navigation.navigate).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).toHaveBeenCalledWith('CardEditor');
  });
});
