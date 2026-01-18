/**
 * Event Type Definitions
 *
 * Types for application events and event handling.
 */

/**
 * Base event interface
 */
export interface BaseEvent {
  id: string;
  timestamp: string;
  source: string;
}

/**
 * All event types
 */
export type AppEvent = AgentEvent | ProjectEvent | WorkspaceEvent | ChatEvent | SystemEvent;

/**
 * Agent events
 */
export interface AgentEvent extends BaseEvent {
  type: 'agent';
  action: AgentEventAction;
  agentId: string;
  payload: Record<string, unknown>;
}

export type AgentEventAction =
  | 'started'
  | 'stopped'
  | 'status_changed'
  | 'task_assigned'
  | 'task_started'
  | 'task_completed'
  | 'task_failed'
  | 'error';

/**
 * Project events
 */
export interface ProjectEvent extends BaseEvent {
  type: 'project';
  action: ProjectEventAction;
  projectId: string;
  payload: Record<string, unknown>;
}

export type ProjectEventAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'synced'
  | 'sync_failed'
  | 'branch_created'
  | 'branch_deleted';

/**
 * Workspace events
 */
export interface WorkspaceEvent extends BaseEvent {
  type: 'workspace';
  action: WorkspaceEventAction;
  workspaceId: string;
  payload: Record<string, unknown>;
}

export type WorkspaceEventAction =
  | 'created'
  | 'files_changed'
  | 'staged'
  | 'unstaged'
  | 'committed'
  | 'pushed'
  | 'pulled'
  | 'conflict'
  | 'resolved'
  | 'deleted';

/**
 * Chat events
 */
export interface ChatEvent extends BaseEvent {
  type: 'chat';
  action: ChatEventAction;
  threadId: string;
  payload: Record<string, unknown>;
}

export type ChatEventAction =
  | 'message_sent'
  | 'message_received'
  | 'message_streaming'
  | 'typing_started'
  | 'typing_stopped'
  | 'thread_created'
  | 'thread_archived';

/**
 * System events
 */
export interface SystemEvent extends BaseEvent {
  type: 'system';
  action: SystemEventAction;
  payload: Record<string, unknown>;
}

export type SystemEventAction =
  | 'app_started'
  | 'app_backgrounded'
  | 'app_foregrounded'
  | 'network_online'
  | 'network_offline'
  | 'credential_added'
  | 'credential_removed'
  | 'credential_validated'
  | 'error';

/**
 * Event handler type
 */
export type EventHandler<T extends AppEvent = AppEvent> = (event: T) => void | Promise<void>;

/**
 * Event subscription
 */
export interface EventSubscription {
  unsubscribe: () => void;
}

/**
 * Event emitter interface
 */
export interface EventEmitter {
  emit<T extends AppEvent>(event: T): void;
  on<T extends AppEvent>(type: T['type'], handler: EventHandler<T>): EventSubscription;
  off<T extends AppEvent>(type: T['type'], handler: EventHandler<T>): void;
}
