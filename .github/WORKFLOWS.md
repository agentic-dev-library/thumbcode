# GitHub Actions Workflows Documentation

This document explains all the automated workflows configured for ThumbCode, including our sophisticated multi-agent AI system.

---

## Overview

ThumbCode uses a combination of traditional CI/CD and **multi-agent AI workflows** featuring:
- **Claude** (Anthropic) for code review and analysis
- **Jules** (Google Labs) for autonomous implementation

All actions are pinned to exact commit SHAs for security and reproducibility.

---

## Workflows

### 1. CI (`ci.yml`)

**Triggers:** Push to `main`, `develop`, `claude/**` branches, or PRs

**Jobs:**
- **Lint & Type Check** - Biome linting + TypeScript validation
- **Test** - Jest tests with coverage upload to Codecov
- **Build** - Expo web build with artifact upload

**Duration:** ~10-15 minutes

**Pinned Actions:**
- `actions/checkout@de0fac2` (v6.0.2)
- `actions/setup-node@6044e13` (v6.2.0)
- `pnpm/action-setup@41ff726` (v4.2.0)
- `codecov/codecov-action@5a10915` (v5.5.1)
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

### 5. Auto Fix CI Failures (`ci-failure-fix.yml`)

**Triggers:** CI workflow completes with failures (for PRs only)

**Jobs:**
- Analyze failure logs
- Claude automatically fixes issues
- Creates fix branch and PR

**Features:**
- Only runs on PR branches (not fix branches)
- Downloads and analyzes CI logs
- Creates dedicated fix branch
- Fixes linting, type errors, test failures, build errors

**Duration:** ~20 minutes

**Secrets Required:**
- `ANTHROPIC_API_KEY`

**Allowed Tools:**
- `edit_file`, `write_file`, `read_file`, `list_directory`, `search_files`, `bash`
- Bash allowlist: `git`, `pnpm`, `npm`, `npx`, `gh`

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

### 7. Multi-Agent Triage & PR Automation (`multi-agent-triage.yml`) 🤖🤖

**This is our most sophisticated workflow - a coordinated multi-agent system!**

**Triggers:**
- PR merged to `main`
- Issue edited, labeled, or unlabeled
- Manual dispatch

**Architecture:**

```
┌──────────────────┐
│  Claude Analysis │  Phase 1: Assess & Prioritize
│   (Anthropic)    │
└────────┬─────────┘
         │
         │ Outputs: Batch of issues ready for automation
         │
         ▼
┌──────────────────┐
│ Jules Implement  │  Phase 2: Create PRs
│  (Google Labs)   │
└──────────────────┘
```

**Phase 1: Claude Analysis**

Claude searches for and assesses issues that are:
- NOT labeled `jules` (haven't been processed)
- NOT associated with an open PR
- Labeled `status: ready` or clearly actionable
- Type: `bug`, `feature`, or `enhancement`

**Evaluation Criteria:**
1. **Clarity** - Enough detail for autonomous implementation?
2. **Scope** - Small enough for single PR (< 200 lines)?
3. **Dependencies** - Depends on other open issues?
4. **Priority** - Based on labels and PROJECT-STATUS.md
5. **Feasibility** - Can AI agent implement this?

**Batching Strategy:**
- Groups 3-5 issues per batch
- Issues can be worked in parallel (no dependencies)
- Similar in nature (e.g., all UI bugs)
- Aligned with current phase from PROJECT-STATUS.md

**Phase 2: Jules Implementation**

Jules receives the batch from Claude and:
- Implements each issue autonomously
- Follows CLAUDE.md playbook strictly
- Uses design tokens (no hardcoded colors)
- Applies organic styling conventions
- Writes TypeScript with strict types
- Adds tests for new functionality
- Creates PRs with proper conventional commit messages

**Parallel Execution:**
- Matrix strategy allows up to 3 issues in parallel
- Each issue gets its own job run
- PRs created independently

**Duration:** ~30 minutes per batch

**Secrets Required:**
- `ANTHROPIC_API_KEY`
- `GOOGLE_JULES_API_KEY`

**Pinned Actions:**
- `actions/checkout@de0fac2` (v6.0.2)
- `anthropics/claude-code-action@a017b83` (v1.0.30)
- `google-labs-code/jules-action@v1`
- `actions/github-script@f28e40c` (v7.1.0)

**Label System:**
- `jules` - Marked for Jules processing
- `batch: YYYY-MM-DD` - Batch identifier
- `jules-processing` - Currently being worked on
- `jules-complete` - PR created successfully

---

## Required Secrets

Add these to your GitHub repository secrets:

| Secret | Description | Required For |
|--------|-------------|--------------|
| `ANTHROPIC_API_KEY` | Claude API key | PR review, CI auto-fix, issue triage, multi-agent workflow |
| `GOOGLE_JULES_API_KEY` | Jules API key from jules.google.com | Multi-agent workflow |
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token | Deploy, PR previews |
| `NETLIFY_SITE_ID` | Netlify site ID | Deploy, PR previews |
| `CODECOV_TOKEN` | Codecov upload token | CI (optional) |
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

1. Visit [jules.google.com](https://jules.google.com)
2. Authenticate and generate an API key
3. Add to GitHub: Settings → Secrets → Actions → New secret
   - Name: `GOOGLE_JULES_API_KEY`
   - Value: Your Jules API key

### 3. Netlify Tokens

1. Log in to Netlify
2. Go to User Settings → Applications → Personal Access Tokens
3. Create new access token
4. Add to GitHub: Settings → Secrets → Actions → New secret
   - Name: `NETLIFY_AUTH_TOKEN`
   - Value: Your Netlify token

5. Get Site ID from Site Settings → General → Site details → Site ID
6. Add to GitHub: Settings → Secrets → Actions → New secret
   - Name: `NETLIFY_SITE_ID`
   - Value: Your site ID

### 4. Codecov (Optional)

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

### Netlify deploy fails

**Causes:**
- Invalid secrets
- Site ID mismatch
- Build error

**Solution:** Check deployment logs in workflow run.

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

## Sources

- [Claude Code Action Docs](https://github.com/anthropics/claude-code-action) - Anthropic's GitHub Action documentation
- [Jules Action Docs](https://github.com/google-labs-code/jules-action) - Google Labs Jules Action
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides) - GitHub's security best practices
- [actions/checkout v6.0.2](https://github.com/actions/checkout/releases/tag/v6.0.2)
- [actions/setup-node v6.2.0](https://github.com/actions/setup-node/releases/tag/v6.2.0)
- [pnpm/action-setup v4.2.0](https://github.com/pnpm/action-setup/releases/tag/v4.2.0)

---

*Built with ❤️ by ThumbCode multi-agent team.*
