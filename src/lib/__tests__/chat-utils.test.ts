/**
 * Chat Utils Tests
 */

import { formatRelativeTime, formatTime, getParticipantColor, getSenderInfo } from '../chat-utils';

describe('formatTime', () => {
  it('returns a short time string', () => {
    const result = formatTime('2025-06-15T14:30:00Z');
    // Should contain hour and minute portions
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('handles midnight timestamps', () => {
    const result = formatTime('2025-01-01T00:00:00Z');
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Just now" for timestamps less than a minute ago', () => {
    const now = new Date('2025-06-15T12:00:00Z');
    vi.setSystemTime(now);
    expect(formatRelativeTime('2025-06-15T11:59:30Z')).toBe('Just now');
  });

  it('returns minutes ago for timestamps under an hour', () => {
    const now = new Date('2025-06-15T12:00:00Z');
    vi.setSystemTime(now);
    expect(formatRelativeTime('2025-06-15T11:45:00Z')).toBe('15m ago');
  });

  it('returns hours ago for timestamps under a day', () => {
    const now = new Date('2025-06-15T12:00:00Z');
    vi.setSystemTime(now);
    expect(formatRelativeTime('2025-06-15T09:00:00Z')).toBe('3h ago');
  });

  it('returns days ago for timestamps under a week', () => {
    const now = new Date('2025-06-15T12:00:00Z');
    vi.setSystemTime(now);
    expect(formatRelativeTime('2025-06-13T12:00:00Z')).toBe('2d ago');
  });

  it('returns a date string for timestamps over a week ago', () => {
    const now = new Date('2025-06-15T12:00:00Z');
    vi.setSystemTime(now);
    const result = formatRelativeTime('2025-06-01T12:00:00Z');
    // Should be a locale date string, not a relative format
    expect(result).not.toMatch(/ago$/);
    expect(result).toBeTruthy();
  });
});

describe('getSenderInfo', () => {
  it('returns info for "user" sender', () => {
    const info = getSenderInfo('user');
    expect(info.name).toBe('You');
    expect(info.bgColor).toBe('bg-teal-600');
    expect(info.textColor).toBe('text-white');
  });

  it('returns info for "architect" sender', () => {
    const info = getSenderInfo('architect');
    expect(info.name).toBe('Architect');
    expect(info.bgColor).toBe('bg-coral-500');
  });

  it('returns info for "implementer" sender', () => {
    const info = getSenderInfo('implementer');
    expect(info.name).toBe('Implementer');
    expect(info.bgColor).toBe('bg-gold-500');
    expect(info.textColor).toBe('text-charcoal');
  });

  it('returns info for "reviewer" sender', () => {
    const info = getSenderInfo('reviewer');
    expect(info.name).toBe('Reviewer');
    expect(info.bgColor).toBe('bg-teal-500');
  });

  it('returns info for "tester" sender', () => {
    const info = getSenderInfo('tester');
    expect(info.name).toBe('Tester');
    expect(info.bgColor).toBe('bg-neutral-600');
  });

  it('returns system info for "system" sender', () => {
    const info = getSenderInfo('system');
    expect(info.name).toBe('System');
    expect(info.bgColor).toBe('bg-neutral-700');
    expect(info.textColor).toBe('text-neutral-300');
  });

  it('falls back to system info for unknown sender', () => {
    // biome-ignore lint/suspicious/noExplicitAny: testing unknown sender fallback
    const info = getSenderInfo('unknown' as any);
    expect(info.name).toBe('System');
  });
});

describe('getParticipantColor', () => {
  it('returns coral for architect', () => {
    expect(getParticipantColor('architect')).toBe('bg-coral-500');
  });

  it('returns gold for implementer', () => {
    expect(getParticipantColor('implementer')).toBe('bg-gold-500');
  });

  it('returns teal for reviewer', () => {
    expect(getParticipantColor('reviewer')).toBe('bg-teal-500');
  });

  it('returns neutral for tester', () => {
    expect(getParticipantColor('tester')).toBe('bg-neutral-500');
  });

  it('returns fallback for unknown participant', () => {
    expect(getParticipantColor('unknown')).toBe('bg-neutral-600');
  });
});
