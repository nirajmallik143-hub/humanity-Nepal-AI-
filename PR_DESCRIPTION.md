## Summary

Make Humanity World usable as an installable Progressive Web App across supported mobile and desktop browsers, with a cached offline shell and device-specific install guidance.

## Changes

- Add a web app manifest, SVG app icon, service worker, offline page, and PWA install button.
- Add Flask routes and correct response headers for PWA assets.
- Cache only the public app shell; explicitly leave authentication/configuration and all API paths network-only.
- Document Android/desktop browser installation and the iOS Safari Add to Home Screen flow.
- Keep existing Firebase Google sign-in and authenticated AI flow unchanged.
- Preserve the MIT license and Copyright (c) 2026 Niraj Mallik.

## Validation

- [ ] Validate manifest and PWA asset routes on preview.
- [ ] Check service-worker scope and offline fallback.
- [ ] Confirm `/api/*` requests are not cached.
- [ ] Test installation and standalone launch on Android, iOS Safari, and desktop.
- [ ] Test reduced-motion styling, responsive design, and account/AI flows.

## Scope note

This delivers a PWA, not native Play Store or App Store packages. Those require separate packaging and publication steps.
