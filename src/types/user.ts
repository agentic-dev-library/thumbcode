/**
 * User System Type Definitions
 */

export interface User {
  id: string;
  email?: string;
  displayName: string;
  avatar?: string;
  credentials: string[]; // Credential IDs
  projects: string[]; // Project IDs
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  hapticFeedback: boolean;
  notifications: NotificationPreferences;
  editor: EditorPreferences;
}

export interface NotificationPreferences {
  agentComplete: boolean;
  reviewRequired: boolean;
  errorAlerts: boolean;
  dailySummary: boolean;
}

export interface EditorPreferences {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
}
