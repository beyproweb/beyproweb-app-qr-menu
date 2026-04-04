# app-qr-menu

Dedicated Beypro customer mobile app wrapper for the production QR Menu + Order Status web experience.

This app keeps the current web customer flows as source of truth by loading the production Beypro QR Menu in a mobile WebView, with app-level deep-link routing, splash/loading handling, back navigation, and error recovery.

Phase 1 now includes a lightweight native marketplace home for normal app opens, while QR/deep-link/slug entry still opens the target restaurant flow directly.

## Link strategy

- Public web links stay unchanged: `https://www.beypro.com/{restaurant_slug}`
- Mobile app links: `https://app.beypro.com/{restaurant_slug}`
- App links are mapped to the web renderer URL internally, so opening `app.beypro.com/<path>` loads `www.beypro.com/<path>` in-app.
- App opened without a deep link starts on the native marketplace home.
- App opened with QR/deep-link/slug continues to bypass marketplace and open the target restaurant directly.

## Project structure

- `App.js`: root entry
- `src/shell/CustomerMobileApp.js`: app shell and lifecycle
- `src/config/`: central URL/config/constants
- `src/linking/`: deep-link parsing + route/slug resolution
- `src/marketplace/`: Phase 1 marketplace module
  - `screens/`: marketplace home/detail/navigator
  - `components/`: reusable cards, chips, sections, badges, search
  - `hooks/`: marketplace state composition
  - `services/`: seed catalog + local persistence helpers
  - `utils/`: filtering/presentation helpers
- `src/webview/CustomerWebAppContainer.js`: WebView container + safe external-link behavior
- `src/storage/`: persisted customer session helpers (last restaurant slug)
- `src/ui/`: loading and error states

## Environment config

Optional overrides (defaults shown):

- `EXPO_PUBLIC_WEB_BASE_URL=https://www.beypro.com`
- `EXPO_PUBLIC_APP_LINK_BASE_URL=https://app.beypro.com`
- `EXPO_PUBLIC_DEEP_LINK_SCHEME=beypro`
- `EXPO_PUBLIC_WEB_ENTRY_PATH=/menu` (default QR menu entry route when no slug is provided)
- `EXPO_PUBLIC_DEFAULT_RESTAURANT_SLUG=` (optional; useful for Expo Go testing fallback)
- `EXPO_PUBLIC_INTERNAL_HOSTS=` (comma-separated extra internal hosts)
- `EXPO_PUBLIC_MARKETPLACE_API_URL=https://hurrypos-backend.onrender.com/api/public/marketplace/restaurants` (marketplace restaurant feed)

## Run

1. `npm install`
2. `npm run start`

## Native run

- Android: `npm run android`
- iOS: `npm run ios`

## EAS build and release channels

`eas.json` is configured with three build profiles/channels:

- `development` -> channel `development` (internal dev client)
- `preview` -> channel `preview` (internal distribution)
- `production` -> channel `production` (store-ready, auto-increment enabled)

First-time setup:

1. `npm install`
2. `npx eas-cli login`
3. `npx eas-cli project:init`

Build commands:

- `npm run eas:build:development`
- `npm run eas:build:preview`
- `npm run eas:build:production`

Submit commands:

- `npm run eas:submit:ios`
- `npm run eas:submit:android`

OTA update commands:

- `npm run eas:update:preview`
- `npm run eas:update:production`

## Deep-link examples

- `https://app.beypro.com/pizzeria-roma`
- `https://app.beypro.com/pizzeria-roma/order-status/12345`

Both open in-app and render against the production web base URL.
