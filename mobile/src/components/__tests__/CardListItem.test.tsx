import React from 'react';
import {fireEvent, renderWithProviders, screen} from '@/test-utils/render';
import {CardListItem} from '@/components/CardListItem';
import {Card} from '@/types';

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 1,
    slug: 'jane-doe',
    full_name: 'Jane Doe',
    designation: 'CEO',
    company: 'Acme',
    is_published: true,
    is_default: false,
    views_count: 42,
    public_url: 'https://dcard.test/jane-doe',
    qr_url: 'https://dcard.test/jane-doe/qr',
    ...overrides,
  };
}

describe('CardListItem', () => {
  it('shows the name, designation · company, and view count', () => {
    renderWithProviders(<CardListItem card={makeCard()} onPress={jest.fn()} />);
    expect(screen.getByText('Jane Doe')).toBeOnTheScreen();
    expect(screen.getByText('CEO · Acme')).toBeOnTheScreen();
    expect(screen.getByText('42')).toBeOnTheScreen();
  });

  it('falls back to the slug when designation and company are missing', () => {
    renderWithProviders(
      <CardListItem card={makeCard({designation: null, company: null})} onPress={jest.fn()} />,
    );
    expect(screen.getByText('jane-doe')).toBeOnTheScreen();
  });

  it('shows a Draft chip for unpublished cards and a Default chip for the default', () => {
    renderWithProviders(
      <CardListItem card={makeCard({is_published: false, is_default: true})} onPress={jest.fn()} />,
    );
    expect(screen.getByText('Draft')).toBeOnTheScreen();
    expect(screen.getByText('Default')).toBeOnTheScreen();
  });

  it('hides the Draft chip when published', () => {
    renderWithProviders(<CardListItem card={makeCard()} onPress={jest.fn()} />);
    expect(screen.queryByText('Draft')).toBeNull();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    renderWithProviders(<CardListItem card={makeCard()} onPress={onPress} />);
    fireEvent.press(screen.getByText('Jane Doe'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
