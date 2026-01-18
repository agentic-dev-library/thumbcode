# AgentOrchestrator API

The `AgentOrchestrator` coordinates multiple AI agents working together on development tasks. It manages agent lifecycle, task distribution, and inter-agent communication.

## Overview

```typescript
import { AgentOrchestrator } from '@thumbcode/core';

const orchestrator = new AgentOrchestrator();

// Create and start agents
await orchestrator.createAgentTeam({
  projectPath: '/projects/my-app',
  agents: ['architect', 'implementer', 'reviewer']
});

// Assign a task
await orchestrator.assignTask({
  description: 'Add user authentication',
  type: 'feature'
});
```

## Features

- Multi-agent coordination
- Task distribution and tracking
- Agent communication and handoffs
- Progress monitoring and reporting
- Automatic conflict resolution

## Agent Types

ThumbCode includes several specialized agent types:

| Agent | Role | Responsibilities |
|-------|------|------------------|
| `architect` | System Design | Architecture decisions, file structure, API design |
| `implementer` | Code Writing | Feature implementation, bug fixes |
| `reviewer` | Code Review | Quality checks, best practices, security |
| `tester` | Testing | Test creation, coverage analysis |

## Initialization

```typescript
const orchestrator = new AgentOrchestrator(options?: OrchestratorOptions);
```

### Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `provider` | `'anthropic' \| 'openai'` | `'anthropic'` | AI provider |
| `model` | `string` | - | Model for agents |
| `maxConcurrent` | `number` | `2` | Max concurrent agents |
| `autoReview` | `boolean` | `true` | Auto-trigger reviews |

## Methods

### createAgentTeam

```typescript
async createAgentTeam(options: TeamOptions): Promise<AgentTeam>
```

Creates a team of agents for a project.

#### TeamOptions

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `projectPath` | `string` | Yes | Project directory |
| `agents` | `AgentType[]` | Yes | Agent types to create |
| `gitBranch` | `string` | No | Working branch |

#### Example

```typescript
const team = await orchestrator.createAgentTeam({
  projectPath: '/projects/my-app',
  agents: ['architect', 'implementer', 'reviewer'],
  gitBranch: 'feature/auth'
});

console.log(`Team created with ${team.agents.length} agents`);
```

### assignTask

```typescript
async assignTask(options: TaskOptions): Promise<Task>
```

Assigns a task to the agent team.

#### TaskOptions

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `description` | `string` | Yes | Task description |
| `type` | `TaskType` | Yes | Task type |
| `priority` | `'low' \| 'medium' \| 'high'` | No | Priority level |
| `files` | `string[]` | No | Relevant files |
| `context` | `string` | No | Additional context |

#### Example

```typescript
const task = await orchestrator.assignTask({
  description: 'Implement JWT authentication with refresh tokens',
  type: 'feature',
  priority: 'high',
  context: 'Use the existing UserService for user lookup'
});

// Monitor task progress
task.on('progress', (update) => {
  console.log(`${update.agent}: ${update.status}`);
});

// Wait for completion
const result = await task.complete();
```

### getAgentStatus

```typescript
async getAgentStatus(agentId: string): Promise<AgentStatus>
```

Gets the current status of an agent.

```typescript
interface AgentStatus {
  id: string;
  type: AgentType;
  status: 'idle' | 'working' | 'waiting' | 'completed' | 'error';
  currentTask?: string;
  progress: number;
  lastActivity: Date;
}

const status = await orchestrator.getAgentStatus('agent-123');
console.log(`${status.type} is ${status.status}`);
```

### listAgents

```typescript
async listAgents(): Promise<Agent[]>
```

Lists all active agents.

```typescript
const agents = await orchestrator.listAgents();
agents.forEach(agent => {
  console.log(`${agent.name} (${agent.type}): ${agent.status}`);
});
```

### stopAgent

```typescript
async stopAgent(agentId: string): Promise<void>
```

Stops a specific agent.

```typescript
await orchestrator.stopAgent('agent-123');
```

### stopAll

```typescript
async stopAll(): Promise<void>
```

Stops all agents.

```typescript
await orchestrator.stopAll();
```

## Task Types

| Type | Description | Typical Agents |
|------|-------------|----------------|
| `feature` | New functionality | architect, implementer, reviewer |
| `bugfix` | Bug resolution | implementer, tester |
| `refactor` | Code improvement | architect, implementer, reviewer |
| `test` | Add tests | tester, implementer |
| `docs` | Documentation | implementer |

## Workflow Example

### Feature Development

```typescript
import { AgentOrchestrator, useAgentStore } from '@thumbcode/core';

// 1. Initialize orchestrator
const orchestrator = new AgentOrchestrator({
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022'
});

// 2. Create team
const team = await orchestrator.createAgentTeam({
  projectPath: '/projects/my-app',
  agents: ['architect', 'implementer', 'reviewer'],
  gitBranch: 'feature/user-dashboard'
});

// 3. Assign feature task
const task = await orchestrator.assignTask({
  description: 'Create a user dashboard showing recent activity',
  type: 'feature',
  files: ['src/pages/', 'src/components/'],
  context: `
    Use the existing ActivityService for data.
    Follow the existing page layout pattern.
    Include loading and error states.
  `
});

// 4. Monitor progress
task.on('agent-started', (agent) => {
  console.log(`${agent.type} started working`);
});

task.on('file-created', (file) => {
  console.log(`Created: ${file.path}`);
});

task.on('review-comment', (comment) => {
  console.log(`Review: ${comment.message}`);
});

// 5. Wait for completion
const result = await task.complete();

console.log('Task completed!');
console.log(`Files created: ${result.filesCreated.length}`);
console.log(`Files modified: ${result.filesModified.length}`);
```

## Agent Communication

Agents communicate through a structured message system:

### Message Types

```typescript
interface AgentMessage {
  from: string;
  to: string;
  type: 'handoff' | 'question' | 'review' | 'approval';
  content: string;
  metadata?: Record<string, unknown>;
}
```

### Handoffs

```typescript
// Architect hands off to Implementer
{
  from: 'architect-1',
  to: 'implementer-1',
  type: 'handoff',
  content: 'Architecture complete. Files structured as discussed.',
  metadata: {
    files: ['src/services/AuthService.ts', 'src/types/auth.ts'],
    decisions: [
      'Using JWT with 15min expiry',
      'Refresh tokens stored in SecureStore'
    ]
  }
}
```

## Event Handling

```typescript
const task = await orchestrator.assignTask({...});

// Task events
task.on('progress', (update) => {
  updateUI(update.progress);
});

task.on('agent-started', (agent) => {
  logActivity(`${agent.type} started`);
});

task.on('agent-completed', (agent) => {
  logActivity(`${agent.type} finished`);
});

task.on('file-created', (file) => {
  refreshFileTree();
});

task.on('file-modified', (file) => {
  refreshFileTree();
});

task.on('review-comment', (comment) => {
  showReviewComment(comment);
});

task.on('error', (error) => {
  handleError(error);
});

task.on('completed', (result) => {
  showCompletionSummary(result);
});
```

## Error Handling

```typescript
import { OrchestratorError, ErrorCodes } from '@thumbcode/core';

try {
  await orchestrator.assignTask({...});
} catch (error) {
  if (error instanceof OrchestratorError) {
    switch (error.code) {
      case ErrorCodes.NO_AGENTS_AVAILABLE:
        console.log('No agents available');
        break;
      case ErrorCodes.TASK_CONFLICT:
        console.log('Conflicting task in progress');
        break;
      case ErrorCodes.GIT_CONFLICT:
        console.log('Git conflicts detected');
        break;
    }
  }
}
```

## State Management

Agent state is managed through Zustand:

```typescript
import { useAgentStore } from '@thumbcode/state';

function AgentDashboard() {
  const agents = useAgentStore((state) => state.agents);
  const activeTask = useAgentStore((state) => state.activeTask);

  return (
    <View>
      {agents.map(agent => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
      {activeTask && <TaskProgress task={activeTask} />}
    </View>
  );
}
```

## Configuration

### Set Agent Models

```typescript
orchestrator.configure({
  agentModels: {
    architect: 'claude-3-opus-20240229',
    implementer: 'claude-3-5-sonnet-20241022',
    reviewer: 'claude-3-5-sonnet-20241022',
    tester: 'claude-3-haiku-20240307'
  }
});
```

### Set Concurrency

```typescript
orchestrator.configure({
  maxConcurrent: 3 // Allow 3 agents working simultaneously
});
```

## Best Practices

1. **Provide clear task descriptions**: Detailed descriptions lead to better results.

2. **Include relevant context**: Reference existing code patterns and services.

3. **Start with architect**: Let the architect plan before implementation.

4. **Monitor progress**: Use events to keep users informed.

5. **Handle conflicts**: Be prepared for git conflicts and review feedback.

6. **Set appropriate models**: Use capable models for complex tasks.

## Type Definitions

```typescript
type AgentType = 'architect' | 'implementer' | 'reviewer' | 'tester';

type TaskType = 'feature' | 'bugfix' | 'refactor' | 'test' | 'docs';

interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  currentTask?: string;
}

interface Task {
  id: string;
  description: string;
  type: TaskType;
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'failed';
  agents: string[];
  progress: number;
  createdAt: Date;
}

interface TaskResult {
  success: boolean;
  filesCreated: string[];
  filesModified: string[];
  filesDeleted: string[];
  commits: string[];
  reviewComments: ReviewComment[];
}
```

## See Also

- [ChatService](./chat-service.md) - AI communication
- [GitService](./git-service.md) - Git operations used by agents
- [Agent Types](../agents/types.md) - Detailed agent documentation
