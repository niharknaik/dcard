import React from 'react';
import {TextInput as RNTextInput} from 'react-native';
import {fireEvent, renderWithProviders, screen, waitFor} from '@/test-utils/render';
import {ForgotPasswordScreen} from '@/screens/auth/ForgotPasswordScreen';
import {authApi} from '@/api/auth.api';

jest.mock('@/api/auth.api', () => ({
  authApi: {
    forgotPassword: jest.fn(),
  },
}));

const auth = authApi as jest.Mocked<typeof authApi>;

function setup() {
  const navigation = {goBack: jest.fn()};
  const utils = renderWithProviders(
    <ForgotPasswordScreen
      navigation={navigation as never}
      route={{key: 'ForgotPassword', name: 'ForgotPassword'} as never}
    />,
  );
  const [email] = utils.UNSAFE_getAllByType(RNTextInput);
  return {navigation, email};
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ForgotPasswordScreen', () => {
  it('renders the heading and submit action', () => {
    setup();
    expect(screen.getByText('Reset password')).toBeOnTheScreen();
    expect(screen.getByText('Send reset link')).toBeOnTheScreen();
  });

  it('submits the trimmed email and shows the API message', async () => {
    auth.forgotPassword.mockResolvedValue('Reset link sent to your inbox.');
    const {email} = setup();

    fireEvent.changeText(email, '  jane@example.com  ');
    fireEvent.press(screen.getByText('Send reset link'));

    await waitFor(() => expect(auth.forgotPassword).toHaveBeenCalledWith('jane@example.com'));
    expect(await screen.findByText('Reset link sent to your inbox.')).toBeOnTheScreen();
  });

  it('falls back to a generic confirmation when the API returns no message', async () => {
    auth.forgotPassword.mockResolvedValue('');
    const {email} = setup();

    fireEvent.changeText(email, 'jane@example.com');
    fireEvent.press(screen.getByText('Send reset link'));

    expect(
      await screen.findByText('If that email exists, a reset link has been sent.'),
    ).toBeOnTheScreen();
  });

  it('shows an error message when the request fails', async () => {
    auth.forgotPassword.mockRejectedValue(new Error('nope'));
    const {email} = setup();

    fireEvent.changeText(email, 'jane@example.com');
    fireEvent.press(screen.getByText('Send reset link'));

    expect(
      await screen.findByText('Something went wrong. Please try again.'),
    ).toBeOnTheScreen();
  });

  it('goes back to sign in', () => {
    const {navigation} = setup();
    fireEvent.press(screen.getByText('Back to sign in'));
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });
});
