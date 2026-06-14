import {authApi} from '@/api/auth.api';
import {api} from '@/api/client';

jest.mock('@/api/client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const http = api as jest.Mocked<typeof api>;
const envelope = (payload: unknown) => ({data: {data: payload}});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('authApi', () => {
  it('register() posts to /auth/register and unwraps the payload', async () => {
    http.post.mockResolvedValue(envelope({token: 't'}));
    const payload = {
      name: 'Jane',
      email: 'jane@example.com',
      password: 'pw',
      password_confirmation: 'pw',
    };
    const result = await authApi.register(payload);

    expect(http.post).toHaveBeenCalledWith('/auth/register', payload);
    expect(result).toEqual({token: 't'});
  });

  it('login() posts email/password to /auth/login', async () => {
    http.post.mockResolvedValue(envelope({token: 't'}));
    const result = await authApi.login('jane@example.com', 'pw');

    expect(http.post).toHaveBeenCalledWith('/auth/login', {email: 'jane@example.com', password: 'pw'});
    expect(result).toEqual({token: 't'});
  });

  it('me() requests /auth/me', async () => {
    http.get.mockResolvedValue(envelope({id: 1}));
    const result = await authApi.me();

    expect(http.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual({id: 1});
  });

  it('logout() posts to /auth/logout', async () => {
    http.post.mockResolvedValue(envelope(null));
    await authApi.logout();

    expect(http.post).toHaveBeenCalledWith('/auth/logout');
  });

  it('forgotPassword() posts the email and returns the message string', async () => {
    http.post.mockResolvedValue({data: {message: 'Reset link sent.'}});
    const result = await authApi.forgotPassword('jane@example.com');

    expect(http.post).toHaveBeenCalledWith('/auth/forgot-password', {email: 'jane@example.com'});
    expect(result).toBe('Reset link sent.');
  });

  it('updateProfile() puts to /profile', async () => {
    http.put.mockResolvedValue(envelope({id: 1, name: 'Jane Q'}));
    const result = await authApi.updateProfile({name: 'Jane Q'});

    expect(http.put).toHaveBeenCalledWith('/profile', {name: 'Jane Q'});
    expect(result).toEqual({id: 1, name: 'Jane Q'});
  });

  it('changePassword() puts to /password', async () => {
    http.put.mockResolvedValue(envelope(null));
    const payload = {current_password: 'a', password: 'b', password_confirmation: 'b'};
    await authApi.changePassword(payload);

    expect(http.put).toHaveBeenCalledWith('/password', payload);
  });
});
