/**
 * ProviderConfig Page Tests
 *
 * Verifies the provider configuration page renders all providers,
 * capability badges, toggle controls, and API key inputs.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProviderConfig } from '../ProviderConfig';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockAddCredential = vi.fn(() => 'cred-test-1');
let mockCredentials: Array<{
  id: string;
  provider: string;
  name: string;
  secureStoreKey: string;
  status: string;
  createdAt: string;
}> = [];

vi.mock('@thumbcode/state', () => ({
  useCredentialStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      credentials: mockCredentials,
      addCredential: mockAddCredential,
    }),
}));

vi.mock('@thumbcode/config', () => ({
  PROVIDER_REGISTRY: [
    {
      providerId: 'openai',
      packageName: '@ai-sdk/openai',
      displayName: 'OpenAI',
      authEnvVar: 'OPENAI_API_KEY',
      tier: 4,
      quirks: ['max 20 tool calls per streaming chunk'],
      capabilities: {
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
      },
    },
    {
      providerId: 'anthropic',
      packageName: '@ai-sdk/anthropic',
      displayName: 'Anthropic',
      authEnvVar: 'ANTHROPIC_API_KEY',
      tier: 4,
      quirks: ['prompt caching requires beta header'],
      capabilities: {
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
      },
    },
    {
      providerId: 'groq',
      packageName: '@ai-sdk/groq',
      displayName: 'Groq',
      authEnvVar: 'GROQ_API_KEY',
      tier: 2,
      quirks: ['extremely fast inference'],
      capabilities: {
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
      },
    },
  ],
}));

describe('ProviderConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCredentials = [];
  });

  it('renders the page header', () => {
    render(<ProviderConfig />);
    expect(screen.getByText('AI Providers')).toBeInTheDocument();
    expect(screen.getByText('Configure AI provider API keys and capabilities')).toBeInTheDocument();
  });

  it('renders all providers from registry', () => {
    render(<ProviderConfig />);
    expect(screen.getByText('OpenAI')).toBeInTheDocument();
    expect(screen.getByText('Anthropic')).toBeInTheDocument();
    expect(screen.getByText('Groq')).toBeInTheDocument();
  });

  it('renders tier group headings', () => {
    render(<ProviderConfig />);
    expect(screen.getByText('TIER 4: FULL-FEATURED')).toBeInTheDocument();
    expect(screen.getByText('TIER 2: STANDARD')).toBeInTheDocument();
  });

  it('shows package names for each provider', () => {
    render(<ProviderConfig />);
    expect(screen.getByText('@ai-sdk/openai')).toBeInTheDocument();
    expect(screen.getByText('@ai-sdk/anthropic')).toBeInTheDocument();
    expect(screen.getByText('@ai-sdk/groq')).toBeInTheDocument();
  });

  it('toggles provider enable state', () => {
    render(<ProviderConfig />);
    const toggle = screen.getByTestId('toggle-openai');
    expect(toggle).not.toBeChecked();

    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
  });

  it('shows capabilities when expanded', () => {
    render(<ProviderConfig />);

    // Expand OpenAI
    const expandBtn = screen.getByTestId('expand-openai');
    fireEvent.click(expandBtn);

    expect(screen.getByText('CAPABILITIES')).toBeInTheDocument();
    expect(screen.getByTestId('capability-textGeneration')).toBeInTheDocument();
    expect(screen.getByTestId('capability-streaming')).toBeInTheDocument();
  });

  it('shows provider quirks when expanded', () => {
    render(<ProviderConfig />);

    const expandBtn = screen.getByTestId('expand-openai');
    fireEvent.click(expandBtn);

    expect(screen.getByText('NOTES')).toBeInTheDocument();
    expect(screen.getByText('max 20 tool calls per streaming chunk')).toBeInTheDocument();
  });

  it('shows API key input when provider is enabled and expanded', () => {
    render(<ProviderConfig />);

    // Enable and expand OpenAI
    fireEvent.click(screen.getByTestId('toggle-openai'));
    fireEvent.click(screen.getByTestId('expand-openai'));

    expect(screen.getByTestId('api-key-openai')).toBeInTheDocument();
    expect(screen.getByText('API KEY (OPENAI_API_KEY)')).toBeInTheDocument();
  });

  it('navigates back to settings on back button click', () => {
    render(<ProviderConfig />);
    fireEvent.click(screen.getByLabelText('Back to settings'));
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });

  it('saves API key through credential store', () => {
    render(<ProviderConfig />);

    // Enable and expand OpenAI
    fireEvent.click(screen.getByTestId('toggle-openai'));
    fireEvent.click(screen.getByTestId('expand-openai'));

    // Type API key
    const input = screen.getByTestId('api-key-openai');
    fireEvent.change(input, { target: { value: 'sk-test-key-12345' } });

    // Save
    const saveBtn = screen.getByTestId('save-key-openai');
    fireEvent.click(saveBtn);

    expect(mockAddCredential).toHaveBeenCalledWith({
      provider: 'openai',
      name: 'OpenAI',
      secureStoreKey: 'credential-openai',
      maskedValue: 'sk-t...2345',
    });
  });

  it('shows Active badge when provider has credentials', () => {
    mockCredentials = [
      {
        id: 'cred-1',
        provider: 'anthropic',
        name: 'Anthropic',
        secureStoreKey: 'credential-anthropic',
        status: 'valid',
        createdAt: new Date().toISOString(),
      },
    ];

    render(<ProviderConfig />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('does not save when API key is empty', () => {
    render(<ProviderConfig />);

    // Enable and expand OpenAI
    fireEvent.click(screen.getByTestId('toggle-openai'));
    fireEvent.click(screen.getByTestId('expand-openai'));

    // Try to save with empty key
    const saveBtn = screen.getByTestId('save-key-openai');
    fireEvent.click(saveBtn);

    expect(mockAddCredential).not.toHaveBeenCalled();
  });
});
