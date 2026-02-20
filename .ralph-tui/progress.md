## Codebase Patterns

- **Hook extraction pattern**: Each hook returns a typed result interface (`UseXxxResult`), consumes `@thumbcode/state` stores directly, and exposes derived data via `useMemo`. Pages become thin composition layers (TSX = design only).
- **Test mocking pattern**: Mock `@thumbcode/state` with `vi.mock()` using a selector-based approach: `useXxxStore: (selector) => selector(state)`. Mock `react-router-dom` with `useNavigate: () => mockNavigate`. For page tests, mock the hook module (`@/hooks`) entirely.
- **Biome formatting**: Biome auto-sorts imports alphabetically and collapses single-expression `useMemo` calls to one line. Run `pnpm lint:fix` after writing code.
- **Test text matching**: When asserting text that may appear multiple times (e.g. agent name + activity feed), use `getAllByText().length` instead of `getByText()` to avoid "multiple elements found" errors.
- **Agent-intelligence streaming bridge**: When using `completeStream` from `@thumbcode/agent-intelligence` in a chat context, filter for `event.type === 'content_block_delta' && event.delta?.text` to extract text deltas. The rich `StreamEvent` types (message_start, content_block_stop, etc.) are ignored for simple chat UX but available for tool-calling scenarios.

---

Conflict resolved and staged. The file now cleanly includes contributions from both the US-010 (hook extraction) and US-017 (config cleanup) branches alongside the shared US-007 base.

## 2026-02-20 - US-012
- Extracted inline data logic from three tab pages into dedicated hooks
- Created `useHomeDashboard` hook — derives dashboard stats (projectCount, runningAgents, pendingTasks, completedToday, progressPercent) and recent activity from agent/project stores
- Created `useProjectList` hook — manages search state and filtered project list from @thumbcode/state
- Created `useAgentList` hook — manages role filter state, active agent counts, completed tasks, and per-agent metrics (getAgentMetrics callback)
- Refactored home.tsx, projects.tsx, agents.tsx to be thin composition layers consuming their respective hooks
- Updated hooks/index.ts barrel to export all new hooks and types
- Files changed:
  - `src/hooks/use-home-dashboard.ts` (new)
  - `src/hooks/use-project-list.ts` (new)
  - `src/hooks/use-agent-list.ts` (new)
  - `src/hooks/index.ts` (updated exports)
  - `src/pages/tabs/home.tsx` (refactored)
  - `src/pages/tabs/projects.tsx` (refactored)
  - `src/pages/tabs/agents.tsx` (refactored)
  - `src/hooks/__tests__/use-home-dashboard.test.ts` (new, 9 tests)
  - `src/hooks/__tests__/use-project-list.test.ts` (new, 6 tests)
  - `src/hooks/__tests__/use-agent-list.test.ts` (new, 9 tests)
  - `src/pages/tabs/__tests__/home.test.tsx` (new, 8 tests)
  - `src/pages/tabs/__tests__/projects.test.tsx` (new, 6 tests)
  - `src/pages/tabs/__tests__/agents.test.tsx` (new, 7 tests)
- **Learnings:**
  - When extracting hooks from pages, watch for intermediate values that were implicitly accessible (e.g. `agents.length` vs `filteredAgents.length`) — you may need to explicitly expose both `totalAgents` and `filteredAgents`
  - Pure display helper functions (getStatusColor, AvatarIcon, getStatusBadge) can stay in the page file since they're view-only; only data-fetching/derivation logic needs extraction
  - Biome will reorder imports alphabetically and collapse concise useMemo expressions — always run lint:fix after writing
---

## 2026-02-20 - US-002
- Replaced `src/services/ai/` simplified AI clients with `@thumbcode/agent-intelligence` advanced AI clients
- `AgentResponseService.ts` now imports `createAIClient`, `getDefaultModel`, and types from `@thumbcode/agent-intelligence`
- Streaming uses `completeStream(messages, options, onEvent)` instead of `streamMessage(messages, prompt, onChunk, signal)` — extracts text deltas from `content_block_delta` stream events
- Tool calling support now available through the imported `AIClient.complete()` and `AIClient.completeStream()` with `CompletionOptions.tools`
- Token usage tracking exposed via `CompletionResponse.usage` (inputTokens, outputTokens, totalTokens)
- Moved `AgentPrompts.ts` from `src/services/ai/` to `src/services/chat/` (it's chat orchestration, not AI client abstraction)
- Deleted entire `src/services/ai/` directory (10 files: types, clients, factory, prompts, tests, index)
- Added `@thumbcode/agent-intelligence` as workspace dependency in root `package.json`
- Files changed:
  - `src/services/chat/AgentResponseService.ts` (updated imports and streaming interface)
  - `src/services/chat/AgentPrompts.ts` (moved from `src/services/ai/AgentPrompts.ts`)
  - `src/services/chat/index.ts` (added `getAgentSystemPrompt` export)
  - `src/services/chat/__tests__/AgentResponseService.test.ts` (updated mocks for new interface)
  - `package.json` (added `@thumbcode/agent-intelligence` dependency)
  - `src/services/ai/` (deleted: AIClientFactory.ts, AnthropicClient.ts, OpenAIClient.ts, AgentPrompts.ts, types.ts, index.ts, + 4 test files)
- **Learnings:**
  - The agent-intelligence `completeStream` does not accept an `AbortSignal` — the abort controller lifecycle (`registerAbort`/`cleanupAbort`) is still needed for `StreamHandler` but the signal can't be passed to the AI client
  - When bridging rich `StreamEvent` to simple chat events, only `content_block_delta` with `delta.text` matters — other events (message_start, content_block_stop) are structural and can be ignored for progressive text rendering
  - Pre-existing typecheck errors in `packages/agent-intelligence/` (ToolProperty.description, Anthropic SDK ContentBlockParam) should be fixed in a separate story
  - `completeStream` returns a `CompletionResponse` with `usage` for token tracking — future stories can persist this metadata when `updateMessageMetadata` is added to the chat store
---