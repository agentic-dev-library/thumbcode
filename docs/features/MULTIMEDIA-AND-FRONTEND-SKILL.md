# ThumbCode: Multimedia Capabilities & Frontend Agent Skill

> **Date**: February 23, 2026
> **Status**: Architecture Proposal
> **Author**: Engineering Team
> **Scope**: Two major feature additions for the next development wave
> **Depends on**: Core engine must be functional first (v1.0 consolidation)

---

## Executive Summary

ThumbCode runs on phones but has zero multimedia support and no frontend specialization for its agents. This document designs two interconnected features:

1. **Multimedia Capabilities** -- Camera, photo library, voice input, screenshot capture, file/document input, image display, live preview, and TTS output.
2. **Frontend Agent Skill** -- A specialized skill system that makes the Implementer agent design-system-aware, enables screenshot-to-code workflows, and provides live component preview.

These features transform ThumbCode from a text-only chat interface into a true mobile-native development platform where users can photograph a whiteboard sketch, say "build this", and watch an agent generate brand-compliant components with live preview.

---

## Part 1: Multimedia Capabilities

### 1.1 Capability Matrix

| Capability | Direction | Capacitor Plugin | AI SDK Support | Priority | Version |
|-----------|-----------|-----------------|----------------|----------|---------|
| Camera capture (photo) | Input | `@capacitor/camera` | Anthropic vision, OpenAI vision | P0 | v1.0 |
| Photo library picker | Input | `@capacitor/camera` (source: Photos) | Anthropic vision, OpenAI vision | P0 | v1.0 |
| Voice input (STT) | Input | `@capacitor-community/speech-recognition` | Text passthrough | P1 | v1.0 |
| File/document picker | Input | `@capawesome/capacitor-file-picker` | PDF: text extract; images: vision | P1 | v1.0 |
| Screenshot capture | Input | `@capawesome/capacitor-screenshot` | Anthropic vision, OpenAI vision | P2 | v1.1 |
| Image display (agent output) | Output | N/A (web `<img>`) | Both providers return image URLs/base64 | P0 | v1.0 |
| Code preview (live) | Output | Sandboxed `<iframe>` | N/A (rendering layer) | P1 | v1.1 |
| Audio output (TTS) | Output | `@capacitor-community/text-to-speech` | N/A (client-side synthesis) | P2 | v1.1 |

### 1.2 Plugin Architecture

#### 1.2.1 `@capacitor/camera` -- Camera & Photo Library

Already in the project's Capacitor ecosystem (Capacitor 8.1.x is installed). This plugin provides:

- `Camera.getPhoto()` -- Launch camera or photo picker
- Returns image as base64, URI, or data URL
- Supports `quality`, `allowEditing`, `resultType`, `source` (Camera | Photos | Prompt)
- PWA Elements required for web fallback

**Integration point**: The `CameraResultType.Base64` output maps directly to Anthropic's `image` content block format and OpenAI's `image_url` with `data:image/jpeg;base64,...` encoding.

**Installation**:
```bash
pnpm add @capacitor/camera
npx cap sync
```

**Capacitor config addition** (`capacitor.config.ts`):
```typescript
plugins: {
  Camera: {
    // Use native Android photo picker
    androidPhotoPickerResultType: 'uri',
  },
  // ... existing plugins
}
```

**Permissions** (already handled by Capacitor, but needs `Info.plist` / `AndroidManifest.xml`):
- iOS: `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`
- Android: `android.permission.CAMERA`, `android.permission.READ_MEDIA_IMAGES`

#### 1.2.2 `@capacitor-community/speech-recognition` -- Voice Input

Provides real-time speech-to-text on device using native platform APIs (Apple Speech, Android SpeechRecognizer).

**Key API methods**:
- `SpeechRecognition.start({ language, partialResults })` -- Begin listening
- `SpeechRecognition.stop()` -- Stop listening
- `SpeechRecognition.addListener('partialResults', ...)` -- Stream partial transcription
- `SpeechRecognition.addListener('listeningState', ...)` -- Track listening state changes

**Design decision**: Use the Cap-go fork (`@capgo/capacitor-speech-recognition`) which includes punctuation support, segmented sessions, and crash fixes from the most-requested community PRs.

**Installation**:
```bash
pnpm add @capgo/capacitor-speech-recognition
npx cap sync
```

**Permissions**:
- iOS: `NSSpeechRecognitionUsageDescription`, `NSMicrophoneUsageDescription`
- Android: `android.permission.RECORD_AUDIO`

#### 1.2.3 `@capawesome/capacitor-file-picker` -- Document/File Input

Allows selecting files from the device filesystem. Critical for design files, PDFs, and other documents.

**Key API methods**:
- `FilePicker.pickFiles({ types: ['application/pdf', 'image/*'], multiple: true })` -- Launch system picker
- Returns file metadata: `name`, `path`, `mimeType`, `size`, `modifiedAt`
- Read file content via `@capacitor/filesystem` (already installed)

**Installation**:
```bash
pnpm add @capawesome/capacitor-file-picker
npx cap sync
```

#### 1.2.4 `@capawesome/capacitor-screenshot` -- Screenshot Capture

Captures the current app screen as an image. Useful for "share what I'm seeing with the agent".

**Key API methods**:
- `Screenshot.take()` -- Returns base64 string of the current screen

**Installation**:
```bash
pnpm add @capawesome/capacitor-screenshot
npx cap sync
```

#### 1.2.5 `@capacitor-community/text-to-speech` -- Audio Output

Synthesizes speech from agent text responses. Accessibility feature and hands-free mode enabler.

**Key API methods**:
- `TextToSpeech.speak({ text, lang, rate, pitch, volume })` -- Speak text
- `TextToSpeech.stop()` -- Stop speaking
- `TextToSpeech.getSupportedLanguages()` -- Available languages
- `TextToSpeech.getSupportedVoices()` -- Available voices

**Installation**:
```bash
pnpm add @capacitor-community/text-to-speech
npx cap sync
```

### 1.3 Multimodal AI Integration

#### 1.3.1 Current Message Type System

The existing `ContentBlock` type in `src/services/ai/types.ts` supports:

```typescript
export type ContentType = 'text' | 'tool_use' | 'tool_result';

export interface ContentBlock {
  type: ContentType;
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
}
```

This is **text-only**. We need to extend it for multimodal content.

#### 1.3.2 Extended Content Block Types

```typescript
// New content types to add
export type ContentType =
  | 'text'
  | 'tool_use'
  | 'tool_result'
  | 'image'        // NEW: image content
  | 'document'     // NEW: document/file content
  | 'audio';       // NEW: audio content (future)

// Image source for multimodal messages
export interface ImageSource {
  type: 'base64' | 'url' | 'file_id';
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
  /** Base64 data (without data: prefix) */
  data?: string;
  /** URL for remote images */
  url?: string;
  /** File ID for provider-uploaded files */
  fileId?: string;
}

// Extended ContentBlock
export interface ContentBlock {
  type: ContentType;
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
  // NEW: image support
  source?: ImageSource;
  // NEW: document metadata
  document?: {
    name: string;
    mimeType: string;
    size: number;
    extractedText?: string;
  };
}
```

#### 1.3.3 Anthropic Vision API Integration

The Anthropic Messages API accepts images as content blocks:

```typescript
// In anthropic-client.ts formatContentBlocks()
// Add this case:
if (block.type === 'image' && block.source) {
  if (block.source.type === 'base64') {
    return {
      type: 'image' as const,
      source: {
        type: 'base64',
        media_type: block.source.mediaType,
        data: block.source.data!,
      },
    };
  }
  if (block.source.type === 'url') {
    return {
      type: 'image' as const,
      source: {
        type: 'url',
        url: block.source.url!,
      },
    };
  }
}
```

**Supported formats**: JPEG, PNG, GIF, WebP
**Limits**: Up to 100 images per API request, 20MB per image
**Models with vision**: All Claude 3.x and 4.x models

#### 1.3.4 OpenAI Vision API Integration

OpenAI uses a slightly different format with `image_url` in content arrays:

```typescript
// In openai-client.ts message formatting:
if (block.type === 'image' && block.source) {
  if (block.source.type === 'base64') {
    return {
      type: 'image_url',
      image_url: {
        url: `data:${block.source.mediaType};base64,${block.source.data}`,
        detail: 'auto', // or 'low' / 'high'
      },
    };
  }
  if (block.source.type === 'url') {
    return {
      type: 'image_url',
      image_url: {
        url: block.source.url!,
        detail: 'auto',
      },
    };
  }
}
```

**Supported formats**: PNG, JPEG, WebP, non-animated GIF
**Limits**: 50MB total payload, up to 500 images per request
**Models with vision**: GPT-4o, GPT-4o-mini, GPT-4-turbo

### 1.4 Chat Interface Multimodal Extensions

#### 1.4.1 Extended Message Store Types

The `MessageContentType` in `src/state/chatStore.ts` needs expansion:

```typescript
// Current
export type MessageContentType = 'text' | 'code' | 'diff' | 'file_reference' | 'approval_request';

// Extended
export type MessageContentType =
  | 'text'
  | 'code'
  | 'diff'
  | 'file_reference'
  | 'approval_request'
  | 'image'          // NEW: inline image
  | 'mixed_media'    // NEW: text + images combined
  | 'voice_transcript' // NEW: transcribed voice input
  | 'document';      // NEW: attached document/file
```

#### 1.4.2 New Message Interfaces

```typescript
// Image message (user sends photo, agent sends generated image)
export interface ImageMessage extends Message {
  contentType: 'image';
  metadata: {
    imageUri: string;           // Local URI or data URL
    thumbnailUri?: string;      // Compressed thumbnail for list views
    width?: number;
    height?: number;
    mimeType: string;
    source: 'camera' | 'library' | 'screenshot' | 'agent_generated';
    caption?: string;           // User-added or agent-generated caption
  };
}

// Mixed media message (text + multiple images)
export interface MixedMediaMessage extends Message {
  contentType: 'mixed_media';
  metadata: {
    attachments: Array<{
      type: 'image' | 'document';
      uri: string;
      mimeType: string;
      name?: string;
      size?: number;
    }>;
  };
}

// Voice transcript message
export interface VoiceTranscriptMessage extends Message {
  contentType: 'voice_transcript';
  metadata: {
    originalAudioUri?: string;   // Optional: keep the audio
    duration: number;            // Seconds
    confidence: number;          // 0-1 transcription confidence
    language: string;            // BCP 47 tag
  };
}

// Document message
export interface DocumentMessage extends Message {
  contentType: 'document';
  metadata: {
    fileUri: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    extractedText?: string;      // For PDFs: extracted text content
    pageCount?: number;          // For PDFs
    thumbnailUri?: string;       // First page preview
  };
}
```

#### 1.4.3 ChatMessage Component Extensions

The `ChatMessage` component (`src/components/chat/ChatMessage.tsx`) currently handles `text`, `code`, and `approval_request`. New render paths needed:

```typescript
// New render case for image messages
if (message.contentType === 'image') {
  const imageMessage = message as ImageMessage;
  return (
    <div className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className="max-w-[85%]">
        <ImageBubble
          uri={imageMessage.metadata.imageUri}
          caption={imageMessage.metadata.caption}
          source={imageMessage.metadata.source}
          isUser={isUser}
        />
        <Text className="text-xs text-neutral-500 mt-1">
          {formatTime(message.timestamp)}
        </Text>
      </div>
    </div>
  );
}
```

New components needed:
- `src/components/chat/ImageBubble.tsx` -- Renders images in chat with organic styling, tap-to-expand
- `src/components/chat/VoiceInputIndicator.tsx` -- Animated recording indicator
- `src/components/chat/DocumentAttachment.tsx` -- File attachment chip with icon
- `src/components/chat/MediaAttachmentBar.tsx` -- Attachment preview strip above input

#### 1.4.4 ChatInput Enhancement

The current `ChatInput` is text-only. It needs a media action bar:

```
+--------------------------------------------------+
| [Camera] [Gallery] [Mic] [File]  [Screenshot]    |  <-- MediaActionBar
+--------------------------------------------------+
| [attachment preview strip if items selected]      |  <-- AttachmentPreview
+--------------------------------------------------+
| [ Message input text field...     ] [Send]        |  <-- Existing ChatInput
+--------------------------------------------------+
```

New component: `src/components/chat/MediaActionBar.tsx`

```typescript
interface MediaActionBarProps {
  onCameraPress: () => void;
  onGalleryPress: () => void;
  onVoicePress: () => void;
  onFilePress: () => void;
  onScreenshotPress: () => void;
  disabled?: boolean;
}
```

### 1.5 Storage Considerations

#### 1.5.1 On-Device Image Storage

Images captured or received should be stored using `@capacitor/filesystem` (already installed):

```typescript
// Storage strategy
const MEDIA_DIRECTORY = 'thumbcode-media';

interface MediaStorageService {
  // Save image to device, return local URI
  saveImage(base64: string, filename: string): Promise<string>;

  // Generate thumbnail (compressed version for list views)
  createThumbnail(uri: string, maxSize: number): Promise<string>;

  // Clean up old media (LRU eviction when storage > threshold)
  pruneOldMedia(maxSizeMB: number): Promise<void>;

  // Get total storage used by media
  getStorageUsage(): Promise<{ totalMB: number; imageCount: number }>;
}
```

**Storage budget**: Default 500MB per project, configurable in settings. Images compressed to 80% JPEG quality before storage. Thumbnails at 150x150px.

#### 1.5.2 Chat History with Media

The existing chat persistence limits to 100 messages per thread. With media, we need:

- Store media URIs (not inline base64) in message metadata
- Separate media files from chat JSON persistence
- Lazy-load media when scrolling through history
- Option to "clear media" without clearing text history

### 1.6 New Service: MediaService

Location: `src/services/media/MediaService.ts`

```typescript
interface MediaService {
  // Camera
  capturePhoto(options?: { quality?: number }): Promise<MediaResult>;
  pickFromGallery(options?: { multiple?: boolean }): Promise<MediaResult[]>;

  // Voice
  startVoiceInput(): Promise<void>;
  stopVoiceInput(): Promise<VoiceResult>;
  isListening(): boolean;

  // Files
  pickFiles(options?: { types?: string[] }): Promise<FileResult[]>;

  // Screenshot
  captureScreenshot(): Promise<MediaResult>;

  // TTS
  speakText(text: string, options?: TTSOptions): Promise<void>;
  stopSpeaking(): Promise<void>;

  // Storage
  saveMedia(base64: string, type: string): Promise<string>;
  getMediaUri(id: string): Promise<string | null>;
  pruneMedia(maxMB: number): Promise<void>;
}

interface MediaResult {
  uri: string;
  base64: string;
  mimeType: string;
  width?: number;
  height?: number;
}

interface VoiceResult {
  transcript: string;
  confidence: number;
  duration: number;
  language: string;
}

interface FileResult {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}

interface TTSOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  voice?: string;
}
```

### 1.7 New Hook: useMediaInput

Location: `src/hooks/use-media-input.ts`

```typescript
interface UseMediaInputReturn {
  // Camera
  takePhoto: () => Promise<MediaResult | null>;
  pickPhoto: () => Promise<MediaResult | null>;

  // Voice
  isListening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<VoiceResult | null>;
  partialTranscript: string;

  // Files
  pickFiles: (types?: string[]) => Promise<FileResult[]>;

  // Screenshot
  captureScreen: () => Promise<MediaResult | null>;

  // Pending attachments (before send)
  pendingAttachments: Attachment[];
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (index: number) => void;
  clearAttachments: () => void;

  // Convert to AI content blocks
  toContentBlocks: () => ContentBlock[];

  // Permissions
  hasCameraPermission: boolean;
  hasMicrophonePermission: boolean;
  requestPermissions: () => Promise<void>;
}
```

---

## Part 2: Frontend Agent Skill

### 2.1 Skill System Design

The current agent architecture has four roles: Architect, Implementer, Reviewer, Tester. Each has a system prompt with hardcoded context (see `implementer-agent.ts` lines 16-58). The "Frontend Skill" is not a new agent -- it is a **composable skill module** that enhances existing agents with frontend-specific capabilities.

#### 2.1.1 Skill Interface

Location: `src/services/skills/types.ts`

```typescript
/**
 * A Skill is a composable capability module that can be attached
 * to any agent to extend its system prompt, tools, and context.
 */
export interface AgentSkill {
  /** Unique skill identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description for the orchestrator */
  description: string;

  /**
   * Additional system prompt text to inject.
   * Appended to the agent's base system prompt.
   */
  getSystemPromptExtension(context: SkillContext): string;

  /**
   * Additional tools this skill provides.
   * Merged with the agent's base tools.
   */
  getTools(): ToolDefinition[];

  /**
   * Execute a skill-specific tool.
   * Returns null if this skill doesn't handle the tool.
   */
  executeTool(
    name: string,
    input: Record<string, unknown>,
    context: SkillContext
  ): Promise<string | null>;

  /**
   * Context documents to inject into the conversation.
   * Used for design tokens, component catalogs, etc.
   * Should be token-budget-aware.
   */
  getContextDocuments(budget: TokenBudget): ContextDocument[];
}

export interface SkillContext {
  projectId: string;
  workspaceDir: string;
  currentBranch: string;
  availableFiles: string[];
  /** Design system tokens (if available) */
  designTokens?: DesignTokens;
  /** Existing component inventory */
  componentInventory?: ComponentInfo[];
}

export interface TokenBudget {
  /** Maximum tokens for context injection */
  maxTokens: number;
  /** Tokens already used by base system prompt */
  usedTokens: number;
  /** Remaining tokens available */
  remainingTokens: number;
}

export interface ContextDocument {
  /** Document title for reference */
  title: string;
  /** Document content */
  content: string;
  /** Estimated token count */
  estimatedTokens: number;
  /** Priority (higher = inject first) */
  priority: number;
}

export interface ComponentInfo {
  name: string;
  path: string;
  props: string[];
  description?: string;
  /** Estimated tokens if full source is injected */
  sourceTokens?: number;
}
```

#### 2.1.2 Skill Registry

Location: `src/services/skills/SkillRegistry.ts`

```typescript
export class SkillRegistry {
  private skills = new Map<string, AgentSkill>();

  register(skill: AgentSkill): void;
  unregister(skillId: string): void;
  get(skillId: string): AgentSkill | undefined;
  getAll(): AgentSkill[];

  /**
   * Get combined system prompt extension from all registered skills.
   */
  getCombinedPromptExtension(context: SkillContext): string;

  /**
   * Get combined tools from all registered skills.
   * Deduplicates by tool name (skill tools override base tools).
   */
  getCombinedTools(): ToolDefinition[];

  /**
   * Execute a tool against all skills until one handles it.
   */
  executeTool(
    name: string,
    input: Record<string, unknown>,
    context: SkillContext
  ): Promise<string | null>;

  /**
   * Get context documents within token budget, prioritized.
   */
  getContextDocuments(budget: TokenBudget): ContextDocument[];
}
```

#### 2.1.3 BaseAgent Integration

The `BaseAgent` class needs a `skills` array:

```typescript
// In base-agent.ts constructor
protected skills: AgentSkill[] = [];

// New method
attachSkill(skill: AgentSkill): void {
  this.skills.push(skill);
}

// Modify getSystemPrompt to include skill extensions
protected getSystemPrompt(context: AgentContext): string {
  const basePrompt = this.getBaseSystemPrompt(context);
  const skillExtensions = this.skills
    .map(s => s.getSystemPromptExtension(this.toSkillContext(context)))
    .filter(Boolean)
    .join('\n\n---\n\n');

  return skillExtensions
    ? `${basePrompt}\n\n## Attached Skills\n\n${skillExtensions}`
    : basePrompt;
}

// Modify getTools to include skill tools
protected getTools(): ToolDefinition[] {
  const baseTools = this.getBaseTools();
  const skillTools = this.skills.flatMap(s => s.getTools());
  // Skill tools override base tools with same name
  const toolMap = new Map(baseTools.map(t => [t.name, t]));
  for (const tool of skillTools) {
    toolMap.set(tool.name, tool);
  }
  return Array.from(toolMap.values());
}

// Modify executeTool to try skills first
protected async executeTool(
  name: string,
  input: Record<string, unknown>,
  context: AgentContext
): Promise<string> {
  // Try skill tools first
  for (const skill of this.skills) {
    const result = await skill.executeTool(name, input, this.toSkillContext(context));
    if (result !== null) return result;
  }
  // Fall back to base implementation
  return this.executeBaseTool(name, input, context);
}
```

### 2.2 Frontend Skill Implementation

Location: `src/services/skills/FrontendSkill.ts`

#### 2.2.1 Design System Context Injection

The most critical aspect: efficiently passing the ThumbCode design system to the agent without blowing the token budget.

**Strategy: Tiered context injection**

| Tier | Content | Est. Tokens | When Injected |
|------|---------|-------------|---------------|
| 1 (Always) | Color palette summary, font families, organic border-radius values | ~200 | Every request |
| 2 (Usually) | Tailwind custom classes, semantic color mappings, spacing scale | ~400 | When task involves UI |
| 3 (On demand) | Component catalog (names + props, no source) | ~300 | When creating/modifying components |
| 4 (On demand) | Full component source for referenced components | ~500 each | When agent needs to match existing patterns |

**Tier 1 context (compact design system summary)**:

```typescript
private getTier1Context(): string {
  return `## ThumbCode Design System (P3 "Warm Technical")

### Colors
- Primary (Coral): #FF7059 | hover: #FF8A7A | active: #C74840 | light: #E85A4F
- Secondary (Teal): #0D9488 | accent: #14B8A6 | light: #0F766E
- Accent (Gold): #F5D563 | strong: #EAB308 | light: #D4A84B
- Dark bg: #151820 | Surface: #1E293B | Elevated: #334155
- Light bg: #F8FAFC

### Typography
- Display: Fraunces (serif) -- headlines, hero text
- Body: Cabin (sans-serif) -- UI text, paragraphs
- Code: JetBrains Mono -- code blocks, technical data

### Organic Styling (CRITICAL -- never use perfect corners)
- Button radius: rounded-organic-button (0.5rem 0.75rem 0.625rem 0.875rem)
- Card radius: rounded-organic-card (1rem 0.75rem 1.25rem 0.5rem)
- Chat user: rounded-organic-chat-user (1rem 0.375rem 1rem 0.875rem)
- Chat agent: rounded-organic-chat-agent (0.375rem 1rem 1rem 0.875rem)
- Cards should have slight rotation: transform: rotate(-0.3deg) / rotate(0.3deg)
- Use organic box-shadows with teal tint, never flat shadows

### Anti-patterns (NEVER)
- No gradients for backgrounds or buttons
- No Inter, Roboto, or system fonts
- No hardcoded colors -- use Tailwind tokens
- No perfectly rounded corners (no border-radius: 8px)`;
}
```

This is approximately 200 tokens -- negligible overhead on every request but ensures brand compliance.

#### 2.2.2 Component Inventory Tool

A new tool that scans the workspace for existing components and returns a structured catalog:

```typescript
{
  name: 'list_components',
  description: 'List all React components in the project with their props and file paths. Use this before creating new components to check if a similar one exists.',
  input_schema: {
    type: 'object',
    properties: {
      directory: {
        type: 'string',
        description: 'Directory to scan (default: src/components)',
      },
      includeSource: {
        type: 'boolean',
        description: 'Include full source code (uses more tokens)',
      },
    },
  },
}
```

Implementation: Walk the file tree, parse `.tsx` files for `export function` / `export const` declarations, extract prop interfaces, return as structured text.

#### 2.2.3 Screenshot-to-Code Tool

Enables the workflow: user sends photo of desired UI, agent generates matching component.

```typescript
{
  name: 'analyze_ui_screenshot',
  description: 'Analyze a UI screenshot or design mockup and generate a component specification. The image must be attached to the current message.',
  input_schema: {
    type: 'object',
    properties: {
      intent: {
        type: 'string',
        description: 'What the user wants: "replicate", "improve", "extract_layout", "identify_components"',
        enum: ['replicate', 'improve', 'extract_layout', 'identify_components'],
      },
      targetFramework: {
        type: 'string',
        description: 'Target output: React component with Tailwind',
        enum: ['react-tailwind', 'html-css'],
      },
    },
    required: ['intent'],
  },
}
```

**How it works**:
1. User attaches an image to their message (via camera or gallery)
2. User types "Build this" or "Make a component that looks like this"
3. The Frontend Skill detects the image in the conversation context
4. The agent invokes `analyze_ui_screenshot` with the image content block
5. The AI model (which has vision) analyzes the image against the design system context
6. Agent generates a React/Tailwind component that matches the screenshot but uses ThumbCode's organic styling and color palette

**Key insight**: This does NOT require a separate screenshot-to-code model. Both Claude and GPT-4o have native vision capabilities. The Frontend Skill's value is in providing the design system context so the generated code is brand-compliant, not just visually similar.

#### 2.2.4 Visual Diff Tool

Compares a generated UI against a reference image:

```typescript
{
  name: 'compare_ui',
  description: 'Compare a rendered component screenshot against a design reference image. Returns differences in layout, color, typography, and spacing.',
  input_schema: {
    type: 'object',
    properties: {
      referenceImageUri: {
        type: 'string',
        description: 'URI of the reference/target design image',
      },
      generatedImageUri: {
        type: 'string',
        description: 'URI of the screenshot of the generated component',
      },
    },
    required: ['referenceImageUri', 'generatedImageUri'],
  },
}
```

**Implementation**: Send both images to the vision model with a structured prompt asking for specific differences in layout, colors, typography, spacing, and organic styling compliance. The model returns a structured diff that can be used to iterate.

#### 2.2.5 Generate Component Tool

The core code generation tool, design-system-aware:

```typescript
{
  name: 'generate_component',
  description: 'Generate a React component following ThumbCode design system. Automatically applies organic styling, brand colors, correct typography, and accessibility attributes.',
  input_schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Component name in PascalCase',
      },
      description: {
        type: 'string',
        description: 'What the component does',
      },
      props: {
        type: 'string',
        description: 'TypeScript interface for props',
      },
      variant: {
        type: 'string',
        description: 'Dark mode, light mode, or both',
        enum: ['dark', 'light', 'both'],
      },
      outputPath: {
        type: 'string',
        description: 'Where to write the component file',
      },
    },
    required: ['name', 'description'],
  },
}
```

### 2.3 Live Component Preview

#### 2.3.1 Architecture Options

| Approach | How | Pros | Cons |
|----------|-----|------|------|
| **A. Sandboxed iframe** | Render generated HTML/CSS in an iframe with `srcdoc` | Simple, secure, works on web and Capacitor webview | No React runtime, limited to static HTML output |
| **B. Dynamic import + iframe** | Bundle component with esbuild-wasm, render in iframe | Full React runtime, accurate preview | Complex, large WASM dependency, slow on mobile |
| **C. Server-side render** | Send component to a render service, get screenshot back | Perfect fidelity | Requires server, violates zero-server principle |
| **D. Hybrid: static preview + screenshot comparison** | Render HTML/CSS approximation in iframe, use vision model to validate | Good balance of fidelity and simplicity | Two-step process |

**Recommendation: Approach A for v1.0, upgrade to B for v1.1.**

Approach A (sandboxed iframe) is the pragmatic v1.0 choice because:
1. The AI model generates complete, self-contained HTML/Tailwind output
2. An iframe with `srcdoc` renders it safely without affecting the app
3. It works identically on web and in Capacitor's webview
4. No WASM download or server dependency
5. For design validation, the user can screenshot the preview and send it back to the agent for visual diffing

#### 2.3.2 Preview Component

Location: `src/components/chat/ComponentPreview.tsx`

```typescript
interface ComponentPreviewProps {
  /** Raw HTML/CSS to render */
  html: string;
  /** Component name for the header */
  componentName: string;
  /** Whether the preview is expanded or collapsed */
  isExpanded: boolean;
  onToggleExpand: () => void;
  /** Callback to capture screenshot of preview for visual diffing */
  onScreenshot?: () => void;
}
```

The iframe renders with:
- Tailwind CSS CDN loaded (for utility class support)
- ThumbCode's custom font imports
- ThumbCode's custom Tailwind config (colors, border-radius, shadows)
- `sandbox="allow-scripts"` for minimal permissions
- `srcdoc` containing the full self-contained page

```typescript
function buildPreviewDocument(html: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600;700&family=Cabin:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            coral: { 400: '#FF8A7A', 500: '#FF7059', 600: '#E85A4F', 700: '#C74840', 800: '#A33832' },
            teal: { 400: '#2DD4BF', 500: '#14B8A6', 600: '#0D9488', 700: '#0F766E', 800: '#115E59' },
            gold: { 300: '#FDE68A', 400: '#F5D563', 500: '#EAB308', 600: '#D4A84B', 700: '#A16207' },
            charcoal: '#151820',
            surface: { DEFAULT: '#1E293B', elevated: '#334155' },
          },
          fontFamily: {
            display: ['Fraunces', 'Georgia', 'serif'],
            body: ['Cabin', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
          borderRadius: {
            'organic-card': '1rem 0.75rem 1.25rem 0.5rem',
            'organic-button': '0.5rem 0.75rem 0.625rem 0.875rem',
            'organic-badge': '0.375rem 0.5rem 0.625rem 0.25rem',
          },
        },
      },
    };
  </script>
  <style>
    body { font-family: 'Cabin', system-ui, sans-serif; margin: 0; padding: 16px; }
  </style>
</head>
<body class="bg-charcoal text-white">
  ${html}
</body>
</html>`;
}
```

#### 2.3.3 Preview Integration in Chat

When an agent generates a component, the `ChatMessage` renderer detects code blocks with `language: 'tsx'` or `language: 'html'` and offers a "Preview" toggle:

```
+------------------------------------------+
| implementer                              |
| Here's the AgentStatusCard component:    |
|                                          |
| ┌────────────────────────────────────┐   |
| │ tsx  agent-status-card.tsx  [Copy] │   |
| │                                    │   |
| │ export function AgentStatusCard... │   |
| │   return (                         │   |
| │     <div className="bg-surface...  │   |
| │   );                               │   |
| │ }                                  │   |
| └────────────────────────────────────┘   |
|                                          |
| [Preview] [Copy to project]              |
|                                          |
| ┌────────────────────────────────────┐   |
| │     (live iframe preview)          │   |
| │  ┌──────────────────────────┐      │   |
| │  │  Agent: Implementer      │      │   |
| │  │  Status: Active           │      │   |
| │  │  [organic coral button]   │      │   |
| │  └──────────────────────────┘      │   |
| └────────────────────────────────────┘   |
+------------------------------------------+
```

### 2.4 ToolExecutionBridge Extensions

The existing `ToolExecutionBridge` in `src/services/tools/ToolExecutionBridge.ts` handles file operations. The Frontend Skill's tools need to be registered:

```typescript
// Extended tool routing in ToolExecutionBridge.execute()
case 'list_components':
  return this.listComponents(input, workspaceDir);
case 'generate_component':
  return this.generateComponent(input, workspaceDir);
case 'analyze_ui_screenshot':
  // This is handled by the AI model via vision, not the bridge
  return { success: true, output: 'Screenshot analysis delegated to vision model' };
case 'compare_ui':
  // Also handled by vision model
  return { success: true, output: 'Visual comparison delegated to vision model' };
```

However, the cleaner approach is the Skill system's `executeTool` method, which intercepts before the bridge. The bridge only handles filesystem/git tools; skill-specific tools are handled by the skill itself.

---

## Part 3: Implementation Plan

### 3.1 User Stories (Priority Ordered)

#### v1.0 Scope (Ship First)

| ID | Story | Feature | Effort | Depends On |
|----|-------|---------|--------|-----------|
| **MM-001** | As a user, I can take a photo and send it to an agent in chat | Multimedia | M | Camera plugin |
| **MM-002** | As a user, I can pick an image from my photo library and send it to an agent | Multimedia | M | Camera plugin |
| **MM-003** | As an agent, I can see and analyze images the user sends me (vision) | Multimedia | L | MM-001, AI client changes |
| **MM-004** | As a user, I see images that agents generate displayed inline in chat | Multimedia | M | Chat component changes |
| **MM-005** | As a user, I can use voice-to-text to dictate messages to agents | Multimedia | M | Speech recognition plugin |
| **FS-001** | As an Implementer agent, I know ThumbCode's design system and generate brand-compliant components | Frontend Skill | L | Skill system design |
| **FS-002** | As a user, I can send a photo of a UI design and the agent generates a matching component | Frontend Skill | L | MM-003, FS-001 |
| **MM-006** | As a user, I can pick PDF or document files and send them to an agent | Multimedia | M | File picker plugin |

#### v1.1 Scope (Fast Follow)

| ID | Story | Feature | Effort | Depends On |
|----|-------|---------|--------|-----------|
| **FS-003** | As a user, I can preview generated components live in the chat | Frontend Skill | L | FS-001 |
| **FS-004** | As an agent, I can list existing components in the project before generating new ones | Frontend Skill | M | Skill system |
| **FS-005** | As a user, I can screenshot the live preview and ask the agent to fix differences | Frontend Skill | M | FS-003, MM-003 |
| **MM-007** | As a user, I can capture a screenshot of the current app screen and send it to an agent | Multimedia | S | Screenshot plugin |
| **MM-008** | As a user, I can have agent responses read aloud (TTS) | Multimedia | M | TTS plugin |
| **FS-006** | As an Implementer agent, I can compare generated UI against a reference design image | Frontend Skill | M | MM-003 |
| **MM-009** | As a user, I can manage media storage and see how much space is used | Multimedia | S | Media storage service |

### 3.2 Implementation Phases

#### Phase 1: Multimodal Foundation (Weeks 1-3)

**Goal**: Users can send images and the AI can see them.

1. Install `@capacitor/camera`, configure permissions
2. Extend `ContentBlock` and `Message` types for image content
3. Update `anthropic-client.ts` to format image content blocks
4. Update `openai-client.ts` to format image_url content
5. Build `MediaService` (camera + gallery methods only)
6. Build `useMediaInput` hook (camera + gallery)
7. Build `MediaActionBar` component
8. Build `ImageBubble` chat component
9. Update `ChatInput` to support attachments
10. Update `ChatMessage` to render image messages

**Testing**: Unit tests for MediaService (mock Capacitor), integration test for image content block formatting, E2E test for camera flow (Playwright with mock).

#### Phase 2: Voice & Documents (Weeks 2-4, parallel with Phase 1)

**Goal**: Voice dictation and document upload work.

1. Install `@capgo/capacitor-speech-recognition`, configure permissions
2. Add voice methods to `MediaService`
3. Build `VoiceInputIndicator` component (animated mic icon)
4. Wire voice button in `MediaActionBar`
5. Install `@capawesome/capacitor-file-picker`
6. Add file picker methods to `MediaService`
7. Build `DocumentAttachment` component
8. Add document text extraction (for PDFs: read as text for AI context)

#### Phase 3: Frontend Skill System (Weeks 3-5)

**Goal**: Agents generate design-system-aware components.

1. Design and implement `AgentSkill` interface and `SkillRegistry`
2. Implement `FrontendSkill` with tiered context injection
3. Modify `BaseAgent` to support skill attachment
4. Implement `list_components` tool
5. Implement `generate_component` tool
6. Implement `analyze_ui_screenshot` tool
7. Wire Frontend Skill into the `ImplementerAgent` by default
8. Add design system context to `ArchitectAgent` as well

**Testing**: Unit tests for FrontendSkill context generation, SkillRegistry tool routing, integration test for component generation with mock AI client.

#### Phase 4: Live Preview (Weeks 5-7)

**Goal**: Generated components can be previewed inline.

1. Build `ComponentPreview` component (sandboxed iframe)
2. Build `buildPreviewDocument()` utility
3. Add "Preview" toggle to code block messages
4. Wire screenshot capture from iframe for visual diffing
5. Implement `compare_ui` tool for iterative refinement
6. Add "Copy to project" action from preview

#### Phase 5: Polish & Accessibility (Weeks 6-8)

**Goal**: TTS, screenshot capture, storage management.

1. Install `@capacitor-community/text-to-speech`
2. Add TTS controls to agent messages ("Read aloud" button)
3. Install `@capawesome/capacitor-screenshot`
4. Wire screenshot button in `MediaActionBar`
5. Implement media storage management (pruning, usage stats)
6. Add storage settings page section
7. Accessibility audit for all new components

### 3.3 File Change Summary

#### New Files

| Path | Description |
|------|-------------|
| `src/services/media/MediaService.ts` | Capacitor plugin orchestration for all media input/output |
| `src/services/media/index.ts` | Barrel export |
| `src/services/media/types.ts` | MediaResult, VoiceResult, FileResult, TTSOptions |
| `src/hooks/use-media-input.ts` | React hook wrapping MediaService for components |
| `src/components/chat/MediaActionBar.tsx` | Camera/gallery/mic/file/screenshot buttons |
| `src/components/chat/ImageBubble.tsx` | Image display in chat with organic styling |
| `src/components/chat/VoiceInputIndicator.tsx` | Animated recording state indicator |
| `src/components/chat/DocumentAttachment.tsx` | File attachment chip component |
| `src/components/chat/AttachmentPreview.tsx` | Preview strip for pending attachments |
| `src/components/chat/ComponentPreview.tsx` | Sandboxed iframe for live component preview |
| `src/services/skills/types.ts` | AgentSkill, SkillContext, TokenBudget interfaces |
| `src/services/skills/SkillRegistry.ts` | Skill registration and routing |
| `src/services/skills/FrontendSkill.ts` | Design-system-aware frontend skill |
| `src/services/skills/index.ts` | Barrel export |

#### Modified Files

| Path | Change |
|------|--------|
| `src/services/ai/types.ts` | Add `image`, `document`, `audio` to ContentType; add ImageSource interface |
| `src/services/ai/anthropic-client.ts` | Handle image content blocks in formatContentBlocks() |
| `src/services/ai/openai-client.ts` | Handle image_url content in message formatting |
| `src/services/agents/base-agent.ts` | Add skills array, skill-aware getSystemPrompt/getTools/executeTool |
| `src/services/agents/implementer-agent.ts` | Attach FrontendSkill by default |
| `src/services/agents/types.ts` | Extend AgentContext with optional designTokens, componentInventory |
| `src/index.ts` | Export skills module |
| `src/state/chatStore.ts` | Add MessageContentType values, new message interfaces |
| `src/components/chat/ChatInput.tsx` | Add MediaActionBar, attachment support |
| `src/components/chat/ChatMessage.tsx` | Add render paths for image, mixed_media, voice_transcript, document |
| `src/components/chat/index.ts` | Export new components |
| `src/services/chat/types.ts` | Add multimedia-related ChatEventTypes |
| `src/services/chat/ChatService.ts` | Add sendImageMessage, sendDocumentMessage methods |
| `capacitor.config.ts` | Add Camera plugin configuration |

---

## Part 4: Technical Dependencies and Risks

### 4.1 New Dependencies

| Package | Version | Size | Purpose | Risk |
|---------|---------|------|---------|------|
| `@capacitor/camera` | ^8.x | ~50KB | Camera/gallery | Low -- official Capacitor team |
| `@capgo/capacitor-speech-recognition` | ^6.x | ~30KB | Voice input | Medium -- community fork, test thoroughly |
| `@capawesome/capacitor-file-picker` | ^6.x | ~25KB | Document picker | Low -- well-maintained |
| `@capawesome/capacitor-screenshot` | ^6.x | ~15KB | Screen capture | Low -- simple API |
| `@capacitor-community/text-to-speech` | ^6.x | ~20KB | TTS output | Low -- community maintained |

**Total new dependency size**: ~140KB (trivial for a mobile app)

### 4.2 Risk Matrix

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| **Camera permission denied by user** | High (feature blocked) | Medium | Graceful fallback UI, explain why permission needed, link to settings |
| **Large images blow token budget** | High (API cost + latency) | High | Auto-resize images to max 1024px before base64 encoding; use `detail: 'low'` for quick analysis |
| **Voice recognition accuracy low** | Medium (frustrating UX) | Medium | Show partial results for correction, keep "edit before send" step |
| **Iframe preview fidelity mismatch** | Medium (user confusion) | Medium | Clear "Approximate Preview" label; screenshot-to-compare flow catches differences |
| **Token budget overflow with skill context** | High (API errors/cost) | Low | Tiered injection with strict budget enforcement; measure tokens before injection |
| **Storage bloat from media files** | Medium (device storage) | High | Auto-pruning LRU cache, configurable limit, show usage in settings |
| **Speech recognition plugin crashes on Android** | High (app crash) | Low | Use Cap-go fork (known crash fixes); wrap in try/catch with fallback |
| **Capacitor plugin version incompatibility** | High (build breaks) | Low | Pin to Capacitor 8.x compatible versions; integration test in CI |
| **AI provider doesn't support vision for selected model** | High (feature unavailable) | Low | Check model capabilities before offering camera; graceful degradation to text-only |

### 4.3 Performance Considerations

**Image processing pipeline**:
1. Capture at native resolution
2. Resize to max 1568px (Anthropic's recommended maximum) using canvas
3. Compress to JPEG at 80% quality
4. Convert to base64
5. Store compressed version on device
6. Send base64 in content block

Expected latency per image: ~200ms resize + ~100ms compress + ~50ms base64 = ~350ms on device before network.

**Token cost estimates (per image)**:
- Low detail: ~85 tokens (OpenAI) / similar (Anthropic)
- High detail: ~765 tokens per 512x512 tile (OpenAI) / similar scaling (Anthropic)
- Recommendation: default to "auto" detail, let the model decide

**Voice input latency**:
- On-device STT: <500ms for partial results
- Full transcript available within 1s of stopping

---

## Part 5: v1.0 vs v1.1 Boundary

### v1.0 (Ship These)

| Feature | Rationale |
|---------|-----------|
| Camera input (take photo + pick from gallery) | Core mobile differentiator; enables screenshot-to-code |
| Image display in chat (agent output) | Required to show agent-generated mockups and diagrams |
| Vision API integration (Anthropic + OpenAI) | Required for camera input to be useful |
| Voice-to-text input | High value for mobile (typing on phone is slow) |
| File/document picker | Users need to share PDFs, specs with agents |
| Frontend Skill (design system context injection) | Core value -- agents must generate brand-compliant code |
| Screenshot-to-code workflow | Signature feature combining camera + frontend skill |
| Component inventory tool (`list_components`) | Prevents duplicate component generation |

### v1.1 (Fast Follow)

| Feature | Rationale |
|---------|-----------|
| Live component preview (sandboxed iframe) | Complex but high-value; can ship camera features first |
| Visual diffing (compare_ui tool) | Depends on preview being available |
| Screenshot capture (current screen) | Nice-to-have; photo of external screen covers 90% of use cases |
| TTS output | Accessibility feature, not blocking |
| Media storage management UI | Can use simple auto-pruning initially |
| Dynamic import preview (esbuild-wasm) | v1.0 iframe is sufficient; full React preview is v1.1 stretch |

### Decision Criteria for v1.0 Cutoff

A feature ships in v1.0 if ALL of these are true:
1. It enables a user workflow that is impossible without it
2. It has a clear, testable acceptance criterion
3. It does not require a new server-side dependency
4. It can be implemented in 1-2 weeks by one developer
5. It has a graceful degradation path if the underlying plugin fails

---

## Appendix A: Capacitor Plugin Compatibility Matrix

| Plugin | Capacitor 8.x | iOS | Android | Web | Notes |
|--------|--------------|-----|---------|-----|-------|
| `@capacitor/camera` | Yes | Yes | Yes | Yes (PWA Elements) | Already in Capacitor ecosystem |
| `@capgo/capacitor-speech-recognition` | Yes | Yes | Yes | Yes (Web Speech API) | Fork of community plugin |
| `@capawesome/capacitor-file-picker` | Yes | Yes | Yes | Yes (native `<input>`) | Cross-platform file selection |
| `@capawesome/capacitor-screenshot` | Yes | Yes | Yes | Yes (html2canvas) | Native on mobile, html2canvas on web |
| `@capacitor-community/text-to-speech` | Yes | Yes | Yes | Yes (Web Speech API) | Uses platform TTS engines |
| `@capacitor/filesystem` | Yes | Yes | Yes | Yes (IndexedDB) | **Already installed** |

## Appendix B: AI Provider Vision Support Matrix

| Provider | Model | Vision | Max Images | Image Formats | Max Size |
|----------|-------|--------|-----------|---------------|----------|
| Anthropic | Claude 3.5 Sonnet | Yes | 100/request | JPEG, PNG, GIF, WebP | 20MB/image |
| Anthropic | Claude 3.5 Haiku | Yes | 100/request | JPEG, PNG, GIF, WebP | 20MB/image |
| Anthropic | Claude 3 Opus | Yes | 100/request | JPEG, PNG, GIF, WebP | 20MB/image |
| Anthropic | Claude 4.x | Yes | 100/request | JPEG, PNG, GIF, WebP | 20MB/image |
| OpenAI | GPT-4o | Yes | 500/request | PNG, JPEG, WebP, GIF | 50MB payload |
| OpenAI | GPT-4o-mini | Yes | 500/request | PNG, JPEG, WebP, GIF | 50MB payload |
| OpenAI | GPT-4-turbo | Yes | 500/request | PNG, JPEG, WebP, GIF | 50MB payload |

## Appendix C: Token Budget Allocation for Frontend Skill

For a typical 128K context window (Claude 3.5 Sonnet):

| Component | Tokens | % of Budget |
|-----------|--------|-------------|
| System prompt (base agent) | ~800 | 0.6% |
| Frontend Skill Tier 1 (colors, fonts, organic rules) | ~200 | 0.15% |
| Frontend Skill Tier 2 (Tailwind config, spacing) | ~400 | 0.3% |
| Frontend Skill Tier 3 (component catalog) | ~300 | 0.2% |
| Conversation history | ~8,000 | 6.25% |
| Image content (1 image, auto detail) | ~1,000 | 0.8% |
| Tool definitions (8 tools) | ~1,500 | 1.2% |
| **Total context overhead** | **~12,200** | **~9.5%** |
| **Available for generation** | **~115,800** | **~90.5%** |

The overhead is minimal. Even with multiple images and full component source injection (Tier 4), we remain well within budget.

---

## Sources

Research conducted for this document:

- [Camera Capacitor Plugin API](https://capacitorjs.com/docs/apis/camera)
- [capacitor-community/speech-recognition](https://github.com/capacitor-community/speech-recognition)
- [Cap-go/capacitor-speech-recognition](https://github.com/Cap-go/capacitor-speech-recognition)
- [File Picker Plugin for Capacitor - Capawesome](https://capawesome.io/plugins/file-picker/)
- [Filesystem Capacitor Plugin API](https://capacitorjs.com/docs/apis/filesystem)
- [Screenshot Plugin for Capacitor - Capawesome](https://capawesome.io/plugins/screenshot/)
- [capacitor-community/text-to-speech](https://github.com/capacitor-community/text-to-speech)
- [Anthropic Vision API Documentation](https://platform.claude.com/docs/en/build-with-claude/vision)
- [OpenAI Images and Vision Guide](https://platform.openai.com/docs/guides/images-vision)
- [abi/screenshot-to-code](https://github.com/abi/screenshot-to-code)
- [v0 by Vercel](https://v0.app/)
- [Live Component Preview for React](https://dev.to/barelyhuman/live-component-preview-for-react-c37)
- [Best practices for React iframes](https://blog.logrocket.com/best-practices-react-iframes/)
