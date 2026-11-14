## Summary

This PR consolidates the Humanity Nepal AI and World Free Education project direction into a cleaner Humanity World experience focused on accessible learning, community empowerment, and human dignity. It also introduces an optional server-side AI study-guide endpoint and documents setup and deployment.

## Changes

- Replaced the landing page with a responsive, accessible, production-oriented design.
- Added English, Nepali, and Hindi answer-language selection.
- Added `POST /api/ask` backed by a server-side OpenAI-compatible API key; secrets are not exposed to the browser.
- Added request validation, input size limits, provider timeouts, safe error responses, and educational/high-stakes topic guidance.
- Retained `GET /api/status` and updated local run, AI configuration, and Vercel instructions.
- Preserved the repository's MIT License and Copyright (c) 2026 Niraj Mallik notice.

## Verification

- [ ] Install requirements and start locally.
- [ ] Confirm the home page and `/api/status` work.
- [ ] Test `/api/ask` with a valid provider key and each supported language.
- [ ] Test missing key, invalid JSON, empty/oversized question, provider timeout, and provider error handling.
- [ ] Review Vercel preview build and verify deployment environment variables.
- [ ] Confirm the license and copyright notice remain intact.

## Notes

The AI endpoint sends a submitted prompt to the configured provider. Users should not submit sensitive information. Before broad public use, configure provider budget limits and hosting-layer abuse/rate protection; this application does not implement persistent user-level rate limiting.
