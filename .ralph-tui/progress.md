Merge conflict resolved and staged. Here's what I did:

**Codebase Patterns section** — kept all three new patterns:
- Main's **Agent-intelligence streaming bridge** pattern
- Worker's **Vitest global types** pattern
- Worker's **Biome a11y static analysis** pattern

**Log entries** — kept both new entries in chronological order:
- **US-012** (shared between both branches)
- **US-002** (from main)
- **US-018** (from worker)

`★ Insight ─────────────────────────────────────`
This was a classic "both sides added content" merge conflict — neither side modified the other's work, they just appended in the same locations. The resolution strategy is straightforward: include everything from both sides. The key decisions were (1) ordering the codebase patterns logically (streaming bridge before vitest/biome patterns) and (2) placing US-002 before US-018 chronologically since US-002 was merged to main first.
`─────────────────────────────────────────────────`