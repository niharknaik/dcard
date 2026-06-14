import React from 'react';
import {TextInput as RNTextInput} from 'react-native';
import {fireEvent, renderWithProviders, screen, waitFor} from '@/test-utils/render';
import {EditProfileScreen} from '@/screens/profile/EditProfileScreen';
import {authApi} from '@/api/auth.api';
import {User} from '@/types';

const user: User = {
  id: 1,
  name: 'Jane',
  email: 'jane@example.com',
  phone: '+91 99999 88888',
  status: 'active',
  is_admin: false,
};

const setUser = jest.fn();
jest.mock('@/store/auth.store', () => ({
  useAuthStore: () => ({user: mockUser, setUser: mockSetUser}),
}));
// Re-exported under mock-prefixed names so the factory can reference them.
const mockUser = user;
const mockSetUser = setUser;

jest.mock('@/api/auth.api', () => ({
  authApi: {
    updateProfile: jest.fn(),
  },
}));

const auth = authApi as jest.Mocked<typeof authApi>;

function setup() {
  const navigation = {goBack: jest.fn()};
  const utils = renderWithProviders(
    <EditProfileScreen
      navigation={navigation as never}
      route={{key: 'EditProfile', name: 'EditProfile'} as never}
    />,
  );
  const [name, phone] = utils.UNSAFE_getAllByType(RNTextInput);
  return {navigation, name, phone};
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('EditProfileScreen', () => {
  it('prefills the form from the current user', () => {
    setup();
    expect(screen.getByDisplayValue('Jane')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('+91 99999 88888')).toBeOnTheScreen();
  });

  it('saves trimmed values, updates the store and navigates back', async () => {
    const updated = {...user, name: 'Jane Q'};
    auth.updateProfile.mockResolvedValue(updated);
    const {navigation, name} = setup();

    fireEvent.changeText(name, '  Jane Q  ');
    fireEvent.press(screen.getByText('Save'));

    await waitFor(() =>
      expect(auth.updateProfile).toHaveBeenCalledWith({
        name: 'Jane Q',
        phone: '+91 99999 88888',
      }),
    );
    expect(setUser).toHaveBeenCalledWith(updated);
    await waitFor(() => expect(navigation.goBack).toHaveBeenCalledTimes(1));
  });

  it('shows an error snackbar and stays put when the save fails', async () => {
    auth.updateProfile.mockRejectedValue(new Error('nope'));
    const {navigation} = setup();

    fireEvent.press(screen.getByText('Save'));

    expect(
      await screen.findByText('Something went wrong. Please try again.'),
    ).toBeOnTheScreen();
    expect(setUser).not.toHaveBeenCalled();
    expect(navigation.goBack).not.toHaveBeenCalled();
  });
});
