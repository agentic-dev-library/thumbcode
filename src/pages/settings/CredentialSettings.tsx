/**
 * Credential Settings Page
 *
 * Manage API keys and connected services.
 * Uses CredentialService for secure storage (Capacitor SecureStorage on native,
 * AES-GCM encrypted sessionStorage on web).
 */

import { ArrowLeft, Check, Link as LinkIcon, Loader2, Shield, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CredentialService } from '@/core';
import type { CredentialMetadata } from '@/state';
import { selectCredentialByProvider, toast, useCredentialStore, useUserStore } from '@/state';

interface ApiKeyInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isSet: boolean;
  isSaving: boolean;
  error?: string;
}

function ApiKeyInput({
  label,
  placeholder,
  value,
  onChange,
  onSave,
  isSet,
  isSaving,
  error,
}: Readonly<ApiKeyInputProps>) {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-body">{label}</span>
        {isSet && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-organic-badge bg-teal-500/20 text-teal-400">
            <Check size={12} />
            Set
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="password"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim() && !isSaving) onSave();
          }}
          className="flex-1 bg-charcoal border border-neutral-700 text-white font-mono text-sm px-3 py-2 rounded-organic-input placeholder:text-neutral-600 focus:outline-none focus:border-coral-500 transition-colors"
          data-testid={`api-key-input-${label.toLowerCase().replace(/\s+/g, '-')}`}
        />
        <button
          type="button"
          onClick={onSave}
          disabled={!value.trim() || isSaving}
          className={`px-4 py-2 font-body text-sm font-medium rounded-organic-button transition-colors ${
            !value.trim() || isSaving
              ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
              : 'bg-coral-500 text-white hover:bg-coral-600'
          }`}
          data-testid={`save-${label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
        </button>
      </div>
      {error && (
        <p className="text-sm text-coral-500 font-body mt-1.5 flex items-center gap-1">
          <X size={14} />
          {error}
        </p>
      )}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-neutral-700" />;
}

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
    };
  }
}

export function CredentialSettings() {
  const navigate = useNavigate();

  const githubCredential = useCredentialStore(selectCredentialByProvider('github'));
  const anthropicCredential = useCredentialStore(selectCredentialByProvider('anthropic'));
  const openaiCredential = useCredentialStore(selectCredentialByProvider('openai'));
  const removeCredential = useCredentialStore((s) => s.removeCredential);
  const addCredential = useCredentialStore((s) => s.addCredential);
  const setCredentialStatus = useCredentialStore((s) => s.setCredentialStatus);

  const setAuthenticated = useUserStore((s) => s.setAuthenticated);
  const setGitHubProfile = useUserStore((s) => s.setGitHubProfile);

  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [savingType, setSavingType] = useState<'anthropic' | 'openai' | null>(null);
  const [saveError, setSaveError] = useState<{ type: string; message: string } | null>(null);
  const [isNative, setIsNative] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  useEffect(() => {
    setIsNative(window.Capacitor?.isNativePlatform() ?? false);
  }, []);

  const handleGitHubConnect = () => {
    navigate('/onboarding/github-auth');
  };

  const handleGitHubDisconnect = () => {
    setShowDisconnectConfirm(true);
  };

  const confirmDisconnect = () => {
    if (githubCredential) {
      removeCredential(githubCredential.id);
      setGitHubProfile(null);
      setAuthenticated(false);
    }
    setShowDisconnectConfirm(false);
  };

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: credential save with validation, store, and state updates
  const saveApiKey = async (type: 'anthropic' | 'openai', value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setSavingType(type);
    setSaveError(null);

    try {
      const result = await CredentialService.store(type, trimmed);

      if (!result.isValid) {
        throw new Error(result.message || 'Validation failed');
      }

      // Add to store
      const name = type === 'anthropic' ? 'Anthropic Key' : 'OpenAI Key';
      const maskedValue = CredentialService.maskSecret(trimmed, type);

      const credId = addCredential({
        provider: type,
        name,
        secureStoreKey: `thumbcode_cred_${type}`,
        maskedValue,
        lastValidatedAt: new Date().toISOString(),
        expiresAt: result.expiresAt ? result.expiresAt.toISOString() : undefined,
        metadata: result.metadata as CredentialMetadata['metadata'],
      });

      // Explicitly set status to valid since addCredential defaults to 'unknown'
      setCredentialStatus(credId, 'valid');

      // Clear input on success
      if (type === 'anthropic') setAnthropicKey('');
      if (type === 'openai') setOpenaiKey('');
      toast.success(`${name} saved successfully`);
    } catch (error) {
      setSaveError({
        type,
        message: error instanceof Error ? error.message : 'Validation failed',
      });
    } finally {
      setSavingType(null);
    }
  };

  const githubUsername = githubCredential?.metadata?.username;
  const isGitHubConnected = githubCredential?.status === 'valid';

  return (
    <div className="flex-1 bg-charcoal min-h-screen animate-page-enter">
      {/* Back navigation */}
      <div className="px-4 py-3 border-b border-white/5 glass">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors font-body tap-feedback"
          aria-label="Back to settings"
        >
          <ArrowLeft size={18} />
          <span>Settings</span>
        </button>
      </div>

      <div className="px-6 py-4 border-b border-neutral-800">
        <h1 className="text-xl font-bold text-white font-body">Credentials</h1>
      </div>

      <div className="overflow-y-auto flex-1 px-6 py-6 hide-scrollbar">
        {/* Connected Services */}
        <div className="bg-surface mb-6 rounded-organic-card overflow-hidden shadow-organic-card">
          <div className="px-4 py-3 border-b border-neutral-700">
            <span className="text-sm font-semibold text-neutral-400 font-body">
              CONNECTED SERVICES
            </span>
          </div>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-organic-badge bg-teal-500/20 flex items-center justify-center">
                  <LinkIcon size={18} className="text-teal-400" />
                </div>
                <div>
                  <p className="text-white font-body font-medium">GitHub</p>
                  <p className="text-sm text-neutral-500 font-body">
                    {githubUsername
                      ? `github.com/${githubUsername}`
                      : isGitHubConnected
                        ? 'Connected'
                        : 'Connect to access repositories'}
                  </p>
                </div>
              </div>
              <div>
                {isGitHubConnected ? (
                  <button
                    type="button"
                    onClick={handleGitHubDisconnect}
                    className="px-3 py-1.5 text-sm text-coral-500 border border-coral-500/30 rounded-organic-button font-body hover:bg-coral-500/10 transition-colors"
                    data-testid="disconnect-github"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGitHubConnect}
                    className="px-3 py-1.5 text-sm text-teal-400 border border-teal-500/30 rounded-organic-button font-body hover:bg-teal-500/10 transition-colors"
                    data-testid="connect-github"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-surface mb-6 rounded-organic-card overflow-hidden shadow-organic-card">
          <div className="px-4 py-3 border-b border-neutral-700">
            <span className="text-sm font-semibold text-neutral-400 font-body">API KEYS</span>
          </div>
          <div className="px-4">
            <ApiKeyInput
              label="Anthropic (Claude)"
              placeholder="sk-ant-..."
              value={anthropicKey}
              onChange={(v) => {
                setAnthropicKey(v);
                if (saveError?.type === 'anthropic') setSaveError(null);
              }}
              onSave={() => saveApiKey('anthropic', anthropicKey)}
              isSet={anthropicCredential?.status === 'valid'}
              isSaving={savingType === 'anthropic'}
              error={saveError?.type === 'anthropic' ? saveError.message : undefined}
            />
            <Divider />
            <ApiKeyInput
              label="OpenAI (Optional)"
              placeholder="sk-..."
              value={openaiKey}
              onChange={(v) => {
                setOpenaiKey(v);
                if (saveError?.type === 'openai') setSaveError(null);
              }}
              onSave={() => saveApiKey('openai', openaiKey)}
              isSet={openaiCredential?.status === 'valid'}
              isSaving={savingType === 'openai'}
              error={saveError?.type === 'openai' ? saveError.message : undefined}
            />
          </div>
        </div>

        {/* Disconnect Confirmation */}
        {showDisconnectConfirm && (
          <div className="bg-coral-500/10 border border-coral-500/20 p-4 mb-6 rounded-organic-card">
            <p className="text-white font-body font-medium mb-2">Disconnect GitHub?</p>
            <p className="text-sm text-neutral-400 font-body mb-4">
              You will need to reconnect to use ThumbCode with GitHub repositories.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDisconnectConfirm(false)}
                className="flex-1 py-2 text-sm font-body text-neutral-300 bg-neutral-800 rounded-organic-button hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDisconnect}
                className="flex-1 py-2 text-sm font-body font-medium text-white bg-coral-500 rounded-organic-button hover:bg-coral-600 transition-colors"
                data-testid="confirm-disconnect"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        {/* Security Info */}
        <div className="bg-teal-500/10 p-4 rounded-organic-card">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <Shield size={18} className="text-teal-400" />
            </div>
            <div className="flex-1">
              <p className="text-teal-400 font-semibold font-body">
                {isNative ? 'Secure Storage' : 'Encrypted Session Storage'}
              </p>
              <p className="text-sm text-teal-400/80 font-body mt-1">
                {isNative
                  ? 'Your API keys are stored securely on your device using hardware-backed encryption. They are never sent to our servers.'
                  : 'Your API keys are encrypted and stored in your browser session. They will be cleared when you close the tab. For maximum security, use the mobile app.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
