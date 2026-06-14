import * as Keychain from 'react-native-keychain';
import {tokenStorage} from '@/utils/storage';

const SERVICE = {service: 'dcard.auth'};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('tokenStorage', () => {
  it('set() stores the token under the dcard service', async () => {
    await tokenStorage.set('abc123');
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith('token', 'abc123', SERVICE);
  });

  it('get() returns the stored password', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce({password: 'abc123'});
    await expect(tokenStorage.get()).resolves.toBe('abc123');
    expect(Keychain.getGenericPassword).toHaveBeenCalledWith(SERVICE);
  });

  it('get() returns null when nothing is stored', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValueOnce(false);
    await expect(tokenStorage.get()).resolves.toBeNull();
  });

  it('clear() resets the entry', async () => {
    await tokenStorage.clear();
    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith(SERVICE);
  });
});
