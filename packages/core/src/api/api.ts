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
  let url: string;
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.href;
  } else {
    url = input.url;
  }

  // Securely validate the hostname to prevent subdomain attacks
  // Only match exact hostname OR legitimate subdomains (prefixed with '.')
  const hostname = new URL(url).hostname;
  const isValidMcpHost =
    hostname === MCP_SERVER_HOST || hostname.endsWith(`.${MCP_SERVER_HOST}`);

  if (isValidMcpHost) {
    const method = init?.method?.toUpperCase() || 'GET';
    let body: string | undefined;
    if (!init?.body) {
      body = undefined;
    } else if (typeof init.body === 'string') {
      body = init.body;
    } else {
      body = JSON.stringify(init.body);
    }

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
