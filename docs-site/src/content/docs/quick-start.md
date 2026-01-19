---
title: Quick Start
description: Get up and running with ThumbCode in minutes.
---

Get ThumbCode running on your device and connect to your first repository.

## Prerequisites

Before you begin, ensure you have:

- A GitHub account
- An Anthropic API key (for Claude) or OpenAI API key
- An iOS or Android device (or emulator)

## Installation

### From App Store (Coming Soon)

ThumbCode will be available on the iOS App Store and Google Play Store.

### Development Build

If you want to run ThumbCode from source:

```bash
# Clone the repository
git clone https://github.com/agentic-dev-library/thumbcode.git
cd thumbcode

# Install dependencies
pnpm install

# Start the development server
pnpm start
```

Then open the Expo Go app on your device and scan the QR code.

## First-Time Setup

When you first launch ThumbCode, you'll be guided through the onboarding process:

### 1. Connect GitHub

ThumbCode uses GitHub's Device Flow for authentication:

1. Tap **"Start GitHub Authentication"**
2. You'll receive a code like `ABCD-1234`
3. Open `github.com/login/device` on any device
4. Enter the code to authorize ThumbCode
5. Return to the app - you're connected!

### 2. Add API Keys

Your API keys are stored securely on your device:

1. Tap **"Add API Key"**
2. Enter your Anthropic API key (`sk-ant-...`)
3. Optionally add OpenAI key for additional models

Your keys are encrypted using hardware-backed secure storage and never leave your device.

### 3. Clone Your First Repository

1. Go to the **Projects** tab
2. Tap **"Clone Repository"**
3. Paste a GitHub repository URL
4. Wait for the clone to complete

## Your First Agent Task

Now let's have the agents make a change:

1. Open your cloned project
2. Tap the **Chat** icon to open the agent interface
3. Type: "Add a greeting message to the README"
4. Watch as the agents:
   - **Architect** plans the change
   - **Implementer** writes the code
   - **Reviewer** validates the change
   - **Tester** verifies nothing broke
5. Review and approve the commit
6. Push to GitHub!

## Next Steps

Now that you're set up, explore:

- [Agent System](/thumbcode/agents/overview/) - Understand how agents work together
- [Git Operations](/thumbcode/guides/git-operations/) - Learn the full git workflow
- [Settings](/thumbcode/guides/settings/) - Customize your experience
