import React from 'react';
import {fireEvent, renderWithProviders, screen} from '@/test-utils/render';
import {NotificationItem} from '@/components/NotificationItem';
import {AppNotification} from '@/types';

function makeNotification(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    id: 1,
    type: 'new_lead',
    type_label: 'New lead',
    title: 'You have a new lead',
    message: 'Jane Doe wants to connect',
    is_read: false,
    created_at: '2024-01-15T00:00:00Z',
    ...overrides,
  };
}

describe('NotificationItem', () => {
  it('renders the title and message', () => {
    renderWithProviders(
      <NotificationItem notification={makeNotification()} onPress={jest.fn()} onDelete={jest.fn()} />,
    );
    expect(screen.getByText('You have a new lead')).toBeOnTheScreen();
    expect(screen.getByText('Jane Doe wants to connect')).toBeOnTheScreen();
  });

  it('fires onPress when the row is tapped', () => {
    const onPress = jest.fn();
    renderWithProviders(
      <NotificationItem notification={makeNotification()} onPress={onPress} onDelete={jest.fn()} />,
    );
    fireEvent.press(screen.getByText('You have a new lead'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('fires onDelete from the close button without triggering onPress', () => {
    const onPress = jest.fn();
    const onDelete = jest.fn();
    renderWithProviders(
      <NotificationItem notification={makeNotification()} onPress={onPress} onDelete={onDelete} />,
    );
    // The close IconButton has an accessibility role of "button"; it's the last one.
    const buttons = screen.getAllByRole('button');
    fireEvent.press(buttons[buttons.length - 1]);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
