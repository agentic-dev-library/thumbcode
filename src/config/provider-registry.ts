/**
 * Provider Capability Registry
 *
 * Tracks which AI SDK providers support which capabilities,
 * enabling capability-aware agent routing and graceful degradation.
 */

export type ProviderCapability =
  | 'textGeneration'
  | 'streaming'
  | 'structuredOutput'
  | 'toolCalling'
  | 'toolStreaming'
  | 'imageInput'
  | 'imageGeneration'
  | 'embeddings'
  | 'promptCaching'
  | 'thinking'
  | 'searchGrounding'
  | 'pdfInput'
  | 'audioInput'
  | 'audioOutput'
  | 'codeExecution';

export type CapabilitySupport = 'full' | 'partial' | 'none';

export interface ProviderCapabilityEntry {
  providerId: string;
  packageName: string;
  displayName: string;
  authEnvVar: string;
  capabilities: Record<ProviderCapability, CapabilitySupport>;
  tier: 1 | 2 | 3 | 4;
  quirks: string[];
}

const ALL_CAPABILITIES: ProviderCapability[] = [
  'textGeneration',
  'streaming',
  'structuredOutput',
  'toolCalling',
  'toolStreaming',
  'imageInput',
  'imageGeneration',
  'embeddings',
  'promptCaching',
  'thinking',
  'searchGrounding',
  'pdfInput',
  'audioInput',
  'audioOutput',
  'codeExecution',
];

function caps(
  overrides: Partial<Record<ProviderCapability, CapabilitySupport>>
): Record<ProviderCapability, CapabilitySupport> {
  const base: Record<string, CapabilitySupport> = {};
  for (const cap of ALL_CAPABILITIES) {
    base[cap] = 'none';
  }
  return { ...base, ...overrides } as Record<ProviderCapability, CapabilitySupport>;
}

// --- Tier 4: Full-featured providers ---

const openai: ProviderCapabilityEntry = {
  providerId: 'openai',
  packageName: '@ai-sdk/openai',
  displayName: 'OpenAI',
  authEnvVar: 'OPENAI_API_KEY',
  capabilities: caps({
    textGeneration: 'full',
    streaming: 'full',
    structuredOutput: 'full',
    toolCalling: 'full',
    toolStreaming: 'full',
    imageInput: 'full',
    imageGeneration: 'full',
    embeddings: 'full',
    promptCaching: 'full',
    thinking: 'full',
    searchGrounding: 'full',
    pdfInput: 'full',
    audioInput: 'full',
    audioOutput: 'full',
    codeExecution: 'full',
  }),
  tier: 4,
  quirks: [
    'optional fields become nullable in structured output schemas',
    'max 20 tool calls per streaming chunk',
    'reasoning tokens count toward max_tokens',
  ],
};

const anthropic: ProviderCapabilityEntry = {
  providerId: 'anthropic',
  packageName: '@ai-sdk/anthropic',
  displayName: 'Anthropic',
  authEnvVar: 'ANTHROPIC_API_KEY',
  capabilities: caps({
    textGeneration: 'full',
    streaming: 'full',
    structuredOutput: 'full',
    toolCalling: 'full',
    toolStreaming: 'full',
    imageInput: 'full',
    imageGeneration: 'none',
    embeddings: 'none',
    promptCaching: 'full',
    thinking: 'full',
    searchGrounding: 'full',
    pdfInput: 'full',
    audioInput: 'none',
    audioOutput: 'none',
    codeExecution: 'full',
  }),
  tier: 4,
  quirks: [
    'prompt caching requires beta header',
    'thinking budgetTokens required when thinking enabled',
    'max 128 tool_use blocks per response',
    'PDF input via base64 only',
  ],
};

const google: ProviderCapabilityEntry = {
  providerId: 'google',
  packageName: '@ai-sdk/google',
  displayName: 'Google GenAI',
  authEnvVar: 'GOOGLE_GENERATIVE_AI_API_KEY',
  capabilities: caps({
    textGeneration: 'full',
    streaming: 'full',
    structuredOutput: 'full',
    toolCalling: 'full',
    toolStreaming: 'full',
    imageInput: 'full',
    imageGeneration: 'full',
    embeddings: 'full',
    promptCaching: 'full',
    thinking: 'full',
    searchGrounding: 'full',
    pdfInput: 'full',
    audioInput: 'full',
    audioOutput: 'none',
    codeExecution: 'full',
  }),
  tier: 4,
  quirks: [
    'z.union() and z.intersection() unsupported in structured output schemas',
    'searchGrounding via googleSearchRetrievalTool()',
    'structured output may not work with all models',
    'caching requires stable content prefix',
  ],
};

const azure: ProviderCapabilityEntry = {
  providerId: 'azure',
  packageName: '@ai-sdk/azure',
  displayName: 'Azure OpenAI',
  authEnvVar: 'AZURE_API_KEY',
  capabilities: caps({
    textGeneration: 'full',
    streaming: 'full',
    structuredOutput: 'full',
    toolCalling: 'full',
    toolStreaming: 'full',
    imageInput: 'full',
    imageGeneration: 'full',
    embeddings: 'full',
    promptCaching: 'partial',
    thinking: 'full',
    searchGrounding: 'partial',
    pdfInput: 'full',
    audioInput: 'full',
    audioOutput: 'full',
    codeExecution: 'none',
  }),
  tier: 4,
  quirks: [
    'requires AZURE_RESOURCE_NAME and AZURE_API_KEY',
    'model deployments use custom names, not standard model IDs',
    'feature availability depends on deployment region',
    'prompt caching depends on deployment configuration',
  ],
};

const xai: ProviderCapabilityEntry = {
  providerId: 'xai',
  packageName: '@ai-sdk/xai',
  displayName: 'xAI (Grok)',
  authEnvVar: 'XAI_API_KEY',
  capabilities: caps({
    textGeneration: 'full',
    streaming: 'full',
    structuredOutput: 'full',
    toolCalling: 'full',
    toolStreaming: 'full',
    imageInput: 'full',
    imageGeneration: 'full',
    embeddings: 'full',
    promptCaching: 'none',
    thinking: 'full',
    searchGrounding: 'full',
    pdfInput: 'none',
    audioInput: 'none',
    audioOutput: 'none',
    codeExecution: 'none',
  }),
  tier: 4,
  quirks: [
    'live search grounding via Grok models',
    'image generation via Aurora model',
    'newer models required for structured output',
  ],
};

// --- Tier 3: Advanced providers ---

const amazonBedrock: ProviderCapabilityEntry = {
  providerId: 'amazon-bedrock',
  packageName: '@ai-sdk/amazon-bedrock',
  displayName: 'Amazon Bedrock',
  authEnvVar: 'AWS_ACCESS_KEY_ID',
  capabilities: caps({
    textGeneration: 'full',
    streaming: 'full',
    structuredOutput: 'full',
    toolCalling: 'full',
    toolStreaming: 'partial',
    imageInput: 'full',
    imageGeneration: 'full',
    embeddings: 'full',
    promptCaching: 'partial',
    thinking: 'partial',
    searchGrounding: 'none',
    pdfInput: 'partial',
    audioInput: 'none',
    audioOutput: 'none',
    codeExecution: 'none',
  }),
  tier: 3,
  quirks: [
    'requires AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION',
    'capabilities vary significantly by underlying model provider',
    'prompt caching only for Anthropic models on Bedrock',
    'thinking support only for Claude models',
  ],
};

// --- Tier 2: Standard providers ---

const mistral: ProviderCapabilityEntry = {
  providerId: 'mistral',
  packageName: '@ai-sdk/mistral',
  displayName: 'Mistral',
  authEnvVar: 'MISTRAL_API_KEY',
  capabilities: caps({
    textGeneration: 'full',
    streaming: 'full',
    structuredOutput: 'full',
    toolCalling: 'full',
    toolStreaming: 'full',
    imageInput: 'partial',
    imageGeneration: 'none',
    embeddings: 'full',
    promptCaching: 'none',
    thinking: 'none',
    searchGrounding: 'none',
    pdfInput: 'none',
    audioInput: 'none',
    audioOutput: 'none',
    codeExecution: 'none',
  }),
  tier: 2,
  quirks: [
    'vision only available with Pixtral models',
    'tool streaming requires Mistral Large or newer',
    'structured output via JSON mode',
  ],
};

const cohere: ProviderCapabilityEntry = {
  providerId: 'cohere',
  packageName: '@ai-sdk/cohere',
  displayName: 'Cohere',
  authEnvVar: 'COHERE_API_KEY',
  capabilities: caps({
    textGeneration: 'full',
    streaming: 'full',
    structuredOutput: 'full',
    toolCalling: 'full',
    toolStreaming: 'none',
    imageInput: 'none',
    imageGeneration: 'none',
    embeddings: 'full',
    promptCaching: 'none',
    thinking: 'none',
    searchGrounding: 'full',
    pdfInput: 'none',
    audioInput: 'none',
    audioOutput: 'none',
    codeExecution: 'none',
  }),
  tier: 2,
  quirks: [
    'RAG-native with built-in search grounding via connectors',
    'tool streaming not supported',
    'embeddings are a core strength with Embed v3',
  ],
};

const groq: ProviderCapabilityEntry = {
  providerId: 'groq',
  packageName: '@ai-sdk/groq',
  displayName: 'Groq',
  authEnvVar: 'GROQ_API_KEY',
  capabilities: caps({
    textGeneration: 'full',
    streaming: 'full',
    structuredOutput: 'partial',
    toolCalling: 'full',
    toolStreaming: 'partial',
    imageInput: 'partial',
    imageGeneration: 'none',
    embeddings: 'none',
    promptCaching: 'none',
    thinking: 'partial',
    searchGrounding: 'none',
    pdfInput: 'none',
    audioInput: 'partial',
    audioOutput: 'none',
    codeExecution: 'none',
  }),
  tier: 2,
  quirks: [
    'structured output only with newer models (Llama 3.1+)',
    'vision only with Llama 4 Scout and compatible models',
    'extremely fast inference but limited model selection',
    'audio input via Whisper models only',
    'thinking support with QwQ model',
  ],
};

const deepseek: ProviderCapabilityEntry = {
  providerId: 'deepseek',
  packageName: '@ai-sdk/deepseek',
  displayName: 'DeepSeek',
  authEnvVar: 'DEEPSEEK_API_KEY',
  capabilities: caps({
    textGeneration: 'full',
    streaming: 'full',
    structuredOutput: 'full',
    toolCalling: 'full',
    toolStreaming: 'none',
    imageInput: 'none',
    imageGeneration: 'none',
    embeddings: 'none',
    promptCaching: 'full',
    thinking: 'full',
    searchGrounding: 'none',
    pdfInput: 'none',
    audioInput: 'none',
    audioOutput: 'none',
    codeExecution: 'none',
  }),
  tier: 2,
  quirks: [
    'prompt caching is automatic and free',
    'thinking via DeepSeek-R1 model',
    'tool calling not available when thinking is enabled',
    'FIM (fill-in-middle) completion supported',
  ],
};

// --- Provider Registry ---

export const PROVIDER_REGISTRY: ReadonlyArray<ProviderCapabilityEntry> = [
  openai,
  anthropic,
  google,
  azure,
  xai,
  amazonBedrock,
  mistral,
  cohere,
  groq,
  deepseek,
];

const registryMap = new Map<string, ProviderCapabilityEntry>(
  PROVIDER_REGISTRY.map((p) => [p.providerId, p])
);

// --- Query Functions ---

export function getProvider(providerId: string): ProviderCapabilityEntry | undefined {
  return registryMap.get(providerId);
}

export function supportsCapability(providerId: string, cap: ProviderCapability): boolean {
  const provider = registryMap.get(providerId);
  if (!provider) return false;
  return provider.capabilities[cap] !== 'none';
}

export function getProvidersWithCapability(cap: ProviderCapability): ProviderCapabilityEntry[] {
  return PROVIDER_REGISTRY.filter((p) => p.capabilities[cap] !== 'none');
}

export function getProviderTier(providerId: string): number {
  const provider = registryMap.get(providerId);
  return provider?.tier ?? 0;
}

export function validateProviderForTask(
  providerId: string,
  required: ProviderCapability[]
): { valid: boolean; missing: ProviderCapability[] } {
  const provider = registryMap.get(providerId);
  if (!provider) {
    return { valid: false, missing: required };
  }
  const missing = required.filter((cap) => provider.capabilities[cap] === 'none');
  return { valid: missing.length === 0, missing };
}
