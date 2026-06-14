import React from 'react';
import {fireEvent, renderWithProviders, screen} from '@/test-utils/render';
import {ProfileScreen} from '@/screens/profile/ProfileScreen';
import {User} from '@/types';

const user: User = {
  id: 1,
  name: 'Jane Doe',
  email: 'jane@example.com',
  status: 'active',
  is_admin: false,
};

const mockLogout = jest.fn();
const mockUser = user;
jest.mock('@/store/auth.store', () => ({
  useAuthStore: () => ({user: mockUser, logout: mockLogout}),
}));

function setup() {
  const navigation = {navigate: jest.fn()};
  renderWithProviders(
    <ProfileScreen
      navigation={navigation as never}
      route={{key: 'ProfileHome', name: 'ProfileHome'} as never}
    />,
  );
  return {navigation};
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ProfileScreen', () => {
  it('shows the current user name and email', () => {
    setup();
    expect(screen.getByText('Jane Doe')).toBeOnTheScreen();
    expect(screen.getByText('jane@example.com')).toBeOnTheScreen();
  });

  it('navigates from each list item to its destination', () => {
    const {navigation} = setup();

    fireEvent.press(screen.getByText('Edit profile'));
    expect(navigation.navigate).toHaveBeenCalledWith('EditProfile');

    fireEvent.press(screen.getByText('Change password'));
    expect(navigation.navigate).toHaveBeenCalledWith('ChangePassword');

    fireEvent.press(screen.getByText('Subscription plans'));
    expect(navigation.navigate).toHaveBeenCalledWith('Plans');

    fireEvent.press(screen.getByText('Payment history'));
    expect(navigation.navigate).toHaveBeenCalledWith('PaymentHistory');
  });

  it('logs out when the log out button is pressed', () => {
    setup();
    fireEvent.press(screen.getByText('Log out'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
