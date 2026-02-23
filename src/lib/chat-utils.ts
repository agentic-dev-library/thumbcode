/**
 * Chat Utilities
 *
 * Pure helper functions for formatting timestamps, sender metadata,
 * and participant colors used across chat components.
 */

import type { Message } from '@thumbcode/state';

export interface SenderInfo {
  name: string;
  bgColor: string;
  textColor: string;
}

const SENDER_MAP: Record<Message['sender'], SenderInfo> = {
  user: { name: 'You', bgColor: 'bg-teal-600', textColor: 'text-white' },
  architect: { name: 'Architect', bgColor: 'bg-coral-500', textColor: 'text-white' },
  implementer: { name: 'Implementer', bgColor: 'bg-gold-500', textColor: 'text-charcoal' },
  reviewer: { name: 'Reviewer', bgColor: 'bg-teal-500', textColor: 'text-white' },
  tester: { name: 'Tester', bgColor: 'bg-neutral-600', textColor: 'text-white' },
  system: { name: 'System', bgColor: 'bg-neutral-700', textColor: 'text-neutral-300' },
};

const PARTICIPANT_COLOR_MAP: Record<string, string> = {
  architect: 'bg-coral-500',
  implementer: 'bg-gold-500',
  reviewer: 'bg-teal-500',
  tester: 'bg-neutral-500',
};

/** Format a timestamp as a short time string (e.g. "2:30 PM"). */
export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Format a timestamp as a relative time string (e.g. "5m ago", "2d ago"). */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

/** Get display name and badge colors for a message sender. */
export function getSenderInfo(sender: Message['sender']): SenderInfo {
  return SENDER_MAP[sender] || SENDER_MAP.system;
}

/** Get the Tailwind background color class for a chat participant. */
export function getParticipantColor(participant: string): string {
  return PARTICIPANT_COLOR_MAP[participant] || 'bg-neutral-600';
}
