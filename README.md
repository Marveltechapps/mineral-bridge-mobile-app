# Mineral Bridge — Mobile (React Native CLI)

A React Native CLI (TypeScript) implementation of the **Mineral Bridge Mobile
Prototype** design from Claude Design (`Mineral Bridge Mobile Prototype.dc.html`).
All 59 screens, 7 bottom sheets, the toast and the outbid banner are built with
native components. There is no WebView, no Expo and no `react-dom`. Every
flow, gate and interaction in the prototype works the same way here.

| | |
| --- | --- |
| React Native | 0.86.3 (New Architecture, Hermes) |
| Language | TypeScript (strict) |
| Navigation | React Navigation 7 native stack |
| Drawing | `react-native-svg` (icons, gold gradient text, selfie oval) |
| Gradients and shadows | React Native's built-in CSS `experimental_backgroundImage` / `boxShadow` |
| Tests | Jest + React Native Testing Library (93 tests), Maestro (3 device flows) |

## Getting started

Prerequisites: Node ≥ 20.19.4, JDK 17, Android SDK (platform 36, build-tools 36),
and an emulator or a device with USB debugging enabled.

```bash
npm install
npm start            # Metro bundler
npm run android      # build, install and launch (debug)
```

| Script | What it does |
| --- | --- |
| `npm start` | Metro dev server |
| `npm run android` | Debug build on the connected device or emulator |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (`@react-native` config) |
| `npm test` | Jest unit, component and integration tests |
| `npm run e2e` | Maestro flows in `e2e/` against the installed app |
| `npm run android:release` | Release APK (`android/app/build/outputs/apk/release/`) |

The release build uses the debug keystore, as in the React Native template.
Configure a production keystore in `android/app/build.gradle` before
publishing.

### Environment

Copy `.env.example` to `.env`. `API_BASE_URL` is empty by default, so the app
runs on the design's bundled data. See [Backend integration](#backend-integration).

### Opening any screen directly

Every screen has a deep link (the same ids the design uses):

```bash
adb shell am start -a android.intent.action.VIEW -d mineralbridge://sOffer com.mineralbridge.app
```

Like the design's screen picker, a deep link replaces the history, so Back
returns to that screen's tab home.

The design's **STATES** panel (outbid banner, bid toast, filter sheet, tier
and KYC cycling) is in the React Native dev menu in debug builds (Ctrl+M /
shake). In production these states come from the backend.

## Project structure

```
assets/            fonts (Poppins from the design), images, icon geometry
src/
  api/             fetch client (index.ts) and endpoint paths (config.ts)
  components/
    common/        Text, GradientText, Icon, PressableScale, Button, Modal,
                   animations (the design's keyframes), ui (shared blocks)
    layout/        ScreenContainer (phone-frame chrome), Header, StepProgress,
                   CtaBar, TabBar
    overlays/      bottom sheets, toast, outbid banner
    auth/ kyc/ learn/ profile/ sell/
                   components used by one area's screens
  config/          env (.env values)
  context/         app state (the design's component state) with selectors
  interfaces/      (reserved for shared interfaces)
  lib/             the design's demo content (catalog.ts)
    hooks/         hardware back, quantity, dev-menu states, countdown,
                   phone entry, chat, sell estimate
  navigation/      RootNavigator, screen registry, screenMeta (the design's META),
                   flow (go / jump / back / flash), CTA actions, linking, types
  screens/         auth, kyc, buyer, sell, tracking, auctions, learn, profile
  services/        (reserved for domain services built on api/)
  theme/           colours, gradients and shadows, typography, spacing, font metrics
  types/           ambient type declarations (@env)
  utils/           formatting and style helpers
tests/             Jest tests
e2e/               Maestro flows
```

The design is one state machine with a single phone frame. Here, each screen is
a native-stack route rendered inside `ScreenContainer`, which draws the chrome
(status zone, title row, step progress, CTA well, tab bar) from the screen's
entry in `navigation/screenMeta.ts`. Navigation verbs mirror the design's:
`go` pushes, `jump` resets (tab bar, deep links, sign-out), and `back` pops or
falls back to the tab home.

## How the design is preserved

- **Exact values.** Colours, sizes, spacing, radii, shadows and gradients are
  copied from the design's inline styles. React Native 0.86 parses CSS
  `linear-gradient` / `radial-gradient` and multi-layer `box-shadow` natively,
  so most of them are the design's original strings.
- **Fonts.** The design's own Poppins woff2 files (latin and latin-ext subsets)
  were converted to TTF, one file per weight (400–900, plus 700–900 italic).
  `Text` maps `fontWeight` to the matching file, disables font padding and
  defaults to CSS `line-height: normal` (1.5em for Poppins).
- **Android text sizing.** React Native rounds every font size and line
  height *up* to a whole device pixel (`ceil(dp × density)`). At 2.5× that
  turned 12.5 dp into 32 px instead of 31.25, so text ran about 2.4% wide and
  lines wrapped differently from the design. `Text` targets the nearest pixel
  instead and spreads the leftover sub-pixel width over the glyphs, using each
  face's real advance widths (`theme/fontMetrics.ts`, generated from the TTFs).
  Measured widths on the device now match the font metrics to within 0.1 dp.
- **Gold text** (`background-clip: text`) is drawn with `react-native-svg`
  over invisibly laid-out text. It covers the same box CSS uses: the whole
  block for block elements, the text run for inline spans.
- **Animations.** Every keyframe in the design (`fadeUp`, `pop`, `ring`,
  `spin`, `blip`, `caret`, `shimmer`, `travel`, `scan`, `grow`, `rule`, `drop`,
  `up`, `logoIn`) is reproduced with the Animated API, with the same durations,
  delays and easing curves, applied per keyframe segment as CSS does. The
  explainer video's Ken Burns timeline uses the design's own timing maths.
- **Images** come from the design bundle. `background-position: center right`
  (buyer-home hero) is reproduced with a right-anchored cover image.

### Safe areas

The design is drawn in a 390×844 iPhone frame: a 48 px status row and a 34 px
home-indicator zone inside the tab bar. On Android these become **minimums**:

- The top chrome reserves `max(48, status-bar inset)`.
- The tab bar is `50 + max(34, bottom inset)` tall (84 dp, as designed, on
  gesture navigation).
- The CTA well's bottom padding is `max(14, bottom inset)`. With gesture
  navigation (24 dp inset) the buttons sit 10 dp higher than in the design,
  clear of the system gesture area. With 3-button navigation they sit above
  the buttons.

The app draws edge to edge (`edgeToEdgeEnabled=true`, required on Android 16),
and the status-bar icons switch between light and dark with each screen's
ground.

## Visual verification

Each screen was rendered from the design itself (Chromium via Playwright, at
2.5×) and from the app on an Android emulator set to the design's exact
viewport (`wm size 930x2065`, `wm density 400` → 372×826 dp). Screenshots were
pixel-diffed with `pixelmatch`, with the system status bar masked.

Results after three rounds of fixes (percentage of differing pixels in the
content area, all 59 screens):

| Capture | Median | 90th percentile | Under 5% |
| --- | --- | --- | --- |
| Top of each screen | 2.9% | 4.4% | 57 of 59 |
| Scrolled to the end (35 long screens)\* | 3.1% | 5.0% | 31 of 35 |

\* With the 10 dp CTA-well offset described under *Safe areas* compensated.

What remains is mostly anti-aliasing: Chrome and Android rasterise the same
Poppins glyphs slightly differently. The two highest scores are expected. The
explainer video (12%) is captured at a different moment of its animation, and
the product grid scrolled to the end (8%) includes photo resampling.

The process found and fixed these differences:

- Android's whole-pixel font and line-height rounding (text ran 2.4% wide and
  drifted down the page).
- CSS flex items shrink by default but React Native's don't, so a hero title
  refused to wrap beside its status pill.
- Bare images didn't stretch to their grid cell.
- The buyer-home hero was centred instead of anchored right.
- A dark fringe around gold text.
- Chat auto-scrolled when opened.
- Pills were top-aligned in their rows instead of centred.

Text drifts at most about 1.5 dp over a full screen, because Android line
boxes are whole pixels: a 10.5 dp label is 39.375 px in Chrome and exactly 39
px on the device.

## Behaviour notes

These are faithful to the design but may look surprising:

- In the design, *Add to Cart*, *Accept and get paid*, *Decline* and *End chat*
  raise a toast and then navigate, and the navigation clears the toast. The
  app keeps this behaviour.
- The filter sheet's chips and "Verified lots only" switch are static in the
  design (only "Show 12 results" acts). They stay static until a catalogue API
  can filter.
- Search fields, "See all", "Edit" and "Change" links have no behaviour in the
  design and are left as display elements.
- Text input exists only where the design implies typing: the live-chat
  composer, the ticket reply and the new-ticket description. Phone number and
  OTP entry use the design's on-screen keypad.

## Backend integration

No Mineral Bridge API exists yet. The app runs entirely on the design's demo
content (`src/lib/catalog.ts`), and actions update local state. The live-chat
agent replies are scripted, as in the design. `src/api/config.ts`
lists the endpoints each screen needs, and `src/api/index.ts` is the fetch
client (base URL and timeout from `.env`, no secrets in the bundle). These
need the backend before they can be real:

- OTP request and verification, sign-out and account deletion
- KYC submission, document capture and upload, status polling
- Catalogue, product detail, cart, buy requests, order tracking
- Sell estimates, evaluation booking, offers (accept and decline), bulk quotes
- Auctions, live bids, outbid push notifications
- Payout balance, accounts, withdrawals; documents; notifications; support
  tickets and live chat
- Camera and gallery capture (KYC, sell photos, uploads) and phone calls,
  which today confirm with a toast as in the design

## Platform notes

- **Android** was built, installed and verified on an emulator (Pixel 6a
  image, Android 17 / API 37) at several screen sizes.
- **iOS**: the `ios/` project is intact and the fonts are linked (`Info.plist`
  `UIAppFonts`), but it was not built, because this was developed on Windows.
  Run `bundle install && cd ios && bundle exec pod install`, then
  `npm run ios`, on macOS.
