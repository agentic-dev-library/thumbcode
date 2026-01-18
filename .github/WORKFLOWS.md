# GitHub Actions Workflows Documentation

This document explains all the automated workflows configured for ThumbCode, including our sophisticated multi-agent AI system.

---

## Overview

ThumbCode uses a combination of traditional CI/CD and **multi-agent AI workflows** featuring:
- **Claude** (Anthropic) for code review and analysis
- **Jules** (Google Labs) for autonomous implementation

All actions are pinned to exact commit SHAs for security and reproducibility.

---

## Reusable Components

### Composite Action: `setup-thumbcode`

**Location:** `.github/actions/setup-thumbcode/action.yml`

**Purpose:** DRY (Don't Repeat Yourself) setup for all workflows

**What it does:**
1. Setup Node.js with pnpm cache
2. Install pnpm
3. Install dependencies with frozen lockfile
4. Optionally generate design tokens
5. Optionally generate icons

**Usage in workflows:**
```yaml
- name: Setup ThumbCode environment
  uses: ./.github/actions/setup-thumbcode
  with:
    node-version: '20'      # optional, defaults to 20
    pnpm-version: '10'      # optional, defaults to 10
    generate-tokens: 'true' # optional, defaults to true
    generate-icons: 'false' # optional, defaults to false
```

**Benefits:**
- Eliminates 20+ lines of duplicate setup code per workflow
- Ensures consistent setup across all workflows
- Single source of truth for environment configuration
- Easier to update Node/pnpm versions

---

## Workflows

### 1. CI (`ci.yml`)

**Triggers:** Push to `main`, `develop`, `claude/**` branches, or PRs

**Jobs:**
- **Lint & Type Check** - Biome linting + TypeScript validation
- **Test** - Jest tests with coverage upload to Codecov, Coveralls, and SonarCloud
- **Build** - Expo web build with artifact upload
- **Coveralls Finish** - Finalizes parallel Coveralls build

**Coverage & Quality:**
- ✅ Codecov - Test coverage tracking (legacy)
- ✅ Coveralls - Modern test coverage with badges
- ✅ SonarCloud - Code quality, security vulnerabilities, code smells, duplication

**Duration:** ~10-15 minutes

**Pinned Actions:**
- `actions/checkout@de0fac2` (v6.0.2)
- Uses composite action: `.github/actions/setup-thumbcode` (DRY setup)
- `codecov/codecov-action@5a10915` (v5.5.1)
- `coverallsapp/github-action@643bc37` (v2.3.0)
- `SonarSource/sonarcloud-github-action@e44258b` (v2.3.0)
- `actions/upload-artifact@ea165f8` (v4.6.2)

---

### 2. Deploy Web (`deploy-web.yml`)

**Triggers:** Push to `main` or manual dispatch

**Jobs:**
- Build Expo web app
- Deploy to Netlify production

**Duration:** ~15 minutes

**Secrets Required:**
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

**Pinned Actions:**
- `actions/checkout@de0fac2` (v6.0.2)
- `actions/setup-node@6044e13` (v6.2.0)
- `pnpm/action-setup@41ff726` (v4.2.0)
- `nwtgck/actions-netlify@4cbaf4c` (v3.0.0)
- `actions/upload-artifact@ea165f8` (v4.6.2)

---

### 3. PR Checks (`pr-checks.yml`)

**Triggers:** PR opened, synchronized, or reopened

**Jobs:**
- **Validate** - Token changes, breaking changes detection
- **Preview Deploy** - Deploy PR preview to Netlify

**Features:**
- Validates design token generation
- Detects breaking changes via commit messages
- Creates Netlify preview deployments with unique URLs

**Duration:** ~15 minutes

**Pinned Actions:**
- `actions/checkout@de0fac2` (v6.0.2)
- `actions/setup-node@6044e13` (v6.2.0)
- `pnpm/action-setup@41ff726` (v4.2.0)
- `actions/github-script@f28e40c` (v7.1.0)
- `nwtgck/actions-netlify@4cbaf4c` (v3.0.0)

---

### 4. PR Review with Claude (`pr-review.yml`)

**Triggers:** PR opened, synchronized, ready for review, reopened

**Jobs:**
- Comprehensive Claude code review with progress tracking

**Review Focus:**
1. Code Quality (clean code, error handling, readability)
2. Security (vulnerabilities, input validation, auth)
3. Performance (bottlenecks, optimization)
4. Testing (coverage, quality)
5. Documentation (comments, docs updates)
6. ThumbCode Specific (design tokens, organic styling, brand palette)

**Duration:** ~10-15 minutes

**Secrets Required:**
- `ANTHROPIC_API_KEY`

**Pinned Actions:**
- `actions/checkout@de0fac2` (v6.0.2)
- `anthropics/claude-code-action@a017b83` (v1.0.30)

---

### 5. Auto-Heal CI Failures (`ci-failure-fix.yml`) 🔧

**Triggers:** CI workflow completes with failures (for PRs only)

**Jobs:**
- Analyze failure logs automatically
- **Claude AUTOMATICALLY fixes ALL issues** (no recommendations, only implementations)
- Commits and pushes fixes to dedicated fix branch
- Creates PR with fixes back to original branch

**Features:**
- **AUTOMATIC HEALING MODE** - No manual intervention required
- Only runs on PR branches (not fix branches)
- Downloads and analyzes CI logs
- Auto-fixes linting errors via Biome
- Resolves TypeScript type issues
- Fixes test failures
- Resolves build errors
- Can modify workflow files if needed (workflows: write permission)
- Verifies all fixes by running commands locally
- Creates detailed PR with all changes

**Duration:** ~20 minutes

**Secrets Required:**
- `ANTHROPIC_API_KEY`

**Permissions:**
- `contents: write` - Commit and push fixes
- `pull-requests: write` - Create fix PRs
- `workflows: write` - Modify workflow files if needed
- `checks: write` - Update check status
- `issues: write` - Comment on issues
- `actions: read` - Read CI logs

**Allowed Tools:**
- `edit_file`, `write_file`, `read_file`, `list_directory`, `search_files`, `bash`
- Bash allowlist: `git`, `pnpm`, `npm`, `npx`, `gh`, `biome`, `tsc`, `jest`, `expo`

**Pinned Actions:**
- `actions/checkout@de0fac2` (v6.0.2)
- `anthropics/claude-code-action@a017b83` (v1.0.30)

---

### 6. Issue Triage (`issue-triage.yml`)

**Triggers:** New issue opened

**Jobs:**
- Claude analyzes and categorizes issues
- Adds appropriate labels
- Validates clarity and actionability
- Checks for duplicates
- Adds helpful comments

**Labels Added:**
- Type: `bug`, `feature`, `enhancement`, `documentation`, `question`
- Priority: `priority: high/medium/low`
- Area: `area: agents/ui/docs/ci/design/git`
- Status: `status: needs-triage/ready/blocked`

**Duration:** ~10 minutes

**Secrets Required:**
- `ANTHROPIC_API_KEY`

**Pinned Actions:**
- `actions/checkout@de0fac2` (v6.0.2)
- `anthropics/claude-code-action@a017b83` (v1.0.30)

---

### 7. Auto-Triage PR Comments (`pr-comment-auto-triage.yml`) 🤖💬

**NEW WORKFLOW - Automatically processes feedback from AI agents!**

**Triggers:**
- Issue comment created/edited on PRs
- PR review comment created/edited
- PR review submitted/edited

**Jobs:**

**Phase 1: Detect AI Agent**
- Identifies comments from AI agents (Claude, Jules, Copilot, etc.)
- Filters to only process PR-related comments
- Extracts comment body and PR context

**Phase 2: Auto-Triage & Implement**
- Claude analyzes AI agent feedback
- **AUTOMATICALLY implements ALL actionable suggestions**
- Categorizes issues: security, code quality, performance, style, tests, docs
- Fetches full PR context using gh CLI
- Fixes all issues mentioned in the comment
- Commits and pushes changes to the PR branch
- Replies to the comment with summary of changes
- Labels PR as `auto-healed` and `ai-triage`

**What Gets Auto-Implemented:**
- **Security vulnerabilities** (XSS, injection, auth issues, secrets)
- **Code quality issues** (refactoring, DRY violations, TypeScript types)
- **Performance problems** (optimization, memory leaks, re-renders)
- **ThumbCode style violations** (design tokens, organic styling, brand palette)
- **Test gaps** (missing tests, broken tests)
- **Documentation** (missing comments, outdated docs)

**Duration:** ~30 minutes

**Secrets Required:**
- `ANTHROPIC_API_KEY`

**Permissions:**
- `contents: write` - Commit fixes to PR branch
- `pull-requests: write` - Comment on PRs, add labels
- `workflows: write` - Modify workflows if needed
- `checks: write` - Update check status
- `issues: write` - Comment on issues

**AI Agents Detected:**
- `claude-bot[bot]`
- `jules[bot]`
- `github-actions[bot]`
- `copilot[bot]`
- `coderabbit[bot]`
- `sweep-ai[bot]`
- `deepsource-autofix[bot]`
- `renovate[bot]`
- `dependabot[bot]`

**Allowed Tools:**
- `edit_file`, `write_file`, `read_file`, `list_directory`, `search_files`, `bash`
- Bash allowlist: `git`, `pnpm`, `npm`, `npx`, `gh`, `biome`, `tsc`, `jest`, `expo`

**Pinned Actions:**
- `actions/checkout@de0fac2` (v6.0.2)
- `anthropics/claude-code-action@a017b83` (v1.0.30)
- `actions/github-script@f28e40c` (v7.1.0)

---

### 8. Multi-Agent Auto-Implementation (`multi-agent-triage.yml`) 🤖🤖

**UPDATED - Now AUTOMATICALLY implements issues instead of just triaging!**

**This is our most sophisticated workflow - FULLY AUTOMATED issue implementation!**

**Triggers:**
- PR merged to `main`
- Issue edited, labeled, or unlabeled
- Manual dispatch

**Architecture:**

```
┌─────────────────────────────────────────┐
│  Claude Auto-Implementation             │
│  1. Find ready issues                   │
│  2. Assess & prioritize                 │
│  3. IMPLEMENT top 3 issues              │
│  4. Commit, push, create PRs            │
│  5. Label issues as auto-implemented    │
└─────────────────────────────────────────┘
```

**What Claude Does (AUTOMATICALLY):**

**1. Find Ready Issues**
- Uses gh CLI to search all open issues
- Filters for issues NOT labeled `auto-implemented` or `jules`
- Looks for `status: ready` or clearly actionable issues
- Types: `bug`, `feature`, or `enhancement`

**2. Assess & Prioritize**
Evaluates each issue:
- **Clarity** - Enough detail for autonomous implementation?
- **Scope** - Small enough for single PR (< 200 lines)?
- **Dependencies** - Depends on other open issues?
- **Priority** - Based on labels and PROJECT-STATUS.md roadmap
- **Feasibility** - Can AI implement this alone?

**3. AUTO-IMPLEMENT TOP 3 ISSUES**
For each of the top 3 highest priority issues:
- Creates implementation branch (`claude/auto-impl-issue-{NUMBER}`)
- Reads full context (issue body, CLAUDE.md, relevant files)
- Implements the complete solution
- Uses design tokens (no hardcoded colors)
- Applies organic styling conventions
- Writes proper TypeScript types
- Adds tests for new functionality
- Updates documentation if needed

**4. Verify & Commit**
- Runs: `pnpm biome check --write .`
- Runs: `pnpm tsc --noEmit`
- Runs: `pnpm test --passWithNoTests`
- Runs: `pnpm expo export:web`
- Commits all changes with detailed message
- Pushes to implementation branch

**5. Create PRs & Label**
- Creates PR with detailed description
- Includes checklist of changes
- Links to original issue (Closes #{NUMBER})
- Labels issue as `auto-implemented` and `claude`
- Comments on issue with PR link

**Duration:** ~30 minutes per batch (implements 3 issues in parallel)

**Secrets Required:**
- `ANTHROPIC_API_KEY`

**Permissions:**
- `contents: write` - Create branches, commit, push
- `pull-requests: write` - Create PRs
- `workflows: write` - Modify workflows if needed
- `issues: write` - Label and comment on issues
- `checks: write` - Update check status
- `actions: read` - Read workflow runs
- `statuses: write` - Update commit statuses

**Allowed Tools:**
- `edit_file`, `write_file`, `read_file`, `list_directory`, `search_files`, `bash`
- Bash allowlist: `git`, `pnpm`, `npm`, `npx`, `gh`, `biome`, `tsc`, `jest`, `expo`

**Pinned Actions:**
- `actions/checkout@de0fac2` (v6.0.2)
- `anthropics/claude-code-action@a017b83` (v1.0.30)

**Label System:**
- `auto-implemented` - Implemented by Claude
- `claude` - Processed by Claude
- `status: ready` - Ready for auto-implementation

---

## Required Secrets

Add these to your GitHub repository secrets:

| Secret | Description | Required For |
|--------|-------------|--------------|
| `ANTHROPIC_API_KEY` | Claude API key | PR review, CI auto-fix, issue triage, multi-agent workflow |
| `GOOGLE_JULES_API_KEY` | Jules API key from jules.google.com | Multi-agent workflow |
| `COVERALLS_REPO_TOKEN` | Coveralls coverage tracking token | CI test coverage reporting |
| `SONAR_TOKEN` | SonarCloud code quality token | CI code quality analysis |
| `CODECOV_TOKEN` | Codecov upload token | CI (optional, legacy) |
| `GITHUB_TOKEN` | Auto-provided by GitHub Actions | All workflows (automatic) |

---

## Setup Instructions

### 1. Anthropic API Key

1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add to GitHub: Settings → Secrets → Actions → New secret
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...`

### 2. Google Jules API Key

> Note: Jules is an experimental Google Labs integration and `https://jules.google.com` may only be available to users with special or internal access. The GitHub Action reference `google-labs-code/jules-action@v1` in example workflows is a placeholder and may not correspond to a real, publicly available action. If you cannot access this URL or the action, skip this step, replace the placeholder with your own implementation, or consult your project administrator.

1. Visit [jules.google.com](https://jules.google.com)
2. Authenticate and generate an API key (if you have access)
3. Add to GitHub: Settings → Secrets → Actions → New secret
   - Name: `GOOGLE_JULES_API_KEY`
   - Value: Your Jules API key

### 3. Coveralls Coverage Tracking

1. Sign up at [coveralls.io](https://coveralls.io) with your GitHub account
2. Add your repository: **+ ADD REPOS** → Find `agentic-dev-library/thumbcode` → Toggle ON
3. Click on the repository name to view details
4. Copy the **REPO TOKEN** from the repo settings
5. Add to GitHub: Settings → Secrets → Actions → New secret
   - Name: `COVERALLS_REPO_TOKEN`
   - Value: Your Coveralls repo token

**What you get:**
- Beautiful coverage badges with percentage
- Historical coverage trends
- PR coverage diffs
- Branch coverage comparison

### 4. SonarCloud Code Quality

1. Sign up at [sonarcloud.io](https://sonarcloud.io) with your GitHub account
2. Import your organization: **Analyze new project** → Import from GitHub
3. Select `agentic-dev-library/thumbcode`
4. Configure analysis:
   - Choose **GitHub Actions** as analysis method
   - Project key will be auto-generated: `agentic-dev-library_thumbcode`
5. Copy the **SONAR_TOKEN** from the setup instructions
6. Add to GitHub: Settings → Secrets → Actions → New secret
   - Name: `SONAR_TOKEN`
   - Value: Your SonarCloud token

**What you get:**
- Code quality score (A-E rating)
- Security vulnerability detection
- Code smell identification
- Technical debt estimation
- Code duplication analysis
- PR quality gates

**Configuration:**
- Project settings are in `sonar-project.properties`
- Customize quality gates in SonarCloud dashboard
- Default: Code coverage, duplications, maintainability, reliability, security

### 5. Codecov (Optional, Legacy)

1. Sign up at [codecov.io](https://codecov.io)
2. Add your repository
3. Copy the upload token
4. Add to GitHub: Settings → Secrets → Actions → New secret
   - Name: `CODECOV_TOKEN`
   - Value: Your Codecov token

---

## Usage Examples

### Trigger Multi-Agent Workflow

**Automatically:**
- Merges to `main` trigger Claude to assess open issues
- Claude batches ready issues and labels them `jules`
- Jules automatically creates PRs for the batch

**Manually:**
- Go to Actions → Multi-Agent Issue Triage & PR Automation → Run workflow
- Select branch (usually `main`)
- Click "Run workflow"

**Monitor Progress:**
- Check the Actions tab for workflow runs
- Claude will add comments to issues with analysis
- Jules will create PRs for each issue in the batch
- Look for new branches starting with `jules-`

### Review Claude Feedback

1. Open any PR
2. Claude will add a comment with:
   - Code quality assessment
   - Security concerns
   - Performance issues
   - Testing gaps
   - Documentation needs
   - ThumbCode-specific checks

3. Address the feedback
4. Push new commits
5. Claude will re-review automatically

### Auto-Fix CI Failures

1. If CI fails on your PR
2. Wait ~2 minutes for auto-fix workflow to trigger
3. Claude analyzes logs and creates fix branch
4. A new PR is created with fixes
5. Review and merge the fix PR

---

## Best Practices

### For Claude Code Review

- **Write clear commit messages** - Claude uses these for context
- **Keep PRs focused** - Smaller PRs get better reviews
- **Add tests** - Claude checks test coverage
- **Follow CLAUDE.md** - Claude enforces brand guidelines

### For Multi-Agent Workflow

- **Write detailed issues** - Claude assesses clarity
- **Add proper labels** - Help Claude categorize
- **Check PROJECT-STATUS.md** - Issues aligned with roadmap get prioritized
- **Review Jules PRs promptly** - Unblock next batch

### For Security

- **Never commit secrets** - Always use GitHub Secrets
- **Review AI-generated code** - Always review PRs from Jules
- **Use allowlists** - Workflows use user allowlists for public repos
- **Pin action SHAs** - We pin all actions to exact commits for security

---

## Troubleshooting

### Workflow Fails with "API key not found"

**Solution:** Add the required secret to GitHub repository settings.

### Jules doesn't create PRs

**Causes:**
- Claude didn't find suitable issues
- Issues don't meet criteria (clarity, scope, dependencies)
- `jules` label not added

**Solution:** Check Claude's analysis comment on the workflow run.

### CI auto-fix creates infinite loops

**Prevention:** Auto-fix only runs on original PR branches, not on fix branches (branches starting with `claude-auto-fix-ci-`).

### GitHub Pages deploy fails

**Causes:**
- Pages not enabled in repository settings
- Build error in POC site
- Permissions issue

**Solution:**
1. Enable GitHub Pages in Settings → Pages
2. Check deployment logs in workflow run
3. Verify Pages permissions are granted

---

## Security Considerations

### Action Pinning

All actions are pinned to exact commit SHAs (40-character hashes) instead of version tags. This prevents supply chain attacks where a tag could be moved to a malicious commit.

**Example:**
```yaml
uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
```

### AI Agent Permissions

- **Claude Code Action:** Restricted tool access based on workflow needs
- **Jules Action:** Implements security allowlists to prevent unauthorized use
- **GitHub Token:** Uses minimum required permissions per job

### Secret Management

- All secrets stored in GitHub encrypted storage
- Secrets never logged or exposed in workflow outputs
- API keys rotated regularly

---

## AI Shortcuts 🚀

**NEW! Trigger powerful AI automation via comment mentions**

ThumbCode now includes AI shortcuts that you can trigger by mentioning them in issue or PR comments. These shortcuts engage Claude AI and CodeRabbit AI for automatic complex tasks.

> **📚 Full documentation:** See [SHORTCUTS.md](./SHORTCUTS.md) for comprehensive guide with examples

### Quick Reference

| Shortcut | Where | What | Duration |
|----------|-------|------|----------|
| `@rebase` | PR comments | Auto-rebase with conflict resolution | ~5-15 min |
| `@triage` | Issue/PR comments | Multi-AI triage and categorization | ~10-20 min |
| `@review` | PR comments | Collaborative deep code review | ~20-30 min |
| `@backlog` | Anywhere/Manual | Full backlog analysis and organization | ~20-30 min |
| `@ready` | Issue/PR comments | Check resolution/comment status | ~10-20 min |

### 9. `@rebase` - Auto-Rebase PR (`shortcut-rebase.yml`) 🔀

**Trigger:** Comment `@rebase` on a pull request

**What It Does:**
- Fetches latest from base branch
- Attempts automatic rebase
- **If conflicts:** Claude resolves them automatically with intelligent merge
- Verifies all changes (lint, typecheck, test, build)
- Force-pushes rebased branch
- Posts summary comment with details

**Use Cases:**
- PR is behind base branch
- Need to incorporate latest changes
- Have merge conflicts to resolve automatically

**Workflow Details:**
- **Phase 1:** Detect `@rebase` command in comments
- **Phase 2:** Attempt auto-rebase (no conflicts)
- **Phase 3:** If conflicts → Claude analyzes both sides, intelligently merges, verifies
- **Phase 4:** Force-push with `--force-with-lease`
- **Phase 5:** Comment with resolution summary

**Duration:** ~5-15 minutes (longer with complex conflicts)

**Permissions:**
- `contents: write` - Push code, force-push
- `pull-requests: write` - Comment on PR

**Pinned Actions:**
- `actions/checkout@de0fac2` (v6.0.2)
- `anthropics/claude-code-action@a017b83` (v1.0.30)
- `actions/github-script@f28e40c` (v7.1.0)

---

### 10. `@triage` - Multi-AI Triage (`shortcut-triage.yml`) 🔍

**Trigger:** Comment `@triage` on an issue or PR

**What It Does:**
- Engages **CodeRabbit AI** for technical analysis
- Engages **Claude** for ThumbCode-specific analysis
- Both AIs provide complementary, non-duplicate assessments
- Automatically adds appropriate labels
- Posts comprehensive triage reports

**On Issues:**
- **CodeRabbit:** Category, priority, complexity, requirements, implementation approach
- **Claude:** ThumbCode roadmap alignment (PROJECT-STATUS.md), feasibility, style compliance
- Auto-labels: type, priority, area, status
- Duplicate detection across repository

**On PRs:**
- **CodeRabbit:** Code quality, security, performance, TypeScript, testing
- **Claude:** CLAUDE.md compliance, design tokens, organic styling, architecture fit
- Collaborative feedback with specific suggestions

**Duration:** ~10-20 minutes

**Permissions:**
- `contents: write` - Read codebase and docs
- `issues: write` - Add labels, comment
- `pull-requests: write` - Add review comments

**Pinned Actions:**
- `actions/checkout@de0fac2` (v6.0.2)
- `anthropics/claude-code-action@a017b83` (v1.0.30)
- `actions/github-script@f28e40c` (v7.1.0)

---

### 11. `@review` - Collaborative AI Code Review (`shortcut-review.yml`) 🔎

**Trigger:** Comment `@review` on a pull request

**What It Does:**
- **CodeRabbit** performs comprehensive review:
  - Code quality (DRY, SOLID, KISS, complexity)
  - Security (XSS, injection, auth, secrets)
  - Performance (algorithms, React optimization, memory, bundle size)
  - TypeScript (type safety, no `any`, proper generics)
  - Testing (coverage, edge cases, test quality)
  - Documentation (comments, JSDoc, README)
  - Line-by-line comments with code examples

- **Claude** performs ThumbCode-specific deep review:
  - **CLAUDE.md Compliance (CRITICAL):** Design tokens, organic styling, no gradients
  - **Warm Technical Palette:** Coral (#FF7059), Teal (#0D9488), Gold (#F5D563)
  - **Typography:** Fraunces (display), Cabin (body), JetBrains Mono (code) - NOT Inter/Roboto
  - **Architecture Alignment:** Follows ARCHITECTURE.md patterns
  - **Roadmap Fit:** Aligns with PROJECT-STATUS.md current phase
  - **Mobile-First:** Touch targets, responsive, performance, accessibility
  - **React Best Practices:** Hooks, effects, memoization

- Both post detailed reviews with:
  - 🚨 Critical issues (must fix)
  - ⚠️ High priority warnings (should fix)
  - 💡 Suggestions (nice to have)
  - Code examples for fixes

**Duration:** ~20-30 minutes (comprehensive review)

**Permissions:**
- `contents: write` - Read all files deeply
- `pull-requests: write` - Add review comments
- `checks: write` - Update review status

**When to Use:**
- PR ready for thorough review before merge
- Need multiple AI perspectives
- Want both general + ThumbCode-specific feedback
- Large/important changes

**Pinned Actions:**
- `actions/checkout@de0fac2` (v6.0.2)
- `anthropics/claude-code-action@a017b83` (v1.0.30)
- `actions/github-script@f28e40c` (v7.1.0)

---

### 12. `@backlog` - Collaborative Backlog Triage (`shortcut-backlog.yml`) 📋

**Trigger:** Comment `@backlog` anywhere OR manual workflow dispatch

**What It Does:**
- Creates triage coordination issue
- **CodeRabbit** analyzes entire open backlog:
  - Priority ranking (impact, urgency, dependencies)
  - Categorization (type, area, complexity)
  - Duplicate detection across all issues
  - Missing information identification
  - Quick wins (simple, high-value issues)
  - Technical debt issues

- **Claude** performs strategic planning:
  - Roadmap alignment with PROJECT-STATUS.md
  - AI-implementation feasibility assessment (< 200 lines, clear requirements)
  - Quality impact (code quality, UX, tech debt reduction)
  - Strategic bucketing

- **Both AIs automatically:**
  - Apply labels to ALL issues
  - Assign milestones (v1.0.0, v1.1.0, etc.)
  - Close duplicates and won't-fix issues
  - Mark ready issues with `status: ready` for auto-implementation

- Posts comprehensive backlog report with:
  - 🚀 **High Priority** (X issues) - Do now
  - ✅ **Ready for AI Auto-Implementation** (X issues) - Queued for auto-impl workflow
  - 📅 **Backlog - Next Phase** (X issues) - Defer to v1.1.0/v2.0.0
  - 🔒 **Blocked** (X issues) - Waiting on dependencies
  - ❌ **Recommended to Close** (X issues) - Duplicates, out of scope

**Duration:** ~20-30 minutes (processes 100+ issues)

**Permissions:**
- `contents: write` - Read strategic docs
- `issues: write` - Label, milestone, close, create issues

**When to Use:**
- Backlog cluttered and needs organization
- Planning next sprint or phase
- Want to identify auto-implementable work
- Monthly backlog cleanup

**Pinned Actions:**
- `actions/checkout@de0fac2` (v6.0.2)
- `anthropics/claude-code-action@a017b83` (v1.0.30)
- `actions/github-script@f28e40c` (v7.1.0)

---

### 13. `@ready` - Readiness Check (`shortcut-ready.yml`) ✅

**Trigger:** Comment `@ready` on an issue or PR

**What It Does:**

**On Issues (Resolution Check):**
1. Fetches issue details and acceptance criteria
2. **Comprehensively searches codebase** for implementation:
   - Keyword search from title/body
   - Recent commit history (`git log`)
   - Related file modifications
   - Implementation patterns
3. Verifies implementation quality:
   - Runs: `pnpm biome check .`
   - Runs: `pnpm tsc --noEmit`
   - Runs: `pnpm test --passWithNoTests`
   - Runs: `pnpm expo export:web`
4. Reports: **RESOLVED** / **PARTIALLY RESOLVED** / **NOT RESOLVED** / **DUPLICATE**
5. **Auto-closes if fully resolved** with evidence

**On PRs (Comment Resolution Check):**
1. Fetches all comments, reviews, threads (100+ comments supported)
2. **Categorizes each comment:**
   - ✅ **Addressed** - Code changed, question answered, concern resolved
   - ⚠️ **Acknowledged but Deferred** - Out of scope, tracked in follow-up
   - ❌ **Unaddressed** - Needs response or implementation
   - 🤖 **AI Hallucination** - Invalid feedback (incorrect understanding)

3. Verifies code changes against suggestions:
   - Checks file modifications via `gh pr diff`
   - Matches changes to comment suggestions
   - Ensures no test breakage

4. **Auto-resolves AI hallucination threads** (you have permission!)
   - Uses GitHub GraphQL API to resolve threads
   - Adds dismissal comment with explanation

5. **Creates follow-up issues** for deferred items:
   - Tracks good ideas that are out of scope for this PR
   - Links back to original PR comment
   - Labels as `enhancement,follow-up`

6. Reports: **READY TO MERGE** / **NEEDS ATTENTION** / **NOT READY**

**Duration:** ~10-20 minutes

**Permissions:**
- `contents: write` - Read codebase, commit history
- `issues: write` - Close issues, create follow-ups
- `pull-requests: write` - **Resolve threads**, comment

**Advanced Capabilities:**
- Can **resolve review threads** (including invalid AI feedback)
- Can **auto-close issues** when verified as resolved
- Can **create follow-up issues** from deferred PR comments

**When to Use Issues:**
- Old issue might be resolved now
- Verify implementation completion
- Backlog cleanup

**When to Use PRs:**
- Lots of comments, want summary
- Check if all feedback addressed before merge
- Need to resolve invalid AI comment threads
- Want to track deferred items

**Pinned Actions:**
- `actions/checkout@de0fac2` (v6.0.2)
- `anthropics/claude-code-action@a017b83` (v1.0.30)
- `actions/github-script@f28e40c` (v7.1.0)

---

### Shortcut Workflow Combinations

**Complete PR Workflow:**
```
1. Create PR
2. @review          # Get comprehensive review from both AIs
3. (address feedback)
4. @ready           # Verify all comments addressed
5. @rebase          # Update with latest main
6. Merge!
```

**Issue Lifecycle:**
```
1. Create issue
2. @triage          # Categorize and prioritize
3. (Auto-implementation if labeled status: ready)
4. @ready           # Verify resolution in codebase
5. (Auto-close if resolved)
```

**Backlog Management:**
```
1. @backlog         # Monthly: analyze all open issues
2. (Labels applied, ready issues marked)
3. (Auto-implementation workflow runs for ready issues)
4. @ready on each   # Verify implementations
```

**Emergency Merge:**
```
1. @review          # Quick comprehensive review
2. @ready           # Check comments
3. (Fix any issues)
4. @rebase          # Ensure up to date
5. Emergency merge
```

---

## Repository Configuration

### Settings.yml

**Location:** `.github/settings.yml`

**Purpose:** Automated repository configuration using [Probot Settings](https://github.com/apps/settings)

**What It Configures:**

**1. Bot Permissions**
Grants write access to all automation bots:
- `github-actions[bot]`
- `claude-bot[bot]`
- `renovate[bot]`
- `dependabot[bot]`

**2. Branch Protection**

**Main Branch:**
- Requires passing CI checks (Lint, Test, Build)
- No required approving reviews (allows bot auto-merges)
- No restrictions on who can push
- Prevents force pushes and deletions
- Allows auto-merge

**Claude Branches** (`claude/**`, `claude/auto-fix-ci-*`, `claude/auto-impl-*`):
- Minimal protection
- Allows force pushes
- Allows deletions
- No required reviews
- No required status checks
- Enables rapid development and iteration

**3. Labels**
Auto-creates all required labels:
- Type: `bug`, `feature`, `enhancement`, `documentation`, `question`
- Priority: `priority: high/medium/low`
- Area: `area: agents/ui/docs/ci/design/git`
- Status: `status: needs-triage/ready/blocked/in-progress`
- AI: `claude`, `jules`, `auto-implemented`, `auto-healed`, `ai-triage`

**4. Repository Settings**
- Enable auto-merge
- Delete branches after merge
- Enable automated security fixes
- Enable vulnerability alerts
- Disable wiki (use docs/ folder instead)

**Benefits:**
- **Eliminates manual configuration** across repository settings
- **Ensures consistency** between environments
- **Infrastructure as code** for repository settings
- **Easy replication** to other repositories
- **Audit trail** via Git history

---

## Permissions Summary

All workflows now have comprehensive permissions to enable full automation:

| Permission | Purpose |
|------------|---------|
| `contents: write` | Create branches, commit, push code |
| `pull-requests: write` | Create PRs, comment, add labels |
| `issues: write` | Label issues, add comments |
| `workflows: write` | Modify workflow files if needed |
| `checks: write` | Update check status |
| `actions: read` | Read workflow runs and logs |
| `statuses: write` | Update commit statuses |
| `id-token: write` | OIDC authentication |

**Bot Access:**
- All workflows use `allow_any_user: true` to allow bot accounts
- Bot users have write permissions via settings.yml
- Bots can push to all `claude/**` branches without restrictions
- Bots can create PRs and auto-merge when checks pass

---

## Sources

- [Claude Code Action Docs](https://github.com/anthropics/claude-code-action) - Anthropic's GitHub Action documentation
- [Jules Action Docs](https://github.com/google-labs-code/jules-action) - Google Labs Jules Action
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides) - GitHub's security best practices
- [Probot Settings](https://github.com/apps/settings) - Automated repository configuration
- [actions/checkout v6.0.2](https://github.com/actions/checkout/releases/tag/v6.0.2)
- [actions/setup-node v6.2.0](https://github.com/actions/setup-node/releases/tag/v6.2.0)
- [pnpm/action-setup v4.2.0](https://github.com/pnpm/action-setup/releases/tag/v4.2.0)

---

*Built with ❤️ by ThumbCode fully-automated multi-agent team.*
