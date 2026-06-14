import {apiFetch, ApiError} from '@/lib/api-client';
import {clearToken, setToken} from '@/lib/auth';

function mockResponse(status: number, body: unknown) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  } as Response;
}

beforeEach(() => {
  clearToken();
  global.fetch = jest.fn();
});

describe('apiFetch', () => {
  it('unwraps the { data } envelope on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse(200, {data: {id: 1}}));
    await expect(apiFetch('/x')).resolves.toEqual({id: 1});
  });

  it('attaches the bearer token when present', async () => {
    setToken('jwt-123');
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse(200, {data: null}));

    await apiFetch('/x');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect((options.headers as Record<string, string>).Authorization).toBe('Bearer jwt-123');
  });

  it('sends no Authorization header when unauthenticated', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse(200, {data: null}));

    await apiFetch('/x');

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect((options.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('throws ApiError with the server message on failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse(422, {message: 'Validation failed'}));

    await expect(apiFetch('/x')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Validation failed',
      status: 422,
    });
    await expect(apiFetch('/x')).rejects.toBeInstanceOf(ApiError);
  });

  it('falls back to a generic message when none is provided', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse(500, {}));
    await expect(apiFetch('/x')).rejects.toMatchObject({message: 'Something went wrong.'});
  });
});
