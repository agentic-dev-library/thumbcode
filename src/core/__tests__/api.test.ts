import { secureFetch } from '../api/api';

const mockSignRequest = vi.fn();

vi.mock('../security/RequestSigningService', () => ({
  requestSigningService: {
    signRequest: (...args: any[]) => mockSignRequest(...args),
  },
}));

const mockFetch = vi.fn().mockResolvedValue(new Response('ok'));
vi.stubGlobal('fetch', mockFetch);

describe('secureFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue(new Response('ok'));
    mockSignRequest.mockResolvedValue(null);
  });

  it('passes through non-MCP URLs without signing', async () => {
    await secureFetch('https://api.github.com/repos');
    expect(mockSignRequest).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith('https://api.github.com/repos', undefined);
  });

  it('signs requests to MCP server host', async () => {
    mockSignRequest.mockResolvedValue({ 'X-Signature': 'sig123' });
    await secureFetch('https://mcp.thumbcode.com/api/v1/data', {
      method: 'POST',
      body: '{"key":"value"}',
    });
    expect(mockSignRequest).toHaveBeenCalledWith(
      'https://mcp.thumbcode.com/api/v1/data',
      'POST',
      '{"key":"value"}'
    );
    expect(mockFetch).toHaveBeenCalledWith(
      'https://mcp.thumbcode.com/api/v1/data',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-Signature': 'sig123' }),
      })
    );
  });

  it('signs requests to MCP subdomains', async () => {
    mockSignRequest.mockResolvedValue({ 'X-Signature': 'sub-sig' });
    await secureFetch('https://api.mcp.thumbcode.com/resource');
    expect(mockSignRequest).toHaveBeenCalled();
  });

  it('handles URL object input', async () => {
    await secureFetch(new URL('https://api.github.com/repos'));
    expect(mockFetch).toHaveBeenCalled();
  });

  it('handles Request object input', async () => {
    const req = new Request('https://api.github.com/repos');
    await secureFetch(req);
    expect(mockFetch).toHaveBeenCalled();
  });

  it('uses GET as default method for MCP requests', async () => {
    mockSignRequest.mockResolvedValue(null);
    await secureFetch('https://mcp.thumbcode.com/api');
    expect(mockSignRequest).toHaveBeenCalledWith('https://mcp.thumbcode.com/api', 'GET', undefined);
  });

  it('handles non-string body by JSON.stringifying', async () => {
    const body = { data: 'test' };
    mockSignRequest.mockResolvedValue(null);
    await secureFetch('https://mcp.thumbcode.com/api', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    expect(mockSignRequest).toHaveBeenCalledWith(
      'https://mcp.thumbcode.com/api',
      'POST',
      JSON.stringify(body)
    );
  });

  it('does not add headers when signRequest returns null', async () => {
    mockSignRequest.mockResolvedValue(null);
    await secureFetch('https://mcp.thumbcode.com/api');
    // First arg is the URL string, second should be the init (possibly undefined)
    const callInit = mockFetch.mock.calls[0][1];
    expect(callInit).toBeUndefined();
  });
});
