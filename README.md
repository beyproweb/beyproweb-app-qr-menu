# app-qr-menu

Dedicated Beypro customer mobile app wrapper for the production QR Menu + Order Status web experience.

This app keeps the current web customer flows as source of truth by loading the production Beypro QR Menu in a mobile WebView, with app-level deep-link routing, splash/loading handling, back navigation, and error recovery.

## Link strategy

- Public web links stay unchanged: `https://www.beypro.com/{restaurant_slug}`
- Mobile app links: `https://app.beypro.com/{restaurant_slug}`
- App links are mapped to the web renderer URL internally, so opening `app.beypro.com/<path>` loads `www.beypro.com/<path>` in-app.

## Project structure

- `App.js`: root entry
- `src/shell/CustomerMobileApp.js`: app shell and lifecycle
- `src/config/`: central URL/config/constants
- `src/linking/`: deep-link parsing + route/slug resolution
- `src/webview/CustomerWebAppContainer.js`: WebView container + safe external-link behavior
- `src/storage/`: persisted customer session helpers (last restaurant slug)
- `src/ui/`: loading and error states

## Environment config

Optional overrides (defaults shown):

- `EXPO_PUBLIC_WEB_BASE_URL=https://www.beypro.com`
- `EXPO_PUBLIC_APP_LINK_BASE_URL=https://app.beypro.com`
- `EXPO_PUBLIC_DEEP_LINK_SCHEME=beypro`
- `EXPO_PUBLIC_WEB_ENTRY_PATH=/menu` (default QR menu entry route when no slug is provided)
- `EXPO_PUBLIC_INTERNAL_HOSTS=` (comma-separated extra internal hosts)

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
