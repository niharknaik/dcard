import * as Keychain from 'react-native-keychain';

const SERVICE = 'dcard.auth';

/**
 * Secure token storage backed by Keychain (iOS) / Keystore (Android).
 */
export const tokenStorage = {
  async set(token: string): Promise<void> {
    await Keychain.setGenericPassword('token', token, {service: SERVICE});
  },

  async get(): Promise<string | null> {
    const creds = await Keychain.getGenericPassword({service: SERVICE});
    return creds ? creds.password : null;
  },

  async clear(): Promise<void> {
    await Keychain.resetGenericPassword({service: SERVICE});
  },
};
