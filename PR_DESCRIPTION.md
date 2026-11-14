## Summary

Adds Google account sign-in and broader answer-language selection to Humanity World, while keeping authentication and AI provider credentials server-verified and out of the browser.

## Changes

- Add a floating account/language control with Google sign-in, sign-out, and a 40-language AI answer selector.
- Use Firebase Authentication: first Google sign-in creates the account; later sign-ins reuse it.
- Require and verify Firebase ID tokens server-side before accepting study-guide requests.
- Add public Firebase Web config endpoint (client settings only) and a server-only service-account credential configuration.
- Expand supported AI answer languages and document provider, privacy, and deployment setup.
- Keep the MIT License and Copyright (c) 2026 Niraj Mallik notice.

## Security decisions

A four-digit code is not used as the account password because it is trivially guessable as a standalone credential. Google sign-in is the primary account authentication. Any future PIN should only be a local convenience lock after a secure sign-in, never a replacement for it.

## Verification

- [ ] Configure Firebase Google provider, OAuth consent, and authorized domains.
- [ ] Configure Firebase web settings, Admin service account secret, and AI provider key locally/for Vercel.
- [ ] Verify first-time Google signup and returning-user sign-in.
- [ ] Verify no-token request is rejected and valid Firebase token succeeds.
- [ ] Test selected language, empty/oversized input, absent secrets, and provider failures.
- [ ] Confirm no credentials are committed; preserve MIT/2026 copyright.
- [ ] Review Vercel Preview deployment and logs before production.

## Launch notes

This is not a claim of fully translated UI or perfect native-language quality. AI language support varies and needs native-speaker review. Add hosting-layer rate limiting and publish a privacy notice before public launch.
