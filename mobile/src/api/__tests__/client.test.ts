import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios';
import * as Keychain from 'react-native-keychain';
import {api, apiErrorMessage, setUnauthorizedHandler} from '@/api/client';

// Build a rejected response the way axios's adapter would, so the response
// interceptor sees error.response.status.
function rejectWith(status: number) {
  return (config: InternalAxiosRequestConfig) =>
    Promise.reject(
      new AxiosError('request failed', 'ERR_BAD_RESPONSE', config, null, {
        status,
        statusText: '',
        data: {},
        headers: {},
        config,
      }),
    );
}

function resolveWith(status: number, data: unknown) {
  return (config: InternalAxiosRequestConfig) =>
    Promise.resolve({status, statusText: '', data, headers: {}, config});
}

describe('apiErrorMessage', () => {
  it('prefers the first field validation error', () => {
    const err = new AxiosError('bad', 'ERR', undefined, undefined, {
      status: 422,
      statusText: '',
      data: {message: 'Validation failed', errors: {email: ['The email is invalid.']}},
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });
    expect(apiErrorMessage(err)).toBe('The email is invalid.');
  });

  it('falls back to the response message', () => {
    const err = new AxiosError('bad', 'ERR', undefined, undefined, {
      status: 500,
      statusText: '',
      data: {message: 'Server exploded'},
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });
    expect(apiErrorMessage(err)).toBe('Server exploded');
  });

  it('falls back to the axios error message when there is no response body', () => {
    const err = new AxiosError('Network Error', 'ERR_NETWORK');
    expect(apiErrorMessage(err)).toBe('Network Error');
  });

  it('returns a generic message for non-axios errors', () => {
    expect(apiErrorMessage(new Error('boom'))).toBe('Something went wrong. Please try again.');
  });
});

describe('401 refresh interceptor', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (api.defaults as {adapter?: unknown}).adapter;
  });

  it('refreshes the token once and replays the original request', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({password: 'old-token'});

    const adapter = jest
      .fn()
      .mockImplementationOnce(rejectWith(401))
      .mockImplementationOnce(resolveWith(200, {ok: true}));
    api.defaults.adapter = adapter;

    const postSpy = jest
      .spyOn(axios, 'post')
      .mockResolvedValue({data: {data: {token: 'new-token'}}});

    const res = await api.get('/cards');

    expect(res.status).toBe(200);
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'token',
      'new-token',
      expect.objectContaining({service: 'dcard.auth'}),
    );
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it('drops the session when the refresh itself fails', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({password: 'old-token'});

    const adapter = jest.fn().mockImplementation(rejectWith(401));
    api.defaults.adapter = adapter;

    jest.spyOn(axios, 'post').mockRejectedValue(new Error('refresh rejected'));
    const onUnauthorized = jest.fn();
    setUnauthorizedHandler(onUnauthorized);

    await expect(api.get('/cards')).rejects.toBeTruthy();

    expect(Keychain.resetGenericPassword).toHaveBeenCalled();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    // Only one refresh attempt — the _retry guard prevents a loop.
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it('does not attempt a refresh for auth routes', async () => {
    (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({password: 'old-token'});

    const adapter = jest.fn().mockImplementation(rejectWith(401));
    api.defaults.adapter = adapter;
    const postSpy = jest.spyOn(axios, 'post');

    await expect(api.post('/auth/login', {})).rejects.toBeTruthy();

    expect(postSpy).not.toHaveBeenCalled();
    expect(adapter).toHaveBeenCalledTimes(1);
  });
});
