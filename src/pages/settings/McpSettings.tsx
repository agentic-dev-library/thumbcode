/**
 * MCP Settings Page
 *
 * Manage MCP (Model Context Protocol) server connections.
 * Shows connected servers, curated suggestions for one-tap setup,
 * and a form to add custom servers.
 */

import {
  ArrowLeft,
  BookOpen,
  Brain,
  Check,
  GitBranch,
  MonitorPlay,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { McpCategory, McpServerConfig } from '@/state';
import { CURATED_SUGGESTIONS, selectServers, useMcpStore } from '@/state';

const CATEGORY_LABELS: Record<McpCategory, string> = {
  docs: 'Docs',
  code: 'Code',
  design: 'Design',
  testing: 'Testing',
  general: 'General',
};

const CATEGORY_COLORS: Record<McpCategory, string> = {
  docs: 'bg-teal-500/20 text-teal-400',
  code: 'bg-coral-500/20 text-coral-400',
  design: 'bg-gold-400/20 text-gold-400',
  testing: 'bg-teal-500/20 text-teal-400',
  general: 'bg-neutral-500/20 text-neutral-400',
};

const STATUS_COLORS: Record<McpServerConfig['status'], string> = {
  connected: 'bg-teal-500',
  disconnected: 'bg-neutral-500',
  error: 'bg-coral-500',
};

function getSuggestionIcon(iconName: string) {
  switch (iconName) {
    case 'book-open':
      return BookOpen;
    case 'git-branch':
      return GitBranch;
    case 'sparkles':
      return Sparkles;
    case 'monitor-play':
      return MonitorPlay;
    case 'brain':
      return Brain;
    default:
      return Plus;
  }
}

function CategoryBadge({ category }: Readonly<{ category: McpCategory }>) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium font-body rounded-organic-badge ${CATEGORY_COLORS[category]}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

function ConnectedServerCard({
  server,
  onRemove,
}: Readonly<{ server: McpServerConfig; onRemove: () => void }>) {
  return (
    <div
      className="bg-surface-elevated p-4 rounded-organic-card shadow-organic-card mb-3"
      style={{ transform: 'rotate(-0.2deg)' }}
      data-testid={`server-card-${server.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-organic-badge bg-charcoal flex items-center justify-center">
              <span className="text-white font-body font-medium text-sm">
                {server.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-elevated ${STATUS_COLORS[server.status]}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-body font-medium truncate">{server.name}</span>
              <CategoryBadge category={server.category} />
            </div>
            <span className="text-sm text-neutral-500 font-body">
              {server.capabilities.length} tool{server.capabilities.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-neutral-500 hover:text-coral-500 transition-colors rounded-organic-button hover:bg-coral-500/10"
          aria-label={`Remove ${server.name}`}
          data-testid={`remove-server-${server.id}`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function SuggestionCard({
  suggestion,
  isAdded,
  onConnect,
}: Readonly<{
  suggestion: (typeof CURATED_SUGGESTIONS)[number];
  isAdded: boolean;
  onConnect: () => void;
}>) {
  const Icon = getSuggestionIcon(suggestion.icon);

  return (
    <div
      className="bg-surface p-4 rounded-organic-card shadow-organic-card"
      style={{ transform: 'rotate(0.2deg)' }}
      data-testid={`suggestion-${suggestion.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-organic-badge bg-surface-elevated flex items-center justify-center shrink-0">
          <Icon size={18} className="text-teal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-body font-medium">{suggestion.name}</span>
            <CategoryBadge category={suggestion.category} />
          </div>
          <p className="text-sm text-neutral-500 font-body mb-2">{suggestion.description}</p>
          {suggestion.envKeys.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {suggestion.envKeys.map((key) => (
                <span
                  key={key}
                  className="text-xs font-mono text-neutral-500 bg-charcoal px-1.5 py-0.5 rounded"
                >
                  {key}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onConnect}
          disabled={isAdded}
          className={`px-3 py-1.5 text-sm font-body font-medium rounded-organic-button transition-colors shrink-0 ${
            isAdded
              ? 'bg-teal-500/20 text-teal-400 cursor-default'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          }`}
          data-testid={`connect-${suggestion.id}`}
        >
          {isAdded ? (
            <span className="flex items-center gap-1">
              <Check size={14} />
              Added
            </span>
          ) : (
            'Connect'
          )}
        </button>
      </div>
    </div>
  );
}

export function McpSettings() {
  const navigate = useNavigate();
  const servers = useMcpStore(selectServers);
  const addServer = useMcpStore((s) => s.addServer);
  const removeServer = useMcpStore((s) => s.removeServer);

  // Custom server form state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCommand, setCustomCommand] = useState('');
  const [customArgs, setCustomArgs] = useState('');
  const [customEnv, setCustomEnv] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const addedSuggestionNames = new Set(servers.map((s) => s.name));

  const handleConnectSuggestion = (suggestion: (typeof CURATED_SUGGESTIONS)[number]) => {
    addServer({
      name: suggestion.name,
      description: suggestion.description,
      command: suggestion.command,
      args: suggestion.args,
      env: {},
      capabilities: [],
      icon: suggestion.icon,
      category: suggestion.category,
    });
  };

  const handleRemoveServer = (serverId: string) => {
    removeServer(serverId);
  };

  const handleAddCustom = () => {
    setFormError(null);

    if (!customName.trim()) {
      setFormError('Server name is required');
      return;
    }
    if (!customCommand.trim()) {
      setFormError('Command is required');
      return;
    }

    let envObj: Record<string, string> = {};
    if (customEnv.trim()) {
      try {
        envObj = JSON.parse(customEnv.trim());
      } catch {
        setFormError('Environment variables must be valid JSON (e.g. {"KEY": "value"})');
        return;
      }
    }

    addServer({
      name: customName.trim(),
      description: 'Custom MCP server',
      command: customCommand.trim(),
      args: customArgs
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      env: envObj,
      capabilities: [],
      category: 'general',
    });

    // Reset form
    setCustomName('');
    setCustomCommand('');
    setCustomArgs('');
    setCustomEnv('');
    setShowCustomForm(false);
  };

  return (
    <div className="flex-1 bg-charcoal min-h-screen">
      {/* Back navigation */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors font-body"
          aria-label="Back to settings"
        >
          <ArrowLeft size={18} />
          <span>Settings</span>
        </button>
      </div>

      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-800">
        <h1 className="text-xl font-bold text-white font-body">MCP Servers</h1>
        <p className="text-sm text-neutral-500 font-body mt-1">
          Extend agent capabilities with Model Context Protocol servers
        </p>
      </div>

      <div className="overflow-y-auto flex-1 px-6 py-6">
        {/* Connected Servers */}
        {servers.length > 0 && (
          <div className="mb-6">
            <div className="bg-surface rounded-organic-card shadow-organic-card overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-700">
                <span className="text-sm font-semibold text-neutral-400 font-body">
                  CONNECTED SERVERS
                </span>
              </div>
              <div className="p-4">
                {servers.map((server) => (
                  <ConnectedServerCard
                    key={server.id}
                    server={server}
                    onRemove={() => handleRemoveServer(server.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggested Servers */}
        <div className="mb-6">
          <div className="bg-surface rounded-organic-card shadow-organic-card overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-700">
              <span className="text-sm font-semibold text-neutral-400 font-body">
                SUGGESTED SERVERS
              </span>
            </div>
            <div className="p-4 space-y-3">
              {CURATED_SUGGESTIONS.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  isAdded={addedSuggestionNames.has(suggestion.name)}
                  onConnect={() => handleConnectSuggestion(suggestion)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Add Custom Server */}
        <div className="bg-surface rounded-organic-card shadow-organic-card overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-700">
            <span className="text-sm font-semibold text-neutral-400 font-body">CUSTOM SERVER</span>
          </div>
          <div className="p-4">
            {!showCustomForm ? (
              <button
                type="button"
                onClick={() => setShowCustomForm(true)}
                className="w-full py-3 border border-dashed border-neutral-600 rounded-organic-button text-neutral-400 font-body hover:border-teal-500 hover:text-teal-400 transition-colors flex items-center justify-center gap-2"
                data-testid="add-custom-server"
              >
                <Plus size={16} />
                Add Custom Server
              </button>
            ) : (
              <div className="space-y-3" data-testid="custom-server-form">
                <div>
                  <label
                    htmlFor="custom-name"
                    className="block text-sm text-neutral-400 font-body mb-1"
                  >
                    Name
                  </label>
                  <input
                    id="custom-name"
                    type="text"
                    placeholder="My MCP Server"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-charcoal border border-neutral-700 text-white font-body text-sm px-3 py-2 rounded-organic-input placeholder:text-neutral-600 focus:outline-none focus:border-teal-500 transition-colors"
                    data-testid="custom-name-input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="custom-command"
                    className="block text-sm text-neutral-400 font-body mb-1"
                  >
                    Command
                  </label>
                  <input
                    id="custom-command"
                    type="text"
                    placeholder="npx -y @your/mcp-server"
                    value={customCommand}
                    onChange={(e) => setCustomCommand(e.target.value)}
                    className="w-full bg-charcoal border border-neutral-700 text-white font-mono text-sm px-3 py-2 rounded-organic-input placeholder:text-neutral-600 focus:outline-none focus:border-teal-500 transition-colors"
                    data-testid="custom-command-input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="custom-args"
                    className="block text-sm text-neutral-400 font-body mb-1"
                  >
                    Arguments (comma-separated)
                  </label>
                  <input
                    id="custom-args"
                    type="text"
                    placeholder="--port, 3000"
                    value={customArgs}
                    onChange={(e) => setCustomArgs(e.target.value)}
                    className="w-full bg-charcoal border border-neutral-700 text-white font-mono text-sm px-3 py-2 rounded-organic-input placeholder:text-neutral-600 focus:outline-none focus:border-teal-500 transition-colors"
                    data-testid="custom-args-input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="custom-env"
                    className="block text-sm text-neutral-400 font-body mb-1"
                  >
                    Environment Variables (JSON)
                  </label>
                  <input
                    id="custom-env"
                    type="text"
                    placeholder='{"API_KEY": "your-key"}'
                    value={customEnv}
                    onChange={(e) => setCustomEnv(e.target.value)}
                    className="w-full bg-charcoal border border-neutral-700 text-white font-mono text-sm px-3 py-2 rounded-organic-input placeholder:text-neutral-600 focus:outline-none focus:border-teal-500 transition-colors"
                    data-testid="custom-env-input"
                  />
                </div>

                {formError && (
                  <p className="text-sm text-coral-500 font-body flex items-center gap-1">
                    <X size={14} />
                    {formError}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className="flex-1 py-2.5 bg-teal-600 text-white font-body font-medium text-sm rounded-organic-button hover:bg-teal-700 transition-colors"
                    data-testid="save-custom-server"
                  >
                    Add Server
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomForm(false);
                      setFormError(null);
                    }}
                    className="flex-1 py-2.5 bg-surface-elevated text-neutral-400 font-body font-medium text-sm rounded-organic-button hover:bg-neutral-700 transition-colors"
                    data-testid="cancel-custom-server"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
