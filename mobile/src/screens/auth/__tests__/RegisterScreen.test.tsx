import React from 'react';
import {TextInput as RNTextInput} from 'react-native';
import {fireEvent, renderWithProviders, screen, waitFor} from '@/test-utils/render';
import {RegisterScreen} from '@/screens/auth/RegisterScreen';

const mockRegister = jest.fn();
jest.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: (s: {register: jest.Mock}) => unknown) =>
    selector({register: mockRegister}),
}));

// The screen fetches consent copy on mount; keep it off the network and let the
// default agreement text render.
jest.mock('@/api/content.api', () => ({
  contentApi: {consent: jest.fn().mockResolvedValue('')},
}));

function setup() {
  const navigation = {navigate: jest.fn()};
  const utils = renderWithProviders(
    <RegisterScreen
      navigation={navigation as never}
      route={{key: 'Register', name: 'Register'} as never}
    />,
  );
  // Paper renders one native TextInput per field, in declaration order.
  const [name, email, phone, password, confirm] = utils.UNSAFE_getAllByType(RNTextInput);
  return {navigation, name, email, phone, password, confirm};
}

// The Sign Up button is disabled until the consent checkbox is ticked.
function acceptConsent() {
  // The checkbox label sits in a no-hide-descendants subtree, so query the
  // pressable checkbox by its accessibility label instead of the visible text.
  fireEvent.press(screen.getByLabelText(/I agree that DCard stores my information/));
}

function fillValidForm(f: ReturnType<typeof setup>) {
  fireEvent.changeText(f.name, '  Jane Doe  ');
  fireEvent.changeText(f.email, '  jane@example.com  ');
  fireEvent.changeText(f.password, 's3cret');
  fireEvent.changeText(f.confirm, 's3cret');
  acceptConsent();
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('RegisterScreen', () => {
  it('renders the title and sign-up action', () => {
    setup();
    expect(screen.getByText('Create your account')).toBeOnTheScreen();
    expect(screen.getByText('Sign Up')).toBeOnTheScreen();
  });

  it('blocks submission and warns when passwords do not match', () => {
    const f = setup();
    fireEvent.changeText(f.password, 's3cret');
    fireEvent.changeText(f.confirm, 'different');
    acceptConsent();
    fireEvent.press(screen.getByText('Sign Up'));

    expect(screen.getByText('Passwords do not match.')).toBeOnTheScreen();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('submits trimmed fields with phone omitted when blank', async () => {
    mockRegister.mockResolvedValue(undefined);
    const f = setup();
    fillValidForm(f);
    fireEvent.press(screen.getByText('Sign Up'));

    await waitFor(() => expect(mockRegister).toHaveBeenCalledTimes(1));
    expect(mockRegister).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: undefined,
      password: 's3cret',
      password_confirmation: 's3cret',
      referral_code: undefined,
      accept_terms: true,
    });
  });

  it('includes the trimmed phone when provided', async () => {
    mockRegister.mockResolvedValue(undefined);
    const f = setup();
    fillValidForm(f);
    fireEvent.changeText(f.phone, '  +91 99999 88888  ');
    fireEvent.press(screen.getByText('Sign Up'));

    await waitFor(() => expect(mockRegister).toHaveBeenCalledTimes(1));
    expect(mockRegister).toHaveBeenCalledWith(
      expect.objectContaining({phone: '+91 99999 88888'}),
    );
  });

  it('shows an error message when registration fails', async () => {
    mockRegister.mockRejectedValue(new Error('nope'));
    const f = setup();
    fillValidForm(f);
    fireEvent.press(screen.getByText('Sign Up'));

    expect(
      await screen.findByText('Something went wrong. Please try again.'),
    ).toBeOnTheScreen();
  });

  it('navigates to Login from the footer link', () => {
    const {navigation} = setup();
    fireEvent.press(screen.getByText('Sign in'));
    expect(navigation.navigate).toHaveBeenCalledWith('Login');
  });
});
