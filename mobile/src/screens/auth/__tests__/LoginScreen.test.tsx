import React from 'react';
import {TextInput as RNTextInput} from 'react-native';
import {fireEvent, renderWithProviders, screen, waitFor} from '@/test-utils/render';
import {LoginScreen} from '@/screens/auth/LoginScreen';

// The screen reads only `login` from the store via a selector. Mock the hook so
// it returns our spy regardless of the selector passed.
const mockLogin = jest.fn();
jest.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: (s: {login: jest.Mock}) => unknown) => selector({login: mockLogin}),
}));

function setup() {
  const navigation = {navigate: jest.fn()};
  // route/navigation typing isn't exercised here — cast through unknown.
  const utils = renderWithProviders(
    <LoginScreen navigation={navigation as never} route={{key: 'Login', name: 'Login'} as never} />,
  );
  // Paper renders one native TextInput per field; [email, password].
  const inputs = utils.UNSAFE_getAllByType(RNTextInput);
  return {navigation, emailInput: inputs[0], passwordInput: inputs[1]};
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('LoginScreen', () => {
  it('renders the brand, subtitle and sign-in action', () => {
    setup();
    expect(screen.getByText('DCard')).toBeOnTheScreen();
    expect(screen.getByText('Sign in to manage your digital cards')).toBeOnTheScreen();
    expect(screen.getByText('Sign In')).toBeOnTheScreen();
  });

  it('submits the trimmed email and raw password', async () => {
    mockLogin.mockResolvedValue(undefined);
    const {emailInput, passwordInput} = setup();

    fireEvent.changeText(emailInput, '  jane@example.com  ');
    fireEvent.changeText(passwordInput, 's3cret');
    fireEvent.press(screen.getByText('Sign In'));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));
    expect(mockLogin).toHaveBeenCalledWith('jane@example.com', 's3cret');
  });

  it('shows an error message when login fails', async () => {
    mockLogin.mockRejectedValue(new Error('nope'));
    const {emailInput, passwordInput} = setup();

    fireEvent.changeText(emailInput, 'jane@example.com');
    fireEvent.changeText(passwordInput, 'wrong');
    fireEvent.press(screen.getByText('Sign In'));

    // Non-axios rejection falls through apiErrorMessage to the generic copy.
    expect(await screen.findByText('Something went wrong. Please try again.')).toBeOnTheScreen();
  });

  it('navigates to ForgotPassword and Register', () => {
    const {navigation} = setup();

    fireEvent.press(screen.getByText('Forgot password?'));
    expect(navigation.navigate).toHaveBeenCalledWith('ForgotPassword');

    fireEvent.press(screen.getByText('Create an account'));
    expect(navigation.navigate).toHaveBeenCalledWith('Register');
  });
});
