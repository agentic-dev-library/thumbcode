// packages/agent-intelligence/src/services/agent-orchestrator/types.ts

export enum AgentRole {
  Architect = 'Architect',
  Implementer = 'Implementer',
  Reviewer = 'Reviewer',
  Tester = 'Tester',
}

export enum AgentStatus {
  Idle = 'Idle',
  Working = 'Working',
  Done = 'Done',
  Error = 'Error',
}

export interface Agent {
  id: string;
  role: AgentRole;
  status: AgentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentLifecycle {
  start: (agent: Agent) => Promise<void>;
  stop: (agent: Agent) => Promise<void>;
  getStatus: (agent: Agent) => Promise<AgentStatus>;
}
