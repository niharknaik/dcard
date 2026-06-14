import React from 'react';
import {renderWithProviders, screen} from '@/test-utils/render';
import {EmptyState} from '@/components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders the title', () => {
    renderWithProviders(<EmptyState title="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeOnTheScreen();
  });

  it('renders the subtitle when provided', () => {
    renderWithProviders(<EmptyState title="Empty" subtitle="Add your first card" />);
    expect(screen.getByText('Add your first card')).toBeOnTheScreen();
  });

  it('omits the subtitle when not provided', () => {
    renderWithProviders(<EmptyState title="Empty" />);
    expect(screen.queryByText('Add your first card')).toBeNull();
  });
});
