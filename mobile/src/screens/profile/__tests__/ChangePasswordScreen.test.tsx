import React from 'react';
import {TextInput as RNTextInput} from 'react-native';
import {fireEvent, renderWithProviders, screen, waitFor} from '@/test-utils/render';
import {ChangePasswordScreen} from '@/screens/profile/ChangePasswordScreen';
import {authApi} from '@/api/auth.api';

jest.mock('@/api/auth.api', () => ({
  authApi: {
    changePassword: jest.fn(),
  },
}));

const auth = authApi as jest.Mocked<typeof authApi>;

function setup() {
  const navigation = {goBack: jest.fn()};
  const utils = renderWithProviders(
    <ChangePasswordScreen
      navigation={navigation as never}
      route={{key: 'ChangePassword', name: 'ChangePassword'} as never}
    />,
  );
  const [current, password, confirm] = utils.UNSAFE_getAllByType(RNTextInput);
  return {navigation, current, password, confirm};
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ChangePasswordScreen', () => {
  it('warns and skips the API when the new passwords do not match', async () => {
    const {current, password, confirm} = setup();

    fireEvent.changeText(current, 'old');
    fireEvent.changeText(password, 'new-pass');
    fireEvent.changeText(confirm, 'different');
    fireEvent.press(screen.getByText('Update password'));

    expect(await screen.findByText('Passwords do not match.')).toBeOnTheScreen();
    expect(auth.changePassword).not.toHaveBeenCalled();
  });

  it('submits the change and navigates back on success', async () => {
    auth.changePassword.mockResolvedValue(undefined);
    const {navigation, current, password, confirm} = setup();

    fireEvent.changeText(current, 'old-pass');
    fireEvent.changeText(password, 'new-pass');
    fireEvent.changeText(confirm, 'new-pass');
    fireEvent.press(screen.getByText('Update password'));

    await waitFor(() =>
      expect(auth.changePassword).toHaveBeenCalledWith({
        current_password: 'old-pass',
        password: 'new-pass',
        password_confirmation: 'new-pass',
      }),
    );
    await waitFor(() => expect(navigation.goBack).toHaveBeenCalledTimes(1));
  });

  it('shows an error in the snackbar and stays on the screen when the API fails', async () => {
    auth.changePassword.mockRejectedValue(new Error('nope'));
    const {navigation, current, password, confirm} = setup();

    fireEvent.changeText(current, 'old-pass');
    fireEvent.changeText(password, 'new-pass');
    fireEvent.changeText(confirm, 'new-pass');
    fireEvent.press(screen.getByText('Update password'));

    expect(
      await screen.findByText('Something went wrong. Please try again.'),
    ).toBeOnTheScreen();
    expect(navigation.goBack).not.toHaveBeenCalled();
  });
});
