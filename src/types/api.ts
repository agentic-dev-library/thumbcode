/**
 * API Type Definitions
 *
 * Types for API responses and requests.
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

/**
 * API error
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

/**
 * API response metadata
 */
export interface ApiMeta {
  requestId: string;
  timestamp: string;
  rateLimit?: RateLimitInfo;
  pagination?: PaginationInfo;
}

/**
 * Rate limit info
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: string;
  resource?: string;
}

/**
 * Pagination info
 */
export interface PaginationInfo {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated request params
 */
export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * GitHub API types
 */
export namespace GitHub {
  export interface User {
    login: string;
    id: number;
    avatar_url: string;
    name: string | null;
    email: string | null;
    bio: string | null;
    public_repos: number;
    followers: number;
    following: number;
  }

  export interface Repository {
    id: number;
    name: string;
    full_name: string;
    owner: User;
    private: boolean;
    description: string | null;
    clone_url: string;
    default_branch: string;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    updated_at: string;
  }

  export interface DeviceCodeResponse {
    device_code: string;
    user_code: string;
    verification_uri: string;
    expires_in: number;
    interval: number;
  }

  export interface AccessTokenResponse {
    access_token: string;
    token_type: string;
    scope: string;
  }
}

/**
 * Anthropic API types
 */
export namespace Anthropic {
  export interface Message {
    id: string;
    type: 'message';
    role: 'assistant';
    content: ContentBlock[];
    model: string;
    stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use';
    stop_sequence: string | null;
    usage: Usage;
  }

  export interface ContentBlock {
    type: 'text' | 'tool_use';
    text?: string;
    id?: string;
    name?: string;
    input?: Record<string, unknown>;
  }

  export interface Usage {
    input_tokens: number;
    output_tokens: number;
  }

  export interface StreamEvent {
    type: string;
    index?: number;
    delta?: {
      type: string;
      text?: string;
    };
  }
}
