import {useAuthStore} from '@/store/auth.store';
import {authApi} from '@/api/auth.api';
import {tokenStorage} from '@/utils/storage';
import {AuthPayload, User} from '@/types';

jest.mock('@/api/auth.api', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    me: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('@/utils/storage', () => ({
  tokenStorage: {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
  },
}));

const api = authApi as jest.Mocked<typeof authApi>;
const storage = tokenStorage as jest.Mocked<typeof tokenStorage>;

const user: User = {
  id: 1,
  name: 'Jane',
  email: 'jane@example.com',
  status: 'active',
  is_admin: false,
};

const payload: AuthPayload = {
  user,
  token: 'jwt-token',
  token_type: 'bearer',
  expires_in: 3600,
};

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({status: 'loading', user: null});
});

describe('auth store', () => {
  it('login() persists the token and marks the session authenticated', async () => {
    api.login.mockResolvedValue(payload);

    await useAuthStore.getState().login('jane@example.com', 'secret');

    expect(api.login).toHaveBeenCalledWith('jane@example.com', 'secret');
    expect(storage.set).toHaveBeenCalledWith('jwt-token');
    const state = useAuthStore.getState();
    expect(state.status).toBe('authenticated');
    expect(state.user).toEqual(user);
  });

  it('register() persists the token and authenticates', async () => {
    api.register.mockResolvedValue(payload);

    await useAuthStore.getState().register({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'secret',
      password_confirmation: 'secret',
      accept_terms: true,
    });

    expect(storage.set).toHaveBeenCalledWith('jwt-token');
    expect(useAuthStore.getState().status).toBe('authenticated');
  });

  it('logout() clears the token and session even if the API call fails', async () => {
    useAuthStore.setState({status: 'authenticated', user});
    api.logout.mockRejectedValue(new Error('network down'));

    await useAuthStore.getState().logout();

    expect(storage.clear).toHaveBeenCalled();
    const state = useAuthStore.getState();
    expect(state.status).toBe('unauthenticated');
    expect(state.user).toBeNull();
  });

  it('bootstrap() marks unauthenticated when no token is stored', async () => {
    storage.get.mockResolvedValue(null);

    await useAuthStore.getState().bootstrap();

    expect(api.me).not.toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
  });

  it('bootstrap() loads the current user when a token resolves', async () => {
    storage.get.mockResolvedValue('jwt-token');
    api.me.mockResolvedValue(user);

    await useAuthStore.getState().bootstrap();

    const state = useAuthStore.getState();
    expect(state.status).toBe('authenticated');
    expect(state.user).toEqual(user);
  });

  it('bootstrap() clears a stale token when /me fails', async () => {
    storage.get.mockResolvedValue('expired-token');
    api.me.mockRejectedValue(new Error('401'));

    await useAuthStore.getState().bootstrap();

    expect(storage.clear).toHaveBeenCalled();
    expect(useAuthStore.getState().status).toBe('unauthenticated');
  });
});
