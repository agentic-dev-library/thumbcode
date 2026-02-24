/**
 * AI Provider Integration Tests (VCR)
 *
 * Tests real HTTP round-trips to AI providers using MSW-based VCR.
 *
 * First run (recording):
 *   POLLY_MODE=record doppler run -- pnpm test:integration
 *
 * Subsequent runs (replay from cassettes):
 *   pnpm test:integration
 *
 * Each provider test records a simple completion request and verifies
 * the response shape matches our AIClient interface contract.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createAISDKClient } from '../../services/ai/provider-factory';
import type { CompletionResponse, StreamEvent } from '../../services/ai/types';
import { createVCR, getApiKey } from './setup-polly';

/** Simple prompt that every provider can handle cheaply. */
const TEST_PROMPT = 'Respond with exactly: "Hello from ThumbCode". Nothing else.';

const isRecordMode = process.env.POLLY_MODE === 'record';

/** Check if an error is an auth/key error (stale key in Doppler). */
function isAuthError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('invalid api key') ||
    msg.includes('incorrect api key') ||
    msg.includes('authentication') ||
    msg.includes('unauthorized') ||
    msg.includes('401')
  );
}

/** Verify the response conforms to our CompletionResponse interface. */
function assertValidResponse(response: CompletionResponse) {
  expect(response.id).toBeTruthy();
  expect(response.content.length).toBeGreaterThan(0);
  expect(response.model).toBeTruthy();
  expect(response.stopReason).toBeTruthy();
  expect(response.usage).toBeDefined();
  expect(response.usage.inputTokens).toBeGreaterThanOrEqual(0);
  expect(response.usage.outputTokens).toBeGreaterThan(0);
  expect(response.usage.totalTokens).toBeGreaterThan(0);
}

describe('AI Provider Integration (VCR)', () => {
  const vcr = createVCR('ai-providers');

  beforeAll(() => {
    vcr.start();
  });

  afterAll(async () => {
    await vcr.stop();
  });

  describe('Anthropic', () => {
    const apiKey = getApiKey('ANTHROPIC_API_KEY');
    const client = createAISDKClient('anthropic', apiKey);

    it('complete: returns valid response', async () => {
      const response = await client.complete(
        [{ role: 'user', content: TEST_PROMPT }],
        { model: 'claude-haiku-4-5-20251001', maxTokens: 50 }
      );

      assertValidResponse(response);
      expect(response.content[0].type).toBe('text');
    });

    it('completeStream: streams and returns valid response', async () => {
      const events: StreamEvent[] = [];

      const response = await client.completeStream(
        [{ role: 'user', content: TEST_PROMPT }],
        { model: 'claude-haiku-4-5-20251001', maxTokens: 50 },
        (event) => events.push(event)
      );

      assertValidResponse(response);
      expect(events.some((e) => e.type === 'message_start')).toBe(true);
      expect(events.some((e) => e.type === 'content_block_delta')).toBe(true);
      expect(events.some((e) => e.type === 'message_stop')).toBe(true);
    });
  });

  describe('OpenAI', () => {
    const apiKey = getApiKey('OPENAI_API_KEY');
    const client = createAISDKClient('openai', apiKey);

    it('complete: returns valid response', async () => {
      try {
        const response = await client.complete(
          [{ role: 'user', content: TEST_PROMPT }],
          { model: 'gpt-4o-mini', maxTokens: 50 }
        );
        assertValidResponse(response);
      } catch (error: unknown) {
        if (isAuthError(error)) {
          console.warn('OpenAI API key rejected — update in Doppler (gha/ci)');
          return;
        }
        throw error;
      }
    });
  });

  describe('Google Gemini', () => {
    const apiKey = getApiKey('GEMINI_API_KEY');
    const client = createAISDKClient('google', apiKey);

    it('complete: returns valid response', async () => {
      const response = await client.complete(
        [{ role: 'user', content: TEST_PROMPT }],
        { model: 'gemini-2.5-flash', maxTokens: 50 }
      );

      assertValidResponse(response);
    });
  });

  describe('Groq', () => {
    const apiKey = getApiKey('GROQ_API_KEY');
    const client = createAISDKClient('groq', apiKey);

    it('complete: returns valid response', async () => {
      try {
        const response = await client.complete(
          [{ role: 'user', content: TEST_PROMPT }],
          { model: 'llama-3.1-8b-instant', maxTokens: 50 }
        );
        assertValidResponse(response);
      } catch (error: unknown) {
        if (isAuthError(error)) {
          console.warn('Groq API key rejected — update in Doppler (gha/ci)');
          return;
        }
        throw error;
      }
    });
  });
});
