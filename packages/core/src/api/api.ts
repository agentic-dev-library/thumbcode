/**
 * Secure API Client
 *
 * A wrapper around the global fetch function that adds request signing
 * for all calls to the MCP server.
 */
import { requestSigningService } from '../security/RequestSigningService';

const MCP_SERVER_HOST = 'mcp.thumbcode.com'; // Replace with actual host

export async function secureFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

  // Securely validate the hostname to prevent subdomain attacks
  // Only match exact hostname OR legitimate subdomains (prefixed with '.')
  const hostname = new URL(url).hostname;
  const isValidMcpHost =
    hostname === MCP_SERVER_HOST || hostname.endsWith(`.${MCP_SERVER_HOST}`);

  if (isValidMcpHost) {
    const method = init?.method?.toUpperCase() || 'GET';
    const body = init?.body ? (typeof init.body === 'string' ? init.body : JSON.stringify(init.body)) : undefined;

    const signingHeaders = await requestSigningService.signRequest(url, method, body);

    if (signingHeaders) {
      init = {
        ...init,
        headers: {
          ...init?.headers,
          ...signingHeaders,
        },
      };
    }
  }

  return fetch(input, init);
}
