# Mobile Architecture Review

**Date:** 2026-10-15

| | Path | What it is |
|---|---|---|
| **A — the architecture file** | `C:\js\min-clone\mineral-bridge-mobile-app-main` | React Native CLI scaffold. **97 lines**, 2 screens, 10 placeholder folders. |
| **B — the design file** | `C:\js\mineralbridge-full\mineralbridge-mobile-app` | The real app. **17,597 lines**, 108 files, **~60 screens** across 8 feature areas. |

---

## 1. Verdict: the folder vocabulary is right, the rest is wrong — and already outgrown

Split the question, because the two halves have opposite answers.

**The folder vocabulary is right, and B already follows it.** `src/screens/<feature>/`,
`src/navigation/`, `src/components/`, `src/theme/`, `src/api/`, `src/context/`,
`src/lib/`, `src/utils/`, `src/types/` — B uses all of these, and they have held
up across 60 screens. That is the real endorsement: the layout survived a
180-fold increase in size without reorganisation. **Keep it.**

**Everything A actually implements is wrong for this app, or superseded by it.**
A is not a description of B; it is a 97-line starter that B passed years of work
ago. Most importantly, A's single most structural choice — navigation — is not a
real implementation at all:

```tsx
// A — src/navigation/RootNavigator.tsx, in full
export function RootNavigator() {
  const [screen, setScreen] = useState<ScreenName>('home');
  return screen === 'samples' ? <SampleScreen …/> : <HomeScreen …/>;
}
```

A boolean in `useState`. A's own README concedes it: *"The route switch is a
minimal example; add React Navigation for full app navigation."* **A document
that defers its central decision cannot be the authority on it.** B made the
decision — React Navigation 7 native-stack, a typed `RootStackParamList`, 60
screens registered from one `SCREEN_IDS` list, plus `linking.ts`, `flow.ts`,
`ctaActions.ts` and `screenMeta.ts` — and B is right.

---

## 2. Where they stand, measured

| | A — architecture file | B — the real app | Which is right |
|---|---|---|---|
| Source | 97 LOC, 14 files | **17,597 LOC, 108 files** | — |
| Screens | 2 (`home`, `sample`) | **~60** across auth, buyer, sell, kyc, learn, profile, auctions, tracking | — |
| Navigation | `useState` boolean switch | **React Navigation 7** native-stack, typed param list, deep linking | **B** |
| React Native | 0.83.1 | **0.86.3** | **B** |
| React | 19.2.0 | **19.2.3** | **B** |
| Env config | **none** — "No environment loader is configured for mobile" | `react-native-dotenv` + `.env` + `src/config/env.ts` + `src/types/env.d.ts` | **B** |
| API base URL | **hardcoded** `10.0.2.2` / `localhost` by platform | from `.env`, with a demo-mode fallback | **B** |
| Error type | `throw new Error(...)` | `ApiError` with status, code and field errors | **B** |
| API surface | one `/samples` path | **`ENDPOINTS`** documenting ~45 paths across the product | **B** |
| State | `src/context/` empty placeholder | `appStore.ts` on `useSyncExternalStore` | **B** |
| Theme | colors + spacing (2 files) | colors, spacing, typography, effects, fontMetrics (**5 files**) | **B** |
| Tests | Jest configured, **zero tests** | **110 tests**, 5 suites, + 4 Maestro e2e flows | **B** |
| ESLint | 8 (legacy config) | 8 (legacy config) | neither |
| Prettier | 2.8.8 — two majors behind | 2.8.8 — two majors behind | neither |

B wins on eleven of thirteen rows. The two it does not win are ones A does not
win either.

---

## 3. What is specifically wrong with A

1. **Navigation is a placeholder.** §1. The one decision that shapes a mobile
   app, deferred to a TODO in the README.
2. **No environment loader, by stated choice.** A hardcodes
   `http://10.0.2.2:3333/api` for Android and `localhost` for iOS, in source.
   There is no way to point it at staging or production without editing code, so
   **an app built from A cannot ship.** B solved this properly.
3. **Two folders for one job.** A declares both `src/types/` and
   `src/interfaces/`. Nothing explains which gets what, and A's own sample puts
   its only type in `types/`, leaving `interfaces/` empty. B inherited the empty
   folder and has never used it either — see §5.
4. **`SampleItem` for the third time.** The same three-field interface is
   defined identically in A, in the web scaffold and in the admin scaffold, with
   `apiRequest` reimplemented beside it each time. Three copies, three base-URL
   strategies, no shared package.
5. **Its stated source does not exist.** A's README says it follows
   `Selorg-CustomerApp-V2.0` from "the Selorg Application reference". No such
   directory exists anywhere on this machine — the same unverifiable citation the
   web and admin scaffolds make. A is a generic starter from another product,
   with Mineral Bridge's domain never filled in.
6. **Jest is configured and no test is written.** The scaffolding for testing
   without the habit.
7. **Placeholder folders outnumber real ones.** `src/config/`, `src/context/`,
   `src/interfaces/`, `src/lib/`, `docs/`, `scripts/`, `assets/fonts`,
   `assets/images`, `assets/lottie`, `assets/sounds` — ten `.gitkeep` directories
   against four that hold code.

**Do not conform B to A.** On every point where they differ, A is the older and
weaker answer. Conforming would mean tearing out React Navigation, re-hardcoding
the API host, and discarding 110 tests.

---

## 4. What was changed in B

Rather than propagate A's design, two genuine defects in B's own API layer were
fixed — the layer A was most wrong about, and the one place B had not yet caught
up with the web client.

### 4.1 Caller cancellation was silently discarded

`src/api/index.ts` built its own `AbortController` for the timeout and passed
that signal to `fetch` **after** spreading `init`:

```ts
fetch(url, { ...init, headers: {…}, signal: controller.signal })
```

Any `signal` the caller passed was overwritten. A screen could not cancel its
request on unmount, and the timeout was the only thing that could stop it.

Now the caller's signal and the timeout both feed one controller, so either can
cancel. A cancellation is rethrown unchanged rather than dressed up as a request
failure, so an unmounting screen does not report an error to the user. A
`timeoutMs` override was added for the occasional long upload.

### 4.2 `ApiError` could not distinguish one failure from another

It carried `message` and `status` only, so the interface could not tell *session
expired* (401) from *KYC not approved* (403) from *lot already sold* (409) from
*invalid quantity* (422) without matching on message text.

`ApiError` now carries `status`, a machine-readable `code` and per-field `fields`
for a 422, **with the same constructor signature as the web client's** — so both
front ends handle the same backend the same way, which is the one piece of
cross-project drift that was cheap to close here. Added alongside it: client
error codes for demo mode, timeout, network failure and a malformed body;
tolerant parsing of `{ code, message, fields }`, `{ error: { … } }`, `{ detail }`
and the `{ qty: ['…'] }` array spelling; and a real status preserved even when a
proxy returns an HTML error page.

### 4.3 `isDemoMode` became a function

It was a module constant, fixed at import. It now reads `env` when called, which
also makes the layer testable — the dotenv babel plugin inlines `@env` values at
transform time, so there is no runtime module to mock and a test has to vary
`env` itself.

### 4.4 Tests

`tests/api.test.ts`, 17 tests: demo mode making no network call, header
defaults and overrides, 204 with no body, malformed JSON, network failure,
caller cancellation (the §4.1 defect), an already-aborted signal, timeout
winning when the caller never aborts, and each error shape including 403 vs 409
vs 401 and both spellings of field errors.

**Verification:** typecheck clean, ESLint clean, **110 tests passing** across 5
suites. No screen, component, theme or navigation file was touched.

---

## 5. What remains in B

Not addressed here, and worth knowing.

1. **No auth.** No token storage, no `Authorization` header, no refresh. The web
   app now has this (`src/lib/auth/`); mobile does not, and the two should end up
   with the same model. The `ENDPOINTS.auth` paths are defined and unused.
2. **Nothing fetches.** `apiRequest` has exactly one reference — its own
   definition. All 60 screens read `src/lib/catalog.ts` (980 lines of bundled
   design data). The client is ready; no screen uses it.
3. **No path alias.** 499 `../../` imports and 8 `../../../`, zero aliased. A has
   no alias either. Adding `@/` needs `babel-plugin-module-resolver` plus
   `tsconfig` paths, and would touch every import — real work, not done here.
4. **Two dead folders inherited from A**: `src/interfaces/.gitkeep` and
   `src/services/.gitkeep`, both empty. B put its API surface in `api/config.ts`
   and its hooks in `lib/hooks/`, so neither folder found a job. Left in place
   rather than deleted, since removing them is a naming decision rather than a
   fix.
5. **Timing-sensitive tests can flake under load.** One full-suite run showed 2
   failures in `App.test.tsx` while the machine was busy (138s, against 35s when
   idle); the same file passes 66/66 in isolation and the full suite passed
   110/110 on re-run. The screens assert against animation and timer state, so
   the tests are load-sensitive rather than wrong.
6. **Environment values resolve `process.env` first.** An ambient shell variable
   silently overrides `.env` — observed while reviewing, where a shell
   `API_TIMEOUT_MS=900000` won over the committed `15000`. Worth knowing before
   debugging a config that "isn't being read", and worth pinning in CI.
7. **Prettier 2.8.8 and legacy-config ESLint 8** in both projects. Neither is
   broken; both are two majors behind the ecosystem.

---

## 6. Summary

**The architecture file is wrong — but its folder vocabulary is right, and that
is the part the real app actually uses.**

`src/screens/<feature>/` with `navigation/`, `components/`, `theme/`, `api/`,
`context/`, `lib/`, `utils/` and `types/` alongside it is a sound React Native
layout, and the real app has carried it from 2 screens to 60 without needing to
reorganise. That vocabulary is worth keeping as the convention.

Everything the architecture file *implements* is either a placeholder or
superseded. Its navigation is a `useState` boolean its own README flags as
temporary. Its API host is hardcoded per platform with no environment loader, so
an app built from it cannot be shipped. It declares two folders for types and
fills neither. Its sample domain was never replaced with Mineral Bridge's, and
the reference it claims to follow does not exist. The real app is ahead of it on
eleven of thirteen measured points.

So: **use it as a naming convention, not as an architecture, and never conform
the real app to it.** The real app's own gaps are listed in §5, and auth is the
one that matters most — the web client has it now and mobile should match.
