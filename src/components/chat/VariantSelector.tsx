/**
 * Variant Selector Component
 *
 * Displays generated variants in a horizontal scrollable row.
 * Each card shows the variant name, provider badge, approach description,
 * and token count. Users can expand to see full content and select a variant.
 * Uses organic daube styling.
 */

import type { VariantSetMessage } from '@thumbcode/state';
import { useCallback, useState } from 'react';
import { Text } from '@/components/ui';

/** Provider brand color map */
const PROVIDER_COLORS: Record<string, { bg: string; text: string }> = {
  anthropic: { bg: 'bg-coral-500', text: 'text-white' },
  openai: { bg: 'bg-teal-600', text: 'text-white' },
  google: { bg: 'bg-gold-400', text: 'text-charcoal' },
  mistral: { bg: 'bg-neutral-600', text: 'text-white' },
};

function getProviderStyle(provider: string): { bg: string; text: string } {
  return PROVIDER_COLORS[provider.toLowerCase()] ?? PROVIDER_COLORS.mistral;
}

/** Props for the VariantSelector component */
interface VariantSelectorProps {
  /** The variant set message to display */
  message: VariantSetMessage;
  /** Called when the user selects a variant */
  onSelect: (variantId: string) => void;
}

export function VariantSelector({ message, onSelect }: Readonly<VariantSelectorProps>) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { variants, selectedVariantId } = message.metadata;

  const handleToggleExpand = useCallback((variantId: string) => {
    setExpandedId((prev) => (prev === variantId ? null : variantId));
  }, []);

  const handleSelect = useCallback(
    (variantId: string) => {
      onSelect(variantId);
    },
    [onSelect]
  );

  return (
    <div className="w-full max-w-full">
      <Text className="font-body text-sm text-neutral-400 mb-2 px-1">
        {selectedVariantId
          ? 'Variant selected'
          : `${variants.length} variants generated — tap to expand, then select`}
      </Text>
      <div
        className="flex flex-row gap-3 overflow-x-auto pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {variants.map((variant, index) => {
          const isExpanded = expandedId === variant.id;
          const isSelected = selectedVariantId === variant.id;
          const providerStyle = getProviderStyle(variant.provider);

          return (
            <div
              key={variant.id}
              className={`flex-shrink-0 bg-surface-elevated rounded-organic-card shadow-organic transition-all ${
                isSelected ? 'border-2 border-teal-500' : 'border border-neutral-700'
              }`}
              style={{
                width: 280,
                scrollSnapAlign: 'start',
                transform: `rotate(${index % 2 === 0 ? '-0.3' : '0.3'}deg)`,
              }}
            >
              {/* Clickable card header for expand/collapse */}
              <button
                type="button"
                onClick={() => handleToggleExpand(variant.id)}
                className="w-full p-4 text-left cursor-pointer"
                aria-label={`Variant: ${variant.name}`}
                aria-expanded={isExpanded}
              >
                {/* Header: name + provider badge */}
                <div className="flex flex-row items-center justify-between mb-2">
                  <Text className="font-display text-sm text-white font-semibold flex-1 mr-2">
                    {variant.name}
                  </Text>
                  <div className={`px-2 py-0.5 rounded-organic-badge ${providerStyle.bg}`}>
                    <Text className={`text-xs font-body font-medium ${providerStyle.text}`}>
                      {variant.provider}
                    </Text>
                  </div>
                </div>

                {/* Description */}
                <Text className="font-body text-xs text-neutral-400 mb-2">
                  {variant.description}
                </Text>

                {/* Token count + model */}
                <div className="flex flex-row items-center justify-between">
                  <Text className="font-mono text-xs text-neutral-500">
                    {variant.tokensUsed.toLocaleString()} tokens
                  </Text>
                  <Text className="font-mono text-xs text-neutral-500">{variant.model}</Text>
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-3 border-t border-neutral-700">
                  <Text
                    className="font-body text-sm text-neutral-200 mb-3"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {variant.content.length > 500
                      ? `${variant.content.slice(0, 500)}...`
                      : variant.content}
                  </Text>
                  {!selectedVariantId && (
                    <button
                      type="button"
                      onClick={() => handleSelect(variant.id)}
                      className="w-full px-4 py-2 bg-teal-600 active:bg-teal-700 rounded-organic-button"
                      aria-label={`Select ${variant.name}`}
                    >
                      <Text className="font-body text-sm text-white font-semibold text-center">
                        Select this variant
                      </Text>
                    </button>
                  )}
                </div>
              )}

              {/* Selected indicator */}
              {isSelected && (
                <div className="mx-4 mb-4 pt-2 border-t border-teal-500">
                  <Text className="font-body text-xs text-teal-400 text-center">Selected</Text>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
