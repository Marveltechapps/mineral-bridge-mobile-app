# mineral-bridge-mobile-app

React Native CLI + TypeScript starter following the structure of `Selorg-CustomerApp-V2.0` in the Selorg Application reference. Includes a small sample feature demonstrating file and folder conventions.

```sh
npm install
npm start
```

Requires Node >=20, Android SDK/JDK for Android, or Xcode and CocoaPods for iOS.

Android: `npm run android`.

iOS: `bundle install`, then `cd ios && bundle exec pod install`, return to the project directory and run `npm run ios`.

API configuration lives in `src/api/config.ts`; use your computer’s LAN IP for a physical device. No environment loader is configured for mobile. Android application ID: `com.mineralbridge`; iOS bundle identifier: `com.mineralbridge`; configure signing before device deployment.

Screens go in `src/screens/<feature>/`; navigation, components, context, theme, API, services, types, and interfaces use the reference folder conventions. Components use `.tsx`; helpers use `.ts`. Native projects are in `android/` and `ios/`.

Run `npm run typecheck` to check TypeScript. Dependencies must be installed in this repository first.

## Sample files

The sample feature reads `GET /api/samples` from the service. Start the service before using the sample screens. Tap **View sample items**; API host settings are in `src/api/config.ts`. The route switch is a minimal example; add React Navigation for full app navigation.

## Mineral Bridge customer app

The app UI is a native React Native implementation of the "Mineral Bridge Mobile Prototype v4" design handoff (no WebView). `App.tsx` wraps `RootNavigator` in `SafeAreaProvider` and `AppStoreProvider`; `RootNavigator` renders `src/navigation/AppShell.tsx`.

- `src/context/` — app store (`store.ts`, a port of the prototype's state machine: navigation stack, order stages, KYC, auctions, refunds, documents), initial/demo state (`state.ts`) and the React provider (`AppStore.tsx`).
- `src/lib/mb4.ts` — demo catalog, order stages and the simulated counterparty updates. `src/lib/images.ts` — design images in `assets/images`.
- `src/components/ui/` — design primitives (text, icons, gradients, motion, cards, fields). `src/components/AppChrome.tsx` — header, step bar, CTA bar, tab bar, toast and sheet.
- `src/screens/<feature>/` — onboarding, dashboard, buy, orders, sell, auctions, account.
- Fonts: Geist, Geist Mono and Instrument Serif in `assets/fonts`, copied to `android/app/src/main/assets/fonts` and listed in `ios/MineralBridge/Info.plist` (`UIAppFonts`) and the Xcode project resources.
- Steps owned by Mineral Bridge, SGS or the logistics partner are simulated with the labelled demo buttons, exactly as in the design. App state is in memory (no persistence).
- The original starter screens (`HomeScreen`, `SampleScreen`, `/api/samples`) are unchanged. In development builds, long-press the hero image on the welcome screen to open them.

`npm test` runs the store regression tests in `__tests__/`.
