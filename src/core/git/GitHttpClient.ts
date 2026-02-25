/**
 * Custom Git HTTP Client
 *
 * An isomorphic-git http plugin that uses the secureFetch wrapper
 * to sign requests to the MCP server.
 */
import { secureFetch } from '../api/api';

async function* toAsyncIterable(
  stream: ReadableStream<Uint8Array> | null
): AsyncIterableIterator<Uint8Array> {
  if (!stream) {
    return;
  }
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      if (value) {
        yield value;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export const gitHttpClient = {
  async request({
    url,
    method = 'GET',
    headers = {},
    body,
  }: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: Uint8Array[];
  }) {
    const res = await secureFetch(url, {
      method,
      headers,
      body: body ? new Blob(body as BlobPart[]) : undefined,
    });

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((value: string, key: string) => {
      responseHeaders[key] = value;
    });

    return {
      url: res.url,
      method: method, // The request method
      headers: responseHeaders,
      body: toAsyncIterable(res.body),
      statusCode: res.status,
      statusMessage: res.statusText,
    };
  },
};
