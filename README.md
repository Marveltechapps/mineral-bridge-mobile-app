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

The app UI is a native React Native implementation of the "Mineral Bridge Mobile Final" design (the Selorg app layout: navy `#14284B`, gold `#D9B456`, paper `#F4F2ED`, Plus Jakarta Sans). No WebView. `App.tsx` wraps `RootNavigator` in `SafeAreaProvider` and `AppStoreProvider`; `RootNavigator` renders `src/navigation/AppShell.tsx`.

- `src/context/` — app store (`store.ts`: navigation stack, order stages, KYC, auctions, refunds, documents, per-screen header/CTA metadata), API layer (`remote.ts`), initial state (`state.ts`) and the React provider (`AppStore.tsx`).
- `src/theme/design.ts` — design tokens of the final design. `src/components/mb/` — design primitives: `base.tsx` (text, line icons, gradients, keyframes), `kit.tsx` (buttons, header, inputs, cards, chips, sheets…), `art.tsx` (logo, the two gold photos and the per-mineral SVG artwork drawn with react-native-svg).
- `src/components/AppChrome.tsx` — header, in-flow CTA, floating tab bar with the gold Orders button, toast, confirmation sheet and the navy splash / loading overlay.
- `src/screens/<feature>/` — onboarding, dashboard, buy, orders, sell, auctions, account, support. Home, Buy and Sell have fixed tops (`TOPS` in `src/screens/index.ts`).
- Fonts: Plus Jakarta Sans 400–800 (static instances of the variable font embedded in the design) in `assets/fonts`, copied to `android/app/src/main/assets/fonts` and listed in `ios/MineralBridge/Info.plist` (`UIAppFonts`) and the Xcode project resources. Images: `assets/images/mb_logo.png`, `mb_grains.jpg`, `mb_bars.jpg`.
- Steps owned by Mineral Bridge, SGS or the logistics partner can be simulated with the labelled demo buttons in development builds only. Product photos from the API are shown when a lot has one; otherwise the design's placeholder artwork is drawn.
- The original starter screens (`HomeScreen`, `SampleScreen`, `/api/samples`) are unchanged. In development builds, long-press the onboarding image to open them.

`npm test` runs the store regression tests in `__tests__/`. The Maestro flows in `.maestro/` start from the onboarding screen (Skip → sign up / browse as guest).
