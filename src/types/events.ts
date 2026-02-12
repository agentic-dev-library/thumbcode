/**
 * Event Type Definitions
 */

export type AppEvent = AgentEvent | ProjectEvent | WorkspaceEvent | ChatEvent;

export interface AgentEvent {
  type: 'agent';
  action: 'started' | 'stopped' | 'status_changed' | 'task_assigned' | 'task_completed';
  agentId: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

export interface ProjectEvent {
  type: 'project';
  action: 'created' | 'updated' | 'deleted' | 'synced';
  projectId: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

export interface WorkspaceEvent {
  type: 'workspace';
  action: 'created' | 'files_changed' | 'committed' | 'pushed' | 'conflict';
  workspaceId: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

export interface ChatEvent {
  type: 'chat';
  action: 'message_sent' | 'message_received' | 'typing';
  threadId: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}
