# Security Policy

This document outlines the security procedures and policies for the ThumbCode project.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it to us as soon as possible. We take all security reports seriously and will investigate them promptly.

To report a vulnerability, please email us at `security@thumbcode.com` with the following information:

- A detailed description of the vulnerability, including the steps to reproduce it.
- The version of the application you are using.
- Any proof-of-concept code or screenshots that can help us understand the issue.

We will acknowledge your report within 48 hours and will keep you informed of our progress. We ask that you do not disclose the vulnerability publicly until we have had a chance to address it.

## Security Features

The ThumbCode application includes several security features to protect user data and ensure the integrity of the application.

### Credential Storage

- All sensitive credentials, such as API keys and tokens, are stored using `expo-secure-store`, which leverages hardware-backed encryption on both iOS and Android.
- Credentials are encrypted at rest and are only accessible when the device is unlocked.
- Biometric authentication (Face ID or fingerprint) is required to access or modify credentials.

### API Communication

- All API communication is protected by TLS encryption.
- Certificate pinning is implemented to prevent man-in-the-middle attacks. The application will only trust the public keys of the pre-configured API endpoints.
- All requests to the `mcp_server` are signed with an HMAC-SHA256 signature to prevent tampering and ensure authenticity.

### Input Sanitization

- All user-provided input, including API keys and project information, is sanitized and validated using `zod` before being stored or used.
- This helps to prevent a range of injection attacks and ensures the integrity of the data.

### Runtime Security

- The application includes runtime security checks to detect if it is running on a rooted or jailbroken device.
- If a compromised environment is detected, the user will be alerted and the application will exit.

### Web Security

- The web version of the application includes a strict Content Security Policy (CSP) to mitigate cross-site scripting (XSS) and other injection attacks.
- Other security headers, such as `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy`, are also in place.

## Secure Development Practices

- All dependencies are regularly scanned for vulnerabilities using `pnpm audit`.
- The principle of least privilege is followed when requesting permissions.
- All code is reviewed for security vulnerabilities before being merged into the main branch.

## Security Audits

The application will undergo regular security audits to identify and address any potential vulnerabilities. The results of these audits will be made available to the public.
