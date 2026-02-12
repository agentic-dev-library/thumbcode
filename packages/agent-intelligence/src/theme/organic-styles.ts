
/**
 * Organic Style Constants (agent-intelligence)
 *
 * This package intentionally duplicates a small subset of the app's organic border-radius
 * definitions so the chat components don't rely on CSS-like `borderRadius` strings that
 * are invalid in React Native.
 */
export const organicBorderRadius = {
  /** Text inputs, form fields */
  input: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 12,
  } as React.CSSProperties,

  /** Primary and secondary buttons */
  button: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 14,
  } as React.CSSProperties,

  /** Small badges, tags, chips */
  badge: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 4,
  } as React.CSSProperties,

  /** Chat bubbles (text messages) */
  chatBubbleUser: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 14,
  } as React.CSSProperties,
  chatBubbleAgent: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 14,
  } as React.CSSProperties,

  /** Code blocks and monospace containers */
  codeBlock: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 8,
  } as React.CSSProperties,
} as const;

