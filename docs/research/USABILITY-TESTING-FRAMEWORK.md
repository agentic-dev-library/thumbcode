# Usability Testing Framework (1.0)

This document defines the testing program ThumbCode must complete for 1.0.

Goal: validate that users can successfully complete the core flows **on a phone**, with high confidence, without a laptop.

---

## Core Flows to Validate (1.0)

1. **Onboarding**
   - Connect GitHub (Device Flow)
   - Add at least one AI provider key
   - Create first project by cloning a repo
2. **Project workflow**
   - View project, browse files, view commits
3. **Agent workflow**
   - View agent team, inspect an agent, understand status and tasks
4. **Chat workflow**
   - Start a thread, send a message, see agent response, handle approvals
5. **Settings**
   - Verify stored credentials, update preferences

---

## Participant Profiles

Minimum set for 1.0:
- 5 mobile-first developers
- 5 professional engineers (desktop-native)
- 3 technical leaders (EM/lead/CTO)
- 2 accessibility users (screen reader primary)

---

## Study Types (run in sequence)

### 1) Internal Dogfooding (week 1)
- Run the full flows daily
- Log friction points with screen recordings

### 2) Moderated Sessions (week 2–3)
- 45 minutes per participant
- Think-aloud protocol
- Capture task completion time and errors

### 3) Beta Group (week 4)
- Unmoderated usage over 3–7 days
- Collect feedback + crash/analytics signals

---

## Tasks & Success Criteria

### Task: GitHub connect
- **Success**: user completes device flow without assistance
- **Measure**: time to success; number of retries; comprehension of “user code” step

### Task: Add AI key
- **Success**: user adds key and sees confirmed valid state
- **Measure**: error rate; drop-off; perceived trust

### Task: Clone & open project
- **Success**: user selects a repo and lands in project screen
- **Measure**: completion time; confusion points; progress clarity

### Task: Understand agents
- **Success**: user can answer “what are agents doing?”
- **Measure**: correctness of status interpretation

---

## Instrumentation (privacy-first)

For 1.0, log only:
- Funnel step completions
- Non-sensitive errors (no keys, no tokens, no file contents)
- Performance signals (screen load time buckets)

Do not capture:
- API keys
- repository contents
- raw chat logs unless explicitly opted-in by tester

---

## Artifacts to Produce (1.0)

- Session notes + anonymized outcomes
- Severity-tagged issue list (P0/P1/P2)
- SUS score (or equivalent) per persona
- Accessibility findings summary
- A “1.0 readiness” report linking to fixes merged on the integration branch

