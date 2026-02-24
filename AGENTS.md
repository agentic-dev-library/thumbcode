# AGENTS.md -- ThumbCode Multi-Agent Coordination Protocol

> How AI agents collaborate to build software in ThumbCode.

---

## Agent Roles

ThumbCode uses four specialized agents, each with a distinct responsibility. All agents extend `BaseAgent` in `src/services/agents/base-agent.ts` and compose three trait modules: **Promptable** (prompt construction), **Reviewable** (execution loop), and **Committable** (result parsing).

### Architect

**Purpose**: System design, planning, and task decomposition.

| Property | Value |
|----------|-------|
| Class | `ArchitectAgent` |
| Temperature | 0.7 (creative) |
| Max tokens | 4096 |
| Tools | `read_file`, `list_directory`, `analyze_dependencies`, `create_spec`, `create_task` |

**Responsibilities**:
- Design system architecture and module structure
- Break features into implementable tasks with acceptance criteria
- Define TypeScript interfaces and data models
- Create technical specifications (architecture, interface, feature)
- Assign sub-tasks to Implementer, Reviewer, or Tester

### Implementer

**Purpose**: Code generation and feature implementation.

| Property | Value |
|----------|-------|
| Class | `ImplementerAgent` |
| Temperature | 0.3 (precise) |
| Max tokens | 8192 |
| Tools | `read_file`, `write_file`, `edit_file`, `delete_file`, `create_directory`, `list_directory`, `search_code`, `run_command` |

**Responsibilities**:
- Write TypeScript/React code following project conventions
- Implement features based on Architect specifications
- Follow P3 "Warm Technical" design system (organic shapes, brand colors)
- Use Tailwind CSS for all styling
- Handle edge cases and error boundaries

### Reviewer

**Purpose**: Code review, security audit, and quality assurance.

| Property | Value |
|----------|-------|
| Class | `ReviewerAgent` |
| Temperature | 0.5 (balanced) |
| Max tokens | 4096 |
| Tools | `read_file`, `list_directory`, `get_diff`, `search_code`, `add_comment`, `approve_changes`, `request_changes` |

**Responsibilities**:
- Review code for quality, security, and best practices
- Identify bugs, vulnerabilities, and performance issues
- Verify TypeScript types, error handling, and accessibility
- Issue severity-tagged comments (critical, major, minor, suggestion)
- Approve or request changes with actionable feedback

### Tester

**Purpose**: Test generation, execution, and coverage analysis.

| Property | Value |
|----------|-------|
| Class | `TesterAgent` |
| Temperature | 0.3 (precise) |
| Max tokens | 4096 |
| Tools | `read_file`, `write_file`, `list_directory`, `search_code`, `run_tests`, `get_coverage`, `create_mock`, `analyze_test_results` |

**Responsibilities**:
- Write unit tests (Vitest + Testing Library)
- Write integration and E2E tests (Playwright)
- Follow AAA pattern (Arrange, Act, Assert)
- Measure and improve code coverage (target: 80% statements)
- Create mocks for external dependencies

---

## Orchestration Architecture

The orchestration system lives in `src/services/orchestrator/` and consists of three modules:

```
AgentOrchestrator (facade)
  |-- AgentCoordinator          -- agent lifecycle and task execution
  |-- TaskAssigner              -- task creation, assignment, and queries
  |-- OrchestrationStateManager -- state, metrics, and execution planning
```

### Configuration

```typescript
interface OrchestratorConfig {
  provider: AIProvider;           // 'anthropic' | 'openai'
  model?: string;                 // e.g. 'claude-sonnet-4-20250514'
  maxConcurrentAgents: number;    // parallel execution slots
  autoAssign: boolean;            // auto-assign tasks to agents by role
  enableParallelExecution: boolean;
  projectContext: AgentContext;    // workspace dir, branch, project ID
}
```

### Task Lifecycle

```
pending -> assigned -> in_progress -> complete | cancelled
```

Tasks carry:
- Title, description, type (`feature`, `bugfix`, `refactor`, `docs`, `test`)
- Priority (`low`, `medium`, `high`, `critical`)
- Acceptance criteria (string array)
- Dependencies (`dependsOn` -- task IDs that must complete first)
- Assignee role (which agent type handles it)

### Execution Plan

The `OrchestrationStateManager.buildExecutionPlan()` method evaluates the task queue and returns:

| Category | Meaning |
|----------|---------|
| `ready` | No unresolved dependencies; can start immediately |
| `waiting` | Blocked on other tasks |
| `completed` | Already done |
| `blocked` | Circular dependencies or failed prerequisites |

The orchestrator processes ready tasks up to `maxConcurrentAgents` slots. When parallel execution is enabled, multiple ready tasks run concurrently via `Promise.all`.

---

## Workflow Modes

### Single-Agent Routing

For simple requests, the orchestrator routes directly to one agent:

```
User message -> AgentOrchestrator -> route to best agent -> execute -> respond
```

The routing decision considers the message content and maps to the most appropriate agent role.

### Multi-Agent Pipeline

For complex features, agents work in sequence with approval gates:

```
1. User describes intent
   |
2. Architect agent
   - Analyzes requirements
   - Produces specification + task breakdown
   - Creates sub-tasks with dependencies
   |
3. USER APPROVAL GATE (plan review)
   |
4. Implementer agent
   - Reads spec and existing code
   - Writes implementation
   - Creates/modifies files
   |
5. Reviewer agent
   - Reads diffs and new code
   - Adds review comments by severity
   - Approves or requests changes
   |
   (if changes requested -> back to step 4)
   |
6. Tester agent
   - Reads implementation
   - Writes tests
   - Runs tests and reports coverage
   |
7. USER APPROVAL GATE (final review)
   |
8. Git commit via src/core/git
```

### Git Isolation

Agents work in isolation via git worktrees to prevent conflicts:

```
main branch
  |-- architect-worktree/    (specs, types, docs)
  |-- implementer-worktree/  (feature code)
  |-- reviewer-worktree/     (read-only analysis)
  +-- tester-worktree/       (test code)
```

---

## Approval Gates

Approval gates are checkpoints where the user must review and approve before the pipeline continues. They exist at two points:

1. **Plan approval** -- After the Architect produces a specification, the user reviews the proposed approach, task breakdown, and interfaces before implementation begins.

2. **Final approval** -- After implementation, review, and testing are complete, the user reviews the final diff and decides whether to commit/merge.

When an approval gate is active:
- The orchestrator pauses (`status: 'paused'`)
- The UI displays the artifact for review (spec, diff, test results)
- The user can approve, request changes, or reject
- On approval, the orchestrator resumes (`status: 'running'`)
- On rejection, the pipeline rolls back to the appropriate step

---

## Inter-Agent Communication

Agents do not communicate directly. All coordination flows through the orchestrator:

```
Agent A -> emits AgentEvent -> OrchestrationStateManager -> updates state
                                    |
                                    v
              TaskAssigner picks next ready task
                                    |
                                    v
              AgentCoordinator assigns to Agent B
```

### Event Types

| Event | Emitted By | Meaning |
|-------|------------|---------|
| `status_change` | Orchestrator, Agent | Status transition (idle, running, paused) |
| `agent_created` | AgentCoordinator | New agent instance registered |
| `agent_removed` | AgentCoordinator | Agent instance removed |
| `task_created` | TaskAssigner | New task added to queue |
| `task_assigned` | TaskAssigner | Task assigned to an agent |
| `task_started` | AgentCoordinator | Agent began executing task |
| `task_completed` | AgentCoordinator | Task finished successfully |
| `task_failed` | AgentCoordinator | Task execution failed |
| `agent_event` | AgentCoordinator | Forwarded agent-level event (tool_use, thinking, error) |
| `tool_use` | BaseAgent | Agent invoked a tool |
| `thinking` | BaseAgent | Agent reasoning step |
| `complete` | BaseAgent | Agent finished execution |
| `error` | BaseAgent | Agent encountered an error |

### Agent Output Structure

Every agent execution returns:

```typescript
interface AgentExecutionResult {
  success: boolean;
  output: {
    filesCreated: string[];
    filesModified: string[];
    filesDeleted: string[];
    summary: string;
  };
  messages: Message[];
  tokensUsed: number;
  error?: string;
}
```

---

## Metrics and Observability

The orchestrator tracks:

| Metric | Scope |
|--------|-------|
| `totalTasksCreated` | Orchestrator |
| `totalTasksCompleted` | Orchestrator |
| `totalTasksFailed` | Orchestrator |
| `totalTokensUsed` | Orchestrator + per-agent |
| `averageTaskDuration` | Orchestrator + per-agent |
| `successRate` | Per-agent |
| `tasksCompleted` | Per-agent |

Access via `orchestrator.getMetrics()`.

---

## Current State (February 2026)

The multi-agent orchestration system is **fully wired for real tool execution**. When a `ToolExecutionBridge` is provided to agents, file I/O tools (read, write, create, delete, list, search, diff, test results, coverage, document generation) execute real operations against the workspace. Agent-specific tools (create_spec, create_task, add_comment, approve/request changes, create_mock) remain orchestration-level operations.

### What works now
- Agent creation and lifecycle management
- Task creation, assignment, and dependency resolution
- Execution plan building (ready/waiting/blocked)
- Sequential and parallel task processing
- Real file I/O via ToolExecutionBridge (reads, writes, diffs, search)
- Event emission and subscription
- Metrics tracking
- MCP tool routing via Vercel AI SDK (stdio, HTTP, and SSE transports)

### Architecture note
MCP (Model Context Protocol) is wired through `@ai-sdk/mcp` from the Vercel AI SDK. The `McpClient` creates real transport connections (stdio for local tool servers, HTTP/SSE for remote), discovers tools via the SDK, and executes them natively. The `McpToolBridge` converts SDK tool definitions into the agent `ToolDefinition` format with name prefixing for collision avoidance. Tool execution flows through `base-agent.ts`'s routing chain: MCP tools are checked first, then skills, then the ToolExecutionBridge, then agent-specific tools.

---

## For AI Agents Reading This

1. Read `CLAUDE.md` first for brand identity, coding conventions, and anti-patterns
2. Read `docs/memory-bank/systemPatterns.md` for full architecture details
3. Check `src/services/agents/` for agent implementations
4. Check `src/services/orchestrator/` for coordination logic
5. Never modify agent tool definitions without updating this document
