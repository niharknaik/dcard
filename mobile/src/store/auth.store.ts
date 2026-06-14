import {create} from 'zustand';
import {authApi} from '@/api/auth.api';
import {setUnauthorizedHandler} from '@/api/client';
import {tokenStorage} from '@/utils/storage';
import {User} from '@/types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
    referral_code?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  user: null,

  bootstrap: async () => {
    const token = await tokenStorage.get();
    if (!token) {
      set({status: 'unauthenticated', user: null});
      return;
    }
    try {
      const user = await authApi.me();
      set({status: 'authenticated', user});
    } catch {
      await tokenStorage.clear();
      set({status: 'unauthenticated', user: null});
    }
  },

  login: async (email, password) => {
    const payload = await authApi.login(email, password);
    await tokenStorage.set(payload.token);
    set({status: 'authenticated', user: payload.user});
  },

  register: async input => {
    const payload = await authApi.register(input);
    await tokenStorage.set(payload.token);
    set({status: 'authenticated', user: payload.user});
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    }
    await tokenStorage.clear();
    set({status: 'unauthenticated', user: null});
  },

  setUser: user => set({user}),
}));

// When the API layer hits an unrecoverable 401, drop the session.
setUnauthorizedHandler(() => {
  useAuthStore.setState({status: 'unauthenticated', user: null});
});
