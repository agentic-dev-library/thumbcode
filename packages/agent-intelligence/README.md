# @thumbcode/agent-intelligence

Multi-agent AI system for ThumbCode. Provides specialized agents (Architect, Implementer, Reviewer, Tester) with unified AI provider support and orchestration for coordinated task execution.

## Installation

This package is part of the ThumbCode monorepo and uses workspace protocol:

```json
{
  "dependencies": {
    "@thumbcode/agent-intelligence": "workspace:*"
  }
}
```

## Key Exports

### AI Services (`@thumbcode/agent-intelligence/ai`)

Unified interface for AI providers (Anthropic, OpenAI):

- `createAIClient(provider, apiKey)` -- Create an AI client for a given provider
- `getDefaultModel(provider)` -- Get the default model for a provider
- `getAvailableModels(provider)` -- List available models for a provider
- `createAnthropicClient(apiKey)` -- Create an Anthropic-specific client
- `createOpenAIClient(apiKey)` -- Create an OpenAI-specific client
- `ANTHROPIC_MODELS` / `OPENAI_MODELS` -- Available model constants

**Types:** `AIClient`, `AIProvider`, `Message`, `CompletionOptions`, `CompletionResponse`, `StreamEvent`, `ToolDefinition`, `TokenUsage`

### Specialized Agents (`@thumbcode/agent-intelligence/agents`)

Four role-based agents with distinct capabilities:

| Agent | Role | Temperature | Max Tokens | Purpose |
|-------|------|-------------|------------|---------|
| `ArchitectAgent` | `architect` | 0.7 | 4096 | System design, architecture decisions |
| `ImplementerAgent` | `implementer` | 0.3 | 8192 | Code generation and implementation |
| `ReviewerAgent` | `reviewer` | 0.5 | 4096 | Code review and quality assessment |
| `TesterAgent` | `tester` | 0.3 | 4096 | Test generation and validation |

- `createAgent(role, config)` -- Factory function to create an agent by role
- `DEFAULT_AGENT_CONFIGS` -- Default configuration for each agent role
- `BaseAgent` -- Abstract base class all agents extend

### Orchestrator (`@thumbcode/agent-intelligence/orchestrator`)

Multi-agent coordination and task management:

- `Orchestrator` -- Manages agent lifecycle, task queuing, dependency resolution, and parallel execution
- **Types:** `OrchestratorConfig`, `OrchestratorState`, `CreateTaskInput`, `TaskResult`, `ExecutionPlan`, `OrchestratorMetrics`

## Usage

```typescript
import {
  createAIClient,
  createAgent,
  Orchestrator,
} from '@thumbcode/agent-intelligence';

// 1. Create an AI client
const client = createAIClient('anthropic', 'sk-ant-...');

// 2. Create agents
const architect = createAgent('architect', {
  id: 'arch-1',
  name: 'Architect',
  aiClient: client,
});

// 3. Or use the orchestrator for coordinated work
const orchestrator = new Orchestrator({
  provider: 'anthropic',
  maxConcurrentAgents: 4,
  autoAssign: true,
  enableParallelExecution: true,
  projectContext: { /* ... */ },
});
```

## Dependencies

- `@thumbcode/types` -- Shared type definitions
- `@thumbcode/state` -- State management (Zustand stores)
- `@anthropic-ai/sdk` -- Anthropic API client
- `openai` -- OpenAI API client

## Related

- [ThumbCode README](../../README.md)
- [Architecture](../../ARCHITECTURE.md)
