# Security Policy

This document outlines the security procedures and policies for the ThumbCode project.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly. We take all security reports seriously and will investigate them promptly.

To report a vulnerability, please open a private security advisory on GitHub with the following information:

- A detailed description of the vulnerability, including the steps to reproduce it.
- The version of the application you are using.
- Any proof-of-concept code or screenshots that can help us understand the issue.

We will acknowledge your report within 48 hours and will keep you informed of our progress. We ask that you do not disclose the vulnerability publicly until we have had a chance to address it.

## Security Features

The ThumbCode application includes several security features to protect user data and ensure the integrity of the application.

### Credential Storage

- All sensitive credentials (API keys, tokens) are stored using `capacitor-secure-storage-plugin`, which leverages iOS Keychain and Android Keystore for hardware-backed encryption.
- Credentials are encrypted at rest and are only accessible when the device is unlocked.
- Biometric authentication (Face ID or fingerprint) is available via `@aparajita/capacitor-biometric-auth` to protect credential access.
- **BYOK model**: User API keys never leave the device. There is no server-side credential storage.

### API Communication

- All API communication is protected by TLS encryption.
- Certificate pinning is implemented to prevent man-in-the-middle attacks.
- All requests to the MCP server are signed with an HMAC-SHA256 signature to prevent tampering and ensure authenticity.

### Input Sanitization

- All user-provided input, including API keys and project information, is sanitized and validated using Zod before being stored or used.
- This helps prevent injection attacks and ensures the integrity of the data.

### Runtime Security

- The application includes runtime security checks to detect if it is running on a rooted or jailbroken device.
- If a compromised environment is detected, the user will be alerted and the application will exit.

### Web Security

- The web version includes a strict Content Security Policy (CSP) to mitigate cross-site scripting (XSS) and other injection attacks.
- Other security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) are configured.

## Secure Development Practices

- Dependencies are scanned for vulnerabilities via `pnpm audit` (CI enforces zero moderate+ vulnerabilities in production deps).
- Static analysis via Semgrep CE runs on every push (SARIF results uploaded to GitHub Security tab).
- Code duplication is monitored via jscpd (< 5% threshold).
- Biome enforces consistent linting and formatting across the codebase.
- The principle of least privilege is followed when requesting permissions.
- All code is reviewed for security vulnerabilities before being merged.

## CI/CD Security

- All GitHub Actions are SHA-pinned (no version tags) to prevent supply chain attacks.
- Dependabot monitors npm packages and GitHub Actions for known vulnerabilities.
- The CI pipeline runs lint, typecheck, test, Semgrep SAST, and build on every push.
