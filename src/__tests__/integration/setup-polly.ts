/**
 * VCR (Record / Replay) Setup for Integration Tests
 *
 * Uses MSW (Mock Service Worker) to intercept HTTP requests.
 *
 * - RECORD mode:  Passes requests through to real APIs, captures responses
 *                 as JSON fixtures ("cassettes") on disk.
 * - REPLAY mode:  Intercepts requests and returns stored fixtures.
 *                 No real API keys needed.
 *
 * Usage:
 *   Recording:  POLLY_MODE=record doppler run -- pnpm test:integration
 *   Replay:     pnpm test:integration
 *
 * Cassettes are stored in fixtures/ alongside this file and committed to git.
 * API keys and auth headers are automatically redacted from recordings.
 */

import fs from 'node:fs';
import path from 'node:path';
import { bypass, HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

const FIXTURES_DIR = path.join(import.meta.dirname, 'fixtures');

/** Headers that contain secrets and must be redacted from recordings. */
const SENSITIVE_HEADERS = [
  'authorization',
  'x-api-key',
  'api-key',
  'x-goog-api-key',
  'anthropic-api-key',
];

export type VCRMode = 'record' | 'replay';

interface CassetteEntry {
  url: string;
  method: string;
  status: number;
  headers: Record<string, string>;
  body: string;
}

interface Cassette {
  name: string;
  recordedAt: string;
  entries: CassetteEntry[];
}

function getCassettePath(name: string): string {
  return path.join(FIXTURES_DIR, `${name}.json`);
}

function loadCassette(name: string): Cassette | null {
  const filePath = getCassettePath(name);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Cassette;
}

function saveCassette(cassette: Cassette): void {
  if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  }
  fs.writeFileSync(getCassettePath(cassette.name), JSON.stringify(cassette, null, 2));
}

function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const result = { ...headers };
  for (const h of SENSITIVE_HEADERS) {
    if (result[h]) result[h] = '[REDACTED]';
  }
  return result;
}

/**
 * Create a VCR context for a test suite.
 *
 * In RECORD mode: requests pass through to real APIs, responses are captured.
 * In REPLAY mode: requests are intercepted, stored responses are returned.
 */
export function createVCR(name: string) {
  const mode: VCRMode = (process.env.POLLY_MODE as VCRMode) ?? 'replay';
  const recorded: CassetteEntry[] = [];
  let replayIndex = 0;
  let cassette: Cassette | null = null;

  if (mode === 'replay') {
    cassette = loadCassette(name);
    if (!cassette) {
      throw new Error(
        `Cassette "${name}" not found at ${getCassettePath(name)}.\n` +
          'Record first with: POLLY_MODE=record doppler run -- pnpm test:integration'
      );
    }
  }

  const server = setupServer(
    http.all('*', async ({ request }) => {
      if (mode === 'record') {
        // Use bypass() to send real request without MSW re-intercepting it
        const response = await fetch(bypass(request));
        const body = await response.text();

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        // Remove content-encoding since we store decompressed body text.
        // MSW already handles decompression via response.text().
        delete responseHeaders['content-encoding'];
        delete responseHeaders['transfer-encoding'];

        recorded.push({
          url: request.url,
          method: request.method,
          status: response.status,
          headers: redactHeaders(responseHeaders),
          body,
        });

        return new HttpResponse(body, {
          status: response.status,
          headers: responseHeaders,
        });
      }

      // Replay mode — return stored response
      if (!cassette || replayIndex >= cassette.entries.length) {
        throw new Error(
          `Cassette "${name}" has no more entries (index=${replayIndex}). ` +
            'Re-record with: POLLY_MODE=record doppler run -- pnpm test:integration'
        );
      }

      const entry = cassette.entries[replayIndex++];
      return new HttpResponse(entry.body, {
        status: entry.status,
        headers: entry.headers,
      });
    })
  );

  return {
    mode,

    start() {
      server.listen({ onUnhandledRequest: 'bypass' });
    },

    async stop() {
      server.close();

      if (mode === 'record' && recorded.length > 0) {
        saveCassette({
          name,
          recordedAt: new Date().toISOString(),
          entries: recorded,
        });
      }
    },
  };
}

/**
 * Get an API key from environment, or return a placeholder for replay mode.
 * During recording, real keys from Doppler are required.
 * During replay, the placeholder is fine since HTTP is intercepted.
 */
export function getApiKey(envVar: string): string {
  const key = process.env[envVar];
  if (key) return key;

  const mode = process.env.POLLY_MODE ?? 'replay';
  if (mode === 'record') {
    throw new Error(
      `${envVar} is required for recording. Run with: doppler run -- pnpm test:integration`
    );
  }

  return 'test-key-replay-mode';
}
