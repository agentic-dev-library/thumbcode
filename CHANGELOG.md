# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1](https://github.com/jbcom/thumbcode/compare/v1.0.0...v1.0.1) (2026-02-25)


### Bug Fixes

* **ci:** add workflow_dispatch trigger to release.yml ([#161](https://github.com/jbcom/thumbcode/issues/161)) ([7018be5](https://github.com/jbcom/thumbcode/commit/7018be5261e02f252c7adf28e4a73eac8890e843))

## 1.0.0 (2026-02-25)


### ⚠ BREAKING CHANGES

* src/services/git and src/services/credentials removed

### Features

* add PWA manifest, favicon, AI client test coverage (116 new tests) ([d168192](https://github.com/jbcom/thumbcode/commit/d1681927d5203b0779bed184c16528ae3ee8613f))
* **agents:** implement multi-agent orchestration system ([#47](https://github.com/jbcom/thumbcode/issues/47)) ([2299d37](https://github.com/jbcom/thumbcode/commit/2299d37365606a686724e5fbef6adc4eae47fd3a))
* **ai:** real Anthropic/OpenAI streaming + agent routing ([#117](https://github.com/jbcom/thumbcode/issues/117)) ([c6c31bd](https://github.com/jbcom/thumbcode/commit/c6c31bd07994e34f0806cb9a136e18a94d834816))
* **auth:** implement GitHub Device Flow authentication ([#72](https://github.com/jbcom/thumbcode/issues/72)) ([090932f](https://github.com/jbcom/thumbcode/commit/090932feeaa770bb38504aa8771f772a7d44bf49))
* **auth:** improve github polling robustness and verify ui ([#109](https://github.com/jbcom/thumbcode/issues/109)) ([8377cc5](https://github.com/jbcom/thumbcode/commit/8377cc53b3ac95ccd6a6494380be5298e3dd3415))
* **brand:** implement procedural paint daube SVG icon system ([#71](https://github.com/jbcom/thumbcode/issues/71)) ([17c22ac](https://github.com/jbcom/thumbcode/commit/17c22ac981087ad14dca4300088a544dc1a190fe))
* **chat:** implement real-time chat system for human-agent collaboration ([#49](https://github.com/jbcom/thumbcode/issues/49)) ([c7c91f5](https://github.com/jbcom/thumbcode/commit/c7c91f5ce235dd1b4fbbbc5d454d620d248c32ef)), closes [#12](https://github.com/jbcom/thumbcode/issues/12)
* **ci:** Migrate GitHub Pages to Staging with Playwright E2E Testing ([#59](https://github.com/jbcom/thumbcode/issues/59)) ([add6cc6](https://github.com/jbcom/thumbcode/commit/add6cc62f1536846c9697b3d93bb5e53c5e55ac8)), closes [#53](https://github.com/jbcom/thumbcode/issues/53)
* complete Expo → Capacitor/Vite migration ([#130](https://github.com/jbcom/thumbcode/issues/130)) ([8466b92](https://github.com/jbcom/thumbcode/commit/8466b9272da611ad3b66c3a36feff1380024dce0))
* **components:** expand component library to production-ready set ([#50](https://github.com/jbcom/thumbcode/issues/50)) ([2585eca](https://github.com/jbcom/thumbcode/commit/2585ecad08d9579f6bc09ddf4926fcec70d24848))
* **core:** Implement Git and Secure Credential Services ([9d69973](https://github.com/jbcom/thumbcode/commit/9d69973a039c2b91226065773a91505a0c10587d))
* **core:** Implement Git and Secure Credential Services ([#39](https://github.com/jbcom/thumbcode/issues/39)) ([9d69973](https://github.com/jbcom/thumbcode/commit/9d69973a039c2b91226065773a91505a0c10587d))
* credential validation, project creation, syntax highlighting ([#121](https://github.com/jbcom/thumbcode/issues/121)) ([ce3f99b](https://github.com/jbcom/thumbcode/commit/ce3f99bc9b9b025442865963de19866322b1c095))
* **credentials:** implement secure credential storage service ([#42](https://github.com/jbcom/thumbcode/issues/42)) ([fd8c9e4](https://github.com/jbcom/thumbcode/commit/fd8c9e40f3ca8ee992a1e9be323b26914e285763)), closes [#9](https://github.com/jbcom/thumbcode/issues/9)
* **docs:** add landing page for docs site root ([#79](https://github.com/jbcom/thumbcode/issues/79)) ([6ad0d09](https://github.com/jbcom/thumbcode/commit/6ad0d0933be88f87c81f27a4417f618246433102))
* **docs:** upgrade to Astro Starlight documentation site ([#74](https://github.com/jbcom/thumbcode/issues/74)) ([551add5](https://github.com/jbcom/thumbcode/commit/551add5519120686ac00d2f587f8885b84995118))
* **env:** implement environment configuration and setup script ([#43](https://github.com/jbcom/thumbcode/issues/43)) ([d23163c](https://github.com/jbcom/thumbcode/commit/d23163c7999f16c5431af5812f992b7c004f8bdf)), closes [#7](https://github.com/jbcom/thumbcode/issues/7)
* **error:** implement comprehensive error handling and logging system ([#52](https://github.com/jbcom/thumbcode/issues/52)) ([1c5d35a](https://github.com/jbcom/thumbcode/commit/1c5d35a49f07fed8c9631e4e06d2eb19badce346))
* **error:** implement issue reporting in ErrorFallback ([#106](https://github.com/jbcom/thumbcode/issues/106)) ([44f0e9d](https://github.com/jbcom/thumbcode/commit/44f0e9d58da7fbc6daaf06a0f7505a207a012ca0))
* **git:** implement isomorphic-git service for mobile Git operations ([#44](https://github.com/jbcom/thumbcode/issues/44)) ([d4be0a4](https://github.com/jbcom/thumbcode/commit/d4be0a4732bb46b60ff7ae81434b6f4d7d6347a2)), closes [#8](https://github.com/jbcom/thumbcode/issues/8)
* Implement Agent Intelligence System ([23c6c6f](https://github.com/jbcom/thumbcode/commit/23c6c6f84d7cf1db1f0af71e3013b71ba43d648e))
* Implement State Management and UI Foundation ([f6a8378](https://github.com/jbcom/thumbcode/commit/f6a837841dbbe2638a6f3cddb84a18cd365b7331))
* implement web-compatible credential storage with AES-GCM encryption ([#141](https://github.com/jbcom/thumbcode/issues/141)) ([e2b0cd2](https://github.com/jbcom/thumbcode/commit/e2b0cd282d93710c8de94970403a9897178fe97e))
* **infra:** Add CI/CD and Environment Management ([#31](https://github.com/jbcom/thumbcode/issues/31)) ([631a25e](https://github.com/jbcom/thumbcode/commit/631a25ebdca47896732b10fdd80e71d08eb06d68))
* **infra:** add Render staging + EAS workflows + EAS project config ([c62b6a2](https://github.com/jbcom/thumbcode/commit/c62b6a25562acdf6b02a2d52811e537a08704b62))
* merge ralph session — US-002, US-007, US-010, US-012, US-017, US-018 completed ([b1d060a](https://github.com/jbcom/thumbcode/commit/b1d060a924efcb774f29980aa82bf00178a7af30))
* **mobile:** touch targets, input UX, safe areas, and scroll fixes ([f5cee52](https://github.com/jbcom/thumbcode/commit/f5cee521d33e35c2fe26e3fed17c60fee51b94d4))
* onboard ralph, add v1.0 consolidation PRD with 24 user stories ([b414f55](https://github.com/jbcom/thumbcode/commit/b414f55af7e82e3a150205b224710a16c77e60e2))
* Optimize Index component by memoizing tech stack array ([aa9efa6](https://github.com/jbcom/thumbcode/commit/aa9efa68c502b0c93cfbd310ee3e75982e3edce2))
* Optimize Index component by memoizing tech stack array ([#30](https://github.com/jbcom/thumbcode/issues/30)) ([aa9efa6](https://github.com/jbcom/thumbcode/commit/aa9efa68c502b0c93cfbd310ee3e75982e3edce2))
* **performance:** add performance monitoring and optimization utilities ([#54](https://github.com/jbcom/thumbcode/issues/54)) ([e44424f](https://github.com/jbcom/thumbcode/commit/e44424fae276fe226c64a5b0e1dc42b0774c2214))
* **production:** accessibility, performance, and build optimization ([e3b94c6](https://github.com/jbcom/thumbcode/commit/e3b94c6104013c5c41610f4905a3ea6bd623f336))
* **production:** OG tags, clipboard copy, form UX, and accessibility ([078b86b](https://github.com/jbcom/thumbcode/commit/078b86b6eae53ca12351e1550ff6cbee21499feb))
* **screens:** implement all app screens and navigation flows ([#51](https://github.com/jbcom/thumbcode/issues/51)) ([fac9f81](https://github.com/jbcom/thumbcode/commit/fac9f81fade24f60ca0ad18c7b0a86af65d2e519))
* **stores:** Implement Zustand state management system ([14ae953](https://github.com/jbcom/thumbcode/commit/14ae953bfba8b30252a06a6e68fa78ae4f3c89cf)), closes [#10](https://github.com/jbcom/thumbcode/issues/10)
* **stores:** Implement Zustand state management system ([#41](https://github.com/jbcom/thumbcode/issues/41)) ([14ae953](https://github.com/jbcom/thumbcode/commit/14ae953bfba8b30252a06a6e68fa78ae4f3c89cf))
* **toast:** wire toast notification system into user actions ([9b46e80](https://github.com/jbcom/thumbcode/commit/9b46e802dee49022fbf8bedc1bbb22691549f9e0))
* trigger git commit on approval in ChatScreen ([#108](https://github.com/jbcom/thumbcode/issues/108)) ([da1f613](https://github.com/jbcom/thumbcode/commit/da1f613210d8f9d8933118fd3a334e2a85625c6a))
* **ui:** mobile-first foundation — glassmorphism nav, tap feedback, page transitions ([acf85dd](https://github.com/jbcom/thumbcode/commit/acf85dd03c368a24c1ac0fe3020988fdd8373441))
* **ui:** mobile-first upgrades across all tab pages ([de83da4](https://github.com/jbcom/thumbcode/commit/de83da43bd27b080635aa8305b34cc136702f40d))
* **ui:** mobile-first upgrades for all remaining pages ([c2b8622](https://github.com/jbcom/thumbcode/commit/c2b8622d3b6039903cdb69c1e70a1cf27a015fee))
* **ui:** mobile-first upgrades for ProviderConfig page ([178248d](https://github.com/jbcom/thumbcode/commit/178248dd0275588f7c93bc25995f326a82713123))
* **US-001:** Modernize agent-intelligence package for web ([40c181b](https://github.com/jbcom/thumbcode/commit/40c181b462b100dfb75a83dfbb7d98c7d8b0536b))
* US-002 - Replace src/services/ai/ with agent-intelligence AI clients ([443691c](https://github.com/jbcom/thumbcode/commit/443691cfc2863a173cd3aaddb266041a44aec720))
* **US-003:** Wire orchestrator for single-agent routing ([be21aea](https://github.com/jbcom/thumbcode/commit/be21aeaaf4b6c507b3021854210c3c4abff0a913))
* US-007 - Establish packages/ui/ as canonical component library ([146d376](https://github.com/jbcom/thumbcode/commit/146d376144b12d869d30dac64cc4e4924ea4c8c2))
* **US-008:** Refactor chat.tsx -- extract logic to hooks and services ([b245a78](https://github.com/jbcom/thumbcode/commit/b245a78aef32c5537d7a7d7157bd8a2b33d7ab37))
* **US-009:** Refactor create-project.tsx -- extract form logic ([9eabc64](https://github.com/jbcom/thumbcode/commit/9eabc643b2f089b1dbe5ad2e528fe14ecf302668))
* US-010 - Refactor ProjectDetail.tsx -- extract logic to hooks ([112362c](https://github.com/jbcom/thumbcode/commit/112362cbb56d971c9b62c905e90113d43277c1d3))
* **US-010:** Refactor ProjectDetail.tsx -- extract logic to hooks ([b84d004](https://github.com/jbcom/thumbcode/commit/b84d0045297217d1a089bbc8cf9a2942a121c82a))
* **US-011:** Refactor AgentDetail.tsx -- extract logic to hooks ([488e00b](https://github.com/jbcom/thumbcode/commit/488e00bc609204fe27a5df1c8455db72a7dfe5db))
* US-012 - Refactor tab pages -- extract inline logic to hooks ([3c2ef35](https://github.com/jbcom/thumbcode/commit/3c2ef35ad22de39785ed63cdf35d6c353515f494))
* **US-013:** Lazy-load icon-paths and consolidate organic styling ([6eddaa5](https://github.com/jbcom/thumbcode/commit/6eddaa5eed1a1e7828cd51ad62e878e414ab3ecf))
* **US-014:** Create docs/ memory bank foundation files ([a9a4d4e](https://github.com/jbcom/thumbcode/commit/a9a4d4e672ae3aa035acb6a69d98d53c1249517f))
* **US-015:** Create docs/ memory bank working files and subdirectories ([759cf9a](https://github.com/jbcom/thumbcode/commit/759cf9af952c311241c6e0544cc738d0c7e2dd92))
* US-017 - Update config files and remove Expo vestiges ([6685e2d](https://github.com/jbcom/thumbcode/commit/6685e2d8023b40604bd0bd49902ad560b63ed186))
* US-018 - Update Biome, SonarCloud, and TypeScript configs for all packages ([dfb45f8](https://github.com/jbcom/thumbcode/commit/dfb45f893999ccb68af980e335b582d813e74f18))
* **US-018:** Update Biome, SonarCloud, and TypeScript configs for all packages ([20da9b5](https://github.com/jbcom/thumbcode/commit/20da9b562d39ba1f28e6a70c4043c355402609dc))
* v1.0 consolidation wave 2 — US-001, US-003, US-008, US-011, US-013, US-015 completed (15/24 stories done) ([27fc191](https://github.com/jbcom/thumbcode/commit/27fc191c5a104e6c66d9c554e8680d4f345d3231))
* wire up CredentialService in onboarding API Keys screen ([#140](https://github.com/jbcom/thumbcode/issues/140)) ([372ba43](https://github.com/jbcom/thumbcode/commit/372ba430b749bf98f291126717d319448f88fbc0))
* wire up GitHub repository fetching in CreateProjectPage ([#132](https://github.com/jbcom/thumbcode/issues/132)) ([002d2dc](https://github.com/jbcom/thumbcode/commit/002d2dc1034d1838d666eff9e8f76c24a07c981b))
* wire up onboarding stubs, GitHub API, icon tree-shaking ([#144](https://github.com/jbcom/thumbcode/issues/144)) ([d94f345](https://github.com/jbcom/thumbcode/commit/d94f3451fa9eeb2ddd2d9318d868c195f726347e))


### Bug Fixes

* brand consistency, new components, and accessibility (issues [#80](https://github.com/jbcom/thumbcode/issues/80), [#82](https://github.com/jbcom/thumbcode/issues/82), [#83](https://github.com/jbcom/thumbcode/issues/83), [#86](https://github.com/jbcom/thumbcode/issues/86)) ([#142](https://github.com/jbcom/thumbcode/issues/142)) ([65b0538](https://github.com/jbcom/thumbcode/commit/65b05384f18d501f9fc23ce20502e2c7a23d3664))
* **ci:** add checkout step before release PR auto-merge ([#160](https://github.com/jbcom/thumbcode/issues/160)) ([a125fb1](https://github.com/jbcom/thumbcode/commit/a125fb1c67039f40ec6051da2f7cb4a3d0953b3f))
* **ci:** correct release-please-action SHA and upgrade to v4.4.0 ([#156](https://github.com/jbcom/thumbcode/issues/156)) ([21d86e1](https://github.com/jbcom/thumbcode/commit/21d86e1a88a6d0073418fae3196adfec48d5431d))
* **ci:** enable auto-merge for release-please PRs ([#158](https://github.com/jbcom/thumbcode/issues/158)) ([2269d78](https://github.com/jbcom/thumbcode/commit/2269d7876c9e123bff994dec250bbc78c0b269d1))
* **ci:** extract SonarCloud into separate job to unblock tests ([3e87ba5](https://github.com/jbcom/thumbcode/commit/3e87ba5424ff47d68886d57ea2ffc328d41ff6e9))
* **ci:** make Semgrep SAST non-blocking, remove --error flag ([39d3de7](https://github.com/jbcom/thumbcode/commit/39d3de755d1de829a3337a0df29644cd60bcaf69))
* **ci:** parse release-please PR JSON and split approve/merge steps ([#159](https://github.com/jbcom/thumbcode/issues/159)) ([f6936a7](https://github.com/jbcom/thumbcode/commit/f6936a76f2531c6f48dd8f140f0a4448c4769ccd))
* **ci:** prevent SonarCloud action pinning from failing tests ([c24a192](https://github.com/jbcom/thumbcode/commit/c24a19286becdcaad39924f618cffe58878ccb04))
* **ci:** resolve all CI pipeline failures ([7bee04b](https://github.com/jbcom/thumbcode/commit/7bee04bed2d9fb18a407eddd938992f0cac48de8))
* **ci:** use Java 21 for Android builds (Capacitor 8 requirement) ([3fa2b52](https://github.com/jbcom/thumbcode/commit/3fa2b5230c8d82793c9f0c7c5f9650f7025e7583))
* **deploy:** add baseUrl for GitHub Pages and disable caching ([#62](https://github.com/jbcom/thumbcode/issues/62)) ([047d4e8](https://github.com/jbcom/thumbcode/commit/047d4e899fa6f04dac4e9183ba293bdc01481622))
* **deps:** patch markdown-it ReDoS vulnerability ([#143](https://github.com/jbcom/thumbcode/issues/143)) ([8a90f2e](https://github.com/jbcom/thumbcode/commit/8a90f2ebe001c6f40fa16da4828bef42ebf16d7a))
* **docs:** correct Starlight social config and workflow dist path ([#77](https://github.com/jbcom/thumbcode/issues/77)) ([4f5009e](https://github.com/jbcom/thumbcode/commit/4f5009e2588eb8b812d77772ef8e3d3f2d512707))
* **docs:** correct TypeDoc entry point path ([#78](https://github.com/jbcom/thumbcode/issues/78)) ([6f87127](https://github.com/jbcom/thumbcode/commit/6f871273c6babbef6445c2e809a0fa6072b1bd00))
* **lint:** upgrade Biome to 2.4.4, fix useHookAtTopLevel in OptimizedList ([8d6046e](https://github.com/jbcom/thumbcode/commit/8d6046ede9171f675141bb8b7668814577155c56))
* production readiness P0/P1 fixes across 34 files ([030862d](https://github.com/jbcom/thumbcode/commit/030862d62d8a9daff9b13e4acbbee0284a85d815))
* **production:** critical CSP, permissions, template, and UX fixes ([85beb71](https://github.com/jbcom/thumbcode/commit/85beb71ce597d7eb33710a76a35cedf0cf2f9d27))
* **quality:** SonarCloud bug, code smells, Readonly props ([#120](https://github.com/jbcom/thumbcode/issues/120)) ([8afd603](https://github.com/jbcom/thumbcode/commit/8afd60302e109606a900d0972a21530a94a08587))
* **reliability:** per-tab error boundaries, toggle a11y, clean vite chunks ([bbb2d7f](https://github.com/jbcom/thumbcode/commit/bbb2d7f17cbe0fe69cc28238fd149cf02247d6b0))
* resolve all test failures, lint errors, and formatting ([#145](https://github.com/jbcom/thumbcode/issues/145)) ([6b44332](https://github.com/jbcom/thumbcode/commit/6b44332160b90c8e1ee2b3259d30d996aa347add))
* resolve post-merge typecheck and lint errors from Phase 2 ([#128](https://github.com/jbcom/thumbcode/issues/128)) ([4761efb](https://github.com/jbcom/thumbcode/commit/4761efb84f24a2ad7f20a154d948053c65517e5d))
* resolve typecheck and lint errors from merge conflicts ([#122](https://github.com/jbcom/thumbcode/issues/122)) ([8a2dd33](https://github.com/jbcom/thumbcode/commit/8a2dd33e70a80ae5bbad873375eca9f7f499fdde))
* **security:** add fork detection to prevent untrusted code execution ([#60](https://github.com/jbcom/thumbcode/issues/60)) ([79c7ce9](https://github.com/jbcom/thumbcode/commit/79c7ce9343af0b963216a3010f434864a5be50c6))
* **security:** resolve Dependabot moderate vulnerability (ajv ReDoS) ([807c8e4](https://github.com/jbcom/thumbcode/commit/807c8e4826ab21eb7cf2419d50ffd83a06ee7b9d))
* **tests:** add toast mock to all @/state test mocks ([4ef859d](https://github.com/jbcom/thumbcode/commit/4ef859dae6a572eef7eb53859268b6b9df603e0e))


### Performance Improvements

* optimize DiffViewer parsing with useMemo ([#134](https://github.com/jbcom/thumbcode/issues/134)) ([7aebdf9](https://github.com/jbcom/thumbcode/commit/7aebdf963daefc6ebb78e8a2f99693da0df04e4c))
* optimize FileTree rendering with Zustand store ([#139](https://github.com/jbcom/thumbcode/issues/139)) ([4f30dd6](https://github.com/jbcom/thumbcode/commit/4f30dd66144ad311f7a5a1456127c19e0fd98e69))
* optimize FileTree sorting to reduce object allocation ([#136](https://github.com/jbcom/thumbcode/issues/136)) ([a4dbd6e](https://github.com/jbcom/thumbcode/commit/a4dbd6e9ad0f4143fd2a468aa8e6942dfcd9c7e1))
* optimize syntax highlighter regex compilation ([#133](https://github.com/jbcom/thumbcode/issues/133)) ([b754211](https://github.com/jbcom/thumbcode/commit/b7542117f67abf3f29e702b0c02b6bdcb2943e38))
* parallelize Git diff file comparison ([#107](https://github.com/jbcom/thumbcode/issues/107)) ([f7a2fcd](https://github.com/jbcom/thumbcode/commit/f7a2fcde9197c9b94750870b07c5afaf14dd24bc))
* parallelize GitService.diffWorkingDir ([#104](https://github.com/jbcom/thumbcode/issues/104)) ([4bdb72d](https://github.com/jbcom/thumbcode/commit/4bdb72d54295ee90cfc003dc4c5eb21e799a32f6))


### Code Refactoring

* consolidate services into @thumbcode/core, remove 2.7k LOC dead code ([#68](https://github.com/jbcom/thumbcode/issues/68)) ([63c9ef2](https://github.com/jbcom/thumbcode/commit/63c9ef2aac4703287380ad2d6e25ae811a3af45a))

## [Unreleased]

## [0.1.0] - 2026-01-18

> **Note:** Package names below (e.g. `@thumbcode/agent-intelligence`) reflect the original monorepo structure. As of February 2026, all packages were flattened into `src/` subdirectories. See `docs/architecture/decisions.md` DEC-011 for details.

### Added

**Monorepo Architecture**
- pnpm workspace with 7 packages: `agent-intelligence`, `config`, `core`, `dev-tools`, `state`, `types`, `ui`
- Workspace protocol (`workspace:*`) for internal package references

**Agent Intelligence (`@thumbcode/agent-intelligence`)**
- Unified AI client abstraction supporting Anthropic and OpenAI providers
- Streaming completion support with event-based callbacks
- Tool/function calling support across providers
- Specialized agents: Architect, Implementer, Reviewer, Tester
- `BaseAgent` class with role-based system prompts and task execution
- `createAgent` factory function and `DEFAULT_AGENT_CONFIGS`
- Multi-agent orchestrator with task queuing and dependency resolution
- Parallel execution support with configurable concurrency
- Agent metrics tracking (tokens, duration, success rate)
- Chat components: `ChatBubble`, `ChatInput`, `CodeBlock`, `ActionButton`
- Chat store for managing threads and messages

**Core Services (`@thumbcode/core`)**
- `GitService` with isomorphic-git: clone, commit, push, pull, branch, diff, status
- `GitHttpClient` for authenticated Git HTTP operations
- `CredentialService` with Expo SecureStore hardware-backed encryption
- Biometric authentication for credential access
- API key format validation for Anthropic and GitHub tokens
- `GitHubAuthService` implementing Device Flow + PKCE (no backend required)
- `GitHubApiService` REST client for repository and user operations
- `CertificatePinningService` for TLS certificate verification
- `RequestSigningService` for HMAC request signing
- `RuntimeSecurityService` for jailbreak/root detection

**Configuration (`@thumbcode/config`)**
- Environment configuration via Expo Constants with type-safe access
- Environment validation with required variable checking per environment
- Centralized constants: API URLs, OAuth config, storage keys, rate limits
- Feature flag system with environment-aware toggling
- Development-only feature overrides

**State Management (`@thumbcode/state`)**
- Zustand stores with Immer for immutable updates
- `agentStore` -- agent lifecycle, tasks, status tracking with selectors
- `chatStore` -- threads, messages, typing indicators, approvals
- `credentialStore` -- credential metadata, validation state
- `projectStore` -- projects, workspaces, file trees, branches
- `userStore` -- authentication, settings, preferences
- AsyncStorage persistence layer

**Type Definitions (`@thumbcode/types`)**
- Domain-organized type modules: agents, projects, workspaces, credentials, chat, user, navigation, API, events
- Subpath exports for tree-shakeable imports

**UI Components (`@thumbcode/ui`)**
- `Text` primitive with themed font family support
- `Button` with organic border-radius and coral/teal/gold variants
- `Input` with organic border styling
- `Card` with asymmetric border-radius and organic shadows
- `Container` page layout wrapper
- `Header` with back navigation
- `Alert` with success/error/warning/info variants
- `Spinner` loading indicator
- `ThemeProvider` with `useTheme`, `useColor`, `useSpacing` hooks
- `organicBorderRadius` and `organicShadow` style presets
- Semantic `Icon` component with Ionicons backend

**Dev Tools (`@thumbcode/dev-tools`)**
- TypeScript design token generator (JSON to CSS variables and Tailwind config)
- SVG to PNG icon generator using Sharp (icon, splash, adaptive-icon, favicon)

**App Screens**
- Root layout with Stack navigation
- Tab navigation: Home, Projects, Agents, Chat, Settings
- Onboarding flow: Welcome, API Keys, GitHub Auth, Configuration, Complete
- Project detail and agent detail screens
- Settings screen with theme, editor, and notification preferences
- Demo home screen showcasing the design system

**Design System**
- P3 "Warm Technical" brand identity: Coral/Teal/Gold on Charcoal
- Organic asymmetric border-radius ("paint daube" aesthetic)
- Fraunces (display), Cabin (body), JetBrains Mono (code) typography
- JSON-based design tokens with auto-generation pipeline
- CSS custom properties and Tailwind color config generation

**Infrastructure**
- Expo SDK 52 with expo-router file-based navigation
- NativeWind (Tailwind CSS) for styling
- Biome for linting and formatting
- Commitlint with conventional commit enforcement
- Jest test suite with jest-expo preset
- Playwright E2E tests for web
- GitHub Actions CI: lint, typecheck, test, build validation
- GitHub Actions: PR review, CI auto-fix, issue triage, multi-agent workflows
- Netlify web deployment pipeline
- EAS Build profiles for development, preview, and production
- Local quality stack: Vitest coverage thresholds, Semgrep SAST, jscpd duplication detection

### Security

- Hardware-backed credential encryption via Expo SecureStore
- BYOK model -- user API keys never leave the device
- Certificate pinning for API requests
- HMAC request signing
- Runtime integrity checks (jailbreak/root detection)
- No server-side credential storage
