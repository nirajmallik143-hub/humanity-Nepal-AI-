## Summary

Updates the Humanity World sign-in experience to support individual email/password accounts and Google sign-in through Firebase Authentication, matching the supplied student portal reference. Also keeps the installable PWA and multilingual study experience.

## Changes

- Add a responsive dark, glass-style account modal with Sign in / Sign up tabs.
- Add Firebase email/password signup, email verification, sign-in, and password reset; retain Google authentication.
- Enforce Firebase ID-token validation server-side and require email verification for password-based accounts before protected AI access.
- Recommend unique passwords of at least 12 characters; do not add a shared `1234` credential.
- Document Firebase setup, secrets, AI configuration, PWA installation, and deployment.

## Verification

- [ ] Configure Firebase Email/Password and Google providers and authorized domains.
- [ ] Test signup, verification, login, reset, logout, and Google sign-in.
- [ ] Verify unverified and unauthenticated API requests are rejected.
- [ ] Test AI language selection, input validation, provider missing-key and provider-error behavior.
- [ ] Run PWA checks on Android, iOS Safari, and desktop.
- [ ] Confirm secrets are absent from Git; retain MIT and 2026 copyright notice.

## Security

No fixed/shared password is added. Firebase manages individual user password credentials; secrets remain server-side. Add rate limiting, spend limits, and a privacy notice before public launch.
