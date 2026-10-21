# Mineral Bridge Mobile — API Contract

**Document version:** 1.0
**Date:** 16 October 2026
**Status:** Proposed — for backend review
**Client:** `mineralbridge-mobile-app` (React Native 0.86.3, TypeScript strict)
**Companion:** [API-ENDPOINTS.md](API-ENDPOINTS.md) — the numbered endpoint list and per-screen coverage map

---

## Table of contents

1. [Purpose and scope](#1-purpose-and-scope)
2. [Conventions](#2-conventions)
3. [Authentication and authorization](#3-authentication-and-authorization)
4. [Error model](#4-error-model)
5. [Pagination, filtering and sorting](#5-pagination-filtering-and-sorting)
6. [Idempotency and concurrency](#6-idempotency-and-concurrency)
7. [File uploads](#7-file-uploads)
8. [Realtime channels](#8-realtime-channels)
9. [Domain contracts](#9-domain-contracts)
10. [Shared schemas](#10-shared-schemas)
11. [Enumerations](#11-enumerations)
12. [Rate limits](#12-rate-limits)
13. [Push notifications and app config](#13-push-notifications-and-app-config)
14. [Client integration](#14-client-integration)
15. [Open questions for the backend team](#15-open-questions-for-the-backend-team)

---

## 1. Purpose and scope

This contract specifies the HTTP and WebSocket surface the Mineral Bridge mobile app needs in order to
run on live data. It was produced by reading the built client — all 59 screens, 7 bottom sheets, the
toast and the outbid banner — and recording, for every user action, what the app must send and what it
must receive back to render the screen that follows.

**Two sides of one marketplace.** Mineral Bridge *buys outright* from sellers and *resells* to buyers
from stock it owns. That shapes the contract in ways worth stating up front:

- A buy-side `order` is a **requirement submitted for verification**, not a payment. No money moves at
  submission; a verified quote follows within 48 hours and escrow is funded after that.
- A sell-side `request` runs **estimate → free on-site evaluation → firm offer → acceptance → payout**.
  The seller keeps physical custody until they accept. Title transfers on acceptance.
- Account **tier** (1 Individual, 2 Small group/SME, 3 Registered company) is a paperwork weight, not a
  permission level. Everyone may buy and sell. Tier 3 routes selling through the bulk consignment flow
  and requires export permits.
- **KYC gates trading, not browsing.** Guests and unverified accounts can see every lot and price.

**Out of scope:** admin and desk-operator tooling, the evaluator's field app, refinery and logistics
integrations, and the web client (which shares this contract's error shape but not its screens).

---

## 2. Conventions

### 2.1 Base URL and versioning

```
https://api.mineralbridge.co/v1
```

The client reads the base URL from `API_BASE_URL` in `.env` and strips any trailing slash
(`src/config/env.ts`). An empty value puts the app in demo mode on bundled data, so the path prefix
must be part of `API_BASE_URL` — the client never adds `/v1` itself.

Breaking changes get a new major prefix (`/v2`). Additive changes — new fields, new enum members, new
endpoints — ship within `/v1`. **Clients must ignore unknown fields** and must treat an unrecognised
enum value as the nearest safe default rather than crashing.

### 2.2 Request headers

| Header | Value | Notes |
|---|---|---|
| `Content-Type` | `application/json` | Set by the client on every request; `multipart/form-data` for uploads |
| `Accept` | `application/json` | Always |
| `Authorization` | `Bearer <accessToken>` | Omitted while browsing as a guest |
| `X-Client` | `mineralbridge-mobile/2.4.0 (316)` | App version and build, for support triage |
| `X-Platform` | `android` \| `ios` | |
| `X-Device-Id` | opaque install UUID | Stable per install; used for session management |
| `X-Request-Id` | UUID v4 | Echoed in responses and logs |
| `Accept-Language` | `en` \| `ha` \| `yo` \| `ig` \| `fr` | From the user's language preference |
| `Idempotency-Key` | UUID v4 | Required on the state-changing calls listed in §6 |

### 2.3 Response headers

| Header | Notes |
|---|---|
| `X-Request-Id` | Echo of the request's value, or server-generated |
| `ETag` | On cacheable reads (catalog, learn content, reference data) |
| `Retry-After` | On `429` and `503` |
| `X-RateLimit-Remaining` | Remaining calls in the current window |

### 2.4 Money

Money is **never** a float and never a pre-formatted string in a field the client does minor arithmetic on.
Every monetary value is an object:

```json
{ "amount": 1535000000, "currency": "USD", "scale": 2 }
```

`amount` is an integer in the currency's minor unit; `scale` states how many decimal places that implies.
The example is `$15,350,000.00`. The client formats for display (`src/utils/format.ts` already provides
`formatMoney`, `dollars` and `compactDollars`); the server never sends `"$15.35M"` in a numeric field.

Prices quoted per unit weight carry the basis explicitly:

```json
{ "unitPrice": { "amount": 6140, "currency": "USD", "scale": 2 }, "per": "g" }
```

### 2.5 Quantity and units

```json
{ "value": 250, "unit": "kg", "grams": 250000 }
```

`unit` is one of `g`, `kg`, `t`. **The server always sends `grams` alongside**, so the client never has to
convert; conversion in the client exists only for the local stepper
(`src/lib/hooks/useQuantity.ts`: `g`=1, `kg`=1000, `t`=1,000,000).

Stepper constraints the server must also enforce:

| Context | Step | Minimum |
|---|---|---|
| Buy requirement (`bQty`) and sell listing (`qList`) | 50 | 50 |
| Cart line (`cart`) | 5 kg | 5 kg |

### 2.6 Dates and times

All timestamps are RFC 3339 UTC with a `Z` suffix: `2026-09-10T14:00:00Z`. Date-only fields are
`YYYY-MM-DD`. Where a screen shows a human string over a timestamp ("Arriving Wed 10 Sep, 14:00–17:00",
"9 Sep · 08:40"), the server sends **both** the machine value and a localised `display` string, because
the app renders timelines in the desk's own wording:

```json
{ "at": "2026-09-09T08:40:00Z", "display": "9 Sep · 08:40" }
```

Windows carry two bounds and a display string:

```json
{ "from": "2026-09-10T14:00:00Z", "to": "2026-09-10T17:00:00Z", "display": "Arriving Wed 10 Sep, 14:00–17:00" }
```

All desk-facing times are **West Africa Time (UTC+1)**; the desk is open 08:00–20:00 WAT.

### 2.7 Identifiers

Resource ids are opaque strings. The app also displays **human references**, which are a separate field
and must never be used as a path parameter:

| Reference | Format | Example |
|---|---|---|
| Order | `MB-YYYY-NNNNN` | `MB-2026-04871` |
| Sell request | `MB-S-NNNNN` | `MB-S-90412` |
| Bulk quote | `MB-Q-NNNNN` | `MB-Q-90418` |
| Auction lot | `MB-A-NNNN` | `MB-A-2214` |
| Tamper seal | `MB-SL-NNNN` | `MB-SL-4471` |
| KYC submission | `KYC-YYYY-NNNNN` | `KYC-2026-77310` |
| Support ticket | `TCK-NNNN` | `TCK-4471` |

Every resource therefore carries both:

```json
{ "id": "ord_01HQZX8K3M", "reference": "MB-2026-04871" }
```

### 2.8 Response envelope

Single resources are returned bare — no wrapper:

```json
{ "id": "prd_01H…", "name": "Gold Doré Bar", … }
```

Collections are wrapped, so paging metadata has somewhere to live (§5):

```json
{ "data": [ … ], "meta": { "total": 38, "nextCursor": "eyJvIjoyMH0" } }
```

`204 No Content` is returned for actions with nothing to say. The client's `readBody` already treats
`204`, `205` and `304` as empty, and treats an empty body on any status as `undefined`.

### 2.9 Timeouts

The client's default timeout is **15,000 ms** (`API_TIMEOUT_MS`), raised per call where a flow warrants it.
Any endpoint that cannot reliably answer inside that budget must return `202 Accepted` with a resource to
poll rather than holding the connection:

| Endpoint | Client timeout | Rationale |
|---|---|---|
| `POST /kyc/documents`, `POST /sell/media`, `POST /documents` | 60,000 ms | Image upload on a mobile network |
| `POST /auth/otp/verify` | 20,000 ms | `verifying` shows a 1.7 s staged animation; the call may outlast it |
| `POST /sell/estimates` | 20,000 ms | Pricing engine plus live rate lookup |
| Everything else | 15,000 ms | |

---

## 3. Authentication and authorization

### 3.1 Model

Phone number plus a 6-digit SMS code. No passwords anywhere in the product — which is why the client has
no password field, and why none should be added to this contract.

### 3.2 Token lifecycle

| Token | Lifetime | Storage |
|---|---|---|
| `accessToken` | 15 minutes | Memory, plus Keychain / Keystore |
| `refreshToken` | 60 days, rotating | Keychain / Keystore only |

`POST /auth/otp/verify` returns both. `POST /auth/token/refresh` exchanges a refresh token for a new
pair and **invalidates the one presented** (rotation). A refresh token replayed after rotation must
return `401 auth/refresh-reused` and revoke the whole session family — that is the signal for a stolen
token.

On `401 auth/token-expired` the client refreshes once and replays the original request. On any other
`401` it clears the session and resets navigation to `welcome`.

### 3.3 Guest access

Twenty-four endpoints accept a request with no `Authorization` header. They fall into two groups.

**Pre-auth (5)** — these cannot require a token, because the caller is obtaining one: `#1`–`#5`
(OTP request, verify, resend, alternate channel, token refresh).

**Guest-readable (19)** — these serve guest mode: the whole catalog (`#28`–`#34`), auction reads
(`#62`–`#64`), learn content (`#69`–`#71`), support channels and FAQs (`#91`, `#92`), the reference and
content endpoints (`#104`–`#106`), and the sellable mineral types (`#47`, which `sPick` renders before any
gate applies).

Guests never see another user's data, and every write requires a token. When a guest taps a gated CTA the
client opens the sign-in sheet locally — it does not call the API to discover the gate.

### 3.4 The KYC gate

Trading requires `kyc.status = "verified"`. The client already mirrors this in
`src/lib/catalog.ts` (`GATED`), covering `bDetail`, `bQty`, `bDeliv`, `bReview`, `aDetail`, `qList`,
`qPickup`, `qReview`, `iStep1`, `iStep2`, `iReview`. **The server must enforce it independently** — the
client gate is a courtesy, not a control.

A gated endpoint called by an unverified account returns:

```
403 Forbidden
{
  "code": "kyc/not-verified",
  "message": "Identity check required before trading.",
  "kycStatus": "none"
}
```

`kycStatus` lets the client choose its copy without a second call: `none` → "Verify identity to continue",
`pending` → "Verification in review", `rejected` → re-submission prompt. This mirrors `resolveMeta()` in
`src/navigation/screenMeta.ts`.

### 3.5 Tier rules

| Tier | Label | Sell flow | Extra paperwork |
|---|---|---|---|
| 1 | Individual | Standard (`qList → sEstimate → qPickup`) | Government ID only |
| 2 | Small group / SME | Standard | Group registration number, checked once at KYC |
| 3 | Registered company | Bulk consignment (`iStep1 → iStep2 → iReview`) | Import or export permit |

The server routes on the account's tier. `POST /sell/estimates` from a Tier 3 account returns
`409 sell/bulk-flow-required`; `POST /sell/bulk-quotes` from Tier 1 or 2 returns `409 sell/standard-flow-required`.
The import permit field on `bDeliv` and the export permit field on `iStep2` are **required for Tier 3 and
rejected for Tiers 1–2** (`422` with `fields.importPermitNumber`).

### 3.6 PIN-confirmed actions

Two actions require the transaction PIN set via `PUT /auth/pin`:

- `POST /payouts/withdrawals`
- `POST /auctions/{auctionId}/bids`

The PIN travels as a header, never in the body or the URL:

```
X-Transaction-Pin: 4471
```

Five consecutive failures lock PIN use for 30 minutes (`423 auth/pin-locked`). The client never stores or
logs the PIN; biometric unlock (the `biometric` preference) gates *opening the app*, not these actions.

---

## 4. Error model

### 4.1 Shape

The client's `ApiError` carries `status`, `code`, optional per-field messages and a message
(`src/api/index.ts`). The canonical error body is:

```json
{
  "code": "sell/offer-expired",
  "message": "This offer expired on 10 September. The desk can re-issue it.",
  "fields": { "quantity": "Maximum 40 tonnes per consignment." },
  "requestId": "0b9e7c2a-5f41-4f0e-9a1d-7c4a2f6b8e31"
}
```

`code` is stable and machine-readable — the client branches on it and must never match on `message`.
`message` is user-presentable, already localised per `Accept-Language`. `fields` is only present on `422`,
keyed by the field name **as the mobile form knows it** (see §4.4).

The client also parses `{ "error": { "code", "message" } }`, `{ "detail": "…" }` and
`{ "errors": { "qty": ["Too high"] } }`, so existing backend conventions will not break it. New work should
emit the canonical shape.

### 4.2 Status codes

| Status | Meaning | Client behaviour |
|---|---|---|
| `200` | OK | Render |
| `201` | Created | Render the confirmation screen |
| `202` | Accepted, processing | Poll the returned resource |
| `204` | No content | Treat as success, no body read |
| `400` | Malformed request | Generic error toast; log |
| `401` | Unauthenticated or token expired | Refresh once, else reset to `welcome` |
| `403` | Forbidden — KYC, tier or ownership | Open the KYC sheet, or show the tier message |
| `404` | Not found | "This lot is no longer listed", pop the screen |
| `409` | Conflict — state has moved on | Re-fetch and show what changed |
| `410` | Gone — auction closed, offer expired | Route to the outcome screen |
| `422` | Validation failed | Inline field errors |
| `423` | Locked — PIN lockout | Countdown message |
| `429` | Rate limited | Back off per `Retry-After` |
| `500` | Server error | "Something went wrong", retry affordance |
| `503` | Maintenance | Maintenance screen from `GET /config/app` |

### 4.3 Error code registry

Codes are namespaced `domain/condition`.

**Client-raised** (never from the server; defined in `CLIENT_ERROR_CODES`):

| Code | Status | Condition |
|---|---|---|
| `client/demo-mode` | 0 | `API_BASE_URL` is empty |
| `client/timeout` | 408 | Exceeded `API_TIMEOUT_MS` |
| `client/network` | 0 | `fetch` failed: offline, DNS, TLS |
| `client/malformed-response` | 2xx | A 2xx body that is not valid JSON |

**Auth**

| Code | Status | Condition |
|---|---|---|
| `auth/invalid-phone` | 422 | Not a valid Nigerian mobile number |
| `auth/otp-invalid` | 422 | Wrong code |
| `auth/otp-expired` | 410 | Code older than its 60-second window |
| `auth/otp-attempts-exceeded` | 429 | 5 wrong codes; new code required |
| `auth/otp-rate-limited` | 429 | Too many requests for one number |
| `auth/token-expired` | 401 | Access token expired — refresh |
| `auth/token-invalid` | 401 | Malformed or revoked |
| `auth/refresh-reused` | 401 | Rotated refresh token replayed; family revoked |
| `auth/pin-invalid` | 422 | Wrong transaction PIN |
| `auth/pin-locked` | 423 | 5 failures; locked 30 minutes |
| `auth/pin-not-set` | 409 | PIN required but never set |
| `auth/account-deletion-blocked` | 409 | Active orders must settle first |

**KYC**

| Code | Status | Condition |
|---|---|---|
| `kyc/not-verified` | 403 | Gated action, unverified account |
| `kyc/already-submitted` | 409 | A submission is already pending |
| `kyc/consent-required` | 422 | `consent` was not `true` |
| `kyc/document-unreadable` | 422 | Glare, crop or focus failed automated checks |
| `kyc/selfie-mismatch` | 422 | Liveness or face match failed |
| `kyc/id-number-mismatch` | 422 | Number does not match the national register |
| `kyc/id-expired` | 422 | Document out of date |

**Catalog and cart**

| Code | Status | Condition |
|---|---|---|
| `catalog/product-unavailable` | 409 | Sold or withdrawn since it was listed |
| `catalog/insufficient-quantity` | 422 | Requested more than available; `fields.quantity` carries the ceiling |
| `cart/item-not-found` | 404 | Line already removed |
| `cart/empty` | 422 | Checkout attempted on an empty cart |

**Orders**

| Code | Status | Condition |
|---|---|---|
| `order/permit-required` | 422 | Tier 3 import permit missing |
| `order/permit-invalid` | 422 | Not found in the regulator register |
| `order/address-incomplete` | 422 | Delivery facility fields missing |
| `order/needed-by-too-soon` | 422 | Earlier than the minimum lead time |
| `order/not-deliverable` | 409 | `confirm-delivery` before the lot arrived |
| `order/already-confirmed` | 409 | Delivery already confirmed |

**Sell**

| Code | Status | Condition |
|---|---|---|
| `sell/bulk-flow-required` | 409 | Tier 3 account used the standard flow |
| `sell/standard-flow-required` | 409 | Tier 1–2 account used the bulk flow |
| `sell/slot-taken` | 409 | Evaluation slot booked by someone else |
| `sell/slot-unavailable` | 422 | Slot outside the bookable window |
| `sell/photos-required` | 422 | Fewer than the minimum photos |
| `sell/offer-expired` | 410 | Past the 48-hour validity |
| `sell/offer-already-decided` | 409 | Already accepted or declined |
| `sell/offer-not-ready` | 409 | Offer read before the assay cleared |
| `sell/export-permit-required` | 422 | Tier 3 export permit missing |
| `sell/acknowledgment-required` | 422 | Regulatory acknowledgment unchecked |

**Auctions**

| Code | Status | Condition |
|---|---|---|
| `auction/not-open` | 409 | Bid on an upcoming lot |
| `auction/closed` | 410 | Bid after close |
| `auction/bid-too-low` | 422 | Below highest + minimum increment; `fields.amount` carries the floor |
| `auction/outbid` | 409 | Highest bid moved between read and write |
| `auction/self-outbid` | 422 | Already the highest bidder |
| `auction/reserve-not-met` | 200 | *Not an error* — a flag on the lot |

**Payouts**

| Code | Status | Condition |
|---|---|---|
| `payout/insufficient-balance` | 422 | Amount exceeds available (escrow excluded) |
| `payout/account-not-found` | 404 | Destination removed |
| `payout/account-unverified` | 409 | Destination still being verified |
| `payout/name-mismatch` | 422 | Account name does not match the KYC name |
| `payout/below-minimum` | 422 | Under the minimum withdrawal |
| `payout/daily-limit-exceeded` | 429 | Over the daily ceiling |

**Documents and support**

| Code | Status | Condition |
|---|---|---|
| `document/too-large` | 422 | Over 10 MB |
| `document/unsupported-type` | 422 | Not PDF, JPG or PNG |
| `document/expired` | 422 | Expiry date already past |
| `support/ticket-closed` | 409 | Reply to a resolved ticket |
| `support/chat-unavailable` | 503 | Desk closed; `message` carries the hours |
| `support/attachment-too-large` | 422 | Over the attachment ceiling |

### 4.4 Field keys for `422`

`fields` keys must match the mobile form's own names, so the client can attach a message to a control
without a translation table:

| Screen | Keys |
|---|---|
| `signupPhone`, `login` | `phone` |
| `otp` | `code` |
| `kycId` | `idType`, `idNumber` |
| `kycReview` | `consent` |
| `bQty` | `quantity`, `unit`, `neededBy` |
| `bDeliv` | `facilityName`, `streetAddress`, `city`, `region`, `contactPerson`, `contactPhone`, `importPermitNumber` |
| `qList` | `mineralTypeId`, `quantity`, `unit`, `photos` |
| `qPickup` | `addressId`, `date`, `slot` |
| `iStep1` | `mineralTypeId`, `quantity`, `unit`, `offtakePartner`, `originSite`, `extractionDate`, `description`, `photos` |
| `iStep2` | `facilityName`, `streetAddress`, `city`, `region`, `contactPerson`, `contactPhone`, `exportPermitNumber`, `acknowledgment`, `proofOfAddressId` |
| Bid sheet | `amount` |
| `withdraw` | `amount`, `accountId` |
| `newTicket` | `topic`, `relatedRef`, `description` |
| `editProfile` | `fullName`, `email`, `businessName`, `registrationNumber` |

---

## 5. Pagination, filtering and sorting

### 5.1 Cursor pagination

All collections are cursor-paged. Offsets are unacceptable on the auction and notification feeds, where
rows are inserted while the user reads.

```
GET /auctions?status=live&limit=20&cursor=eyJvIjoyMH0
```

```json
{
  "data": [ … ],
  "meta": { "total": 38, "limit": 20, "nextCursor": "eyJvIjo0MH0", "hasMore": true }
}
```

`limit` defaults to 20 and is capped at 100. A `null` `nextCursor` means the end. `total` is best-effort
and may be omitted on expensive queries — the client uses it only for the tab counters
("Live 12 · Upcoming 5 · Ended 38").

### 5.2 Tab counts

Screens with segmented tabs need every tab's count on the first page of any one tab, so switching tabs
does not flash an empty badge:

```json
{
  "data": [ … ],
  "meta": {
    "limit": 20,
    "nextCursor": null,
    "counts": { "live": 12, "upcoming": 5, "ended": 38 }
  }
}
```

This applies to `GET /auctions` (`live`/`upcoming`/`ended`), `GET /orders` together with
`GET /sell/requests` (`active`/`selling`/`completed`), and `GET /notifications` (`unread`).

### 5.3 Filtering

Filters are repeated query parameters, not comma-joined strings:

```
GET /catalog/types/gold/products?purity=22K%2B&sellerTier=cooperative&sellerTier=registered&verifiedOnly=true
```

`GET /catalog/filters` returns the facet definitions and the count each would yield, so the filter sheet's
"Show 12 results" button is server-truth rather than a guess.

### 5.4 Sorting

`sort=<field>:<asc|desc>`, repeatable. Defaults: catalog `createdAt:desc`, auctions `closesAt:asc` for
live and upcoming, `closedAt:desc` for ended, notifications and orders `createdAt:desc`.

---

## 6. Idempotency and concurrency

### 6.1 Idempotency keys

A UUID v4 `Idempotency-Key` is **required** on these calls, because a retry after a flaky connection must
not double-submit:

| Endpoint | Why |
|---|---|
| `POST /orders` | Duplicate order |
| `POST /sell/requests` | Duplicate evaluation booking |
| `POST /sell/bulk-quotes` | Duplicate consignment |
| `POST /sell/requests/{id}/offer/accept` | Double acceptance |
| `POST /auctions/{id}/bids` | Double bid — financially binding |
| `POST /payouts/withdrawals` | Double withdrawal |
| `POST /payouts/accounts` | Duplicate destination |
| `POST /support/tickets` | Duplicate ticket |

The server stores the key with its response for **24 hours**. A replay returns the original response and
status unchanged. The same key with a *different* body returns `409 idempotency/key-reused`.

### 6.2 Optimistic concurrency

Resources whose state moves underneath the user carry a `version` integer. `POST`ing a decision against a
stale version returns `409` with the current state attached, so the client can re-render rather than
re-fetch blindly:

```json
{
  "code": "auction/outbid",
  "message": "Someone bid $49,600 while you were deciding.",
  "current": { "highestBid": { "amount": 4960000, "currency": "USD", "scale": 2 }, "version": 15 }
}
```

This covers `POST /auctions/{id}/bids` (against `auction.version`) and the offer accept/decline pair
(against `offer.version`).

---

## 7. File uploads

### 7.1 Direct multipart

Uploads are `multipart/form-data` to the endpoint, which returns a handle the subsequent JSON submission
references by id. The client never embeds base64 in JSON.

```
POST /sell/media
Content-Type: multipart/form-data; boundary=…
Authorization: Bearer …

--…
Content-Disposition: form-data; name="file"; filename="lot-1.jpg"
Content-Type: image/jpeg
<binary>
--…
Content-Disposition: form-data; name="purpose"

sell_lot_photo
--…--
```

```json
201 Created
{
  "id": "med_01HQZX8K3M",
  "url": "https://cdn.mineralbridge.co/sell/med_01HQZX8K3M.jpg",
  "thumbnailUrl": "https://cdn.mineralbridge.co/sell/med_01HQZX8K3M_thumb.jpg",
  "contentType": "image/jpeg",
  "bytes": 2184032,
  "uploadedAt": "2026-10-16T09:14:22Z"
}
```

### 7.2 Limits

| Purpose | Endpoint | Types | Max size | Max count |
|---|---|---|---|---|
| KYC ID front/back, selfie | `POST /kyc/documents` | JPEG, PNG | 8 MB | 3 |
| Sell lot photo | `POST /sell/media` | JPEG, PNG, HEIC | 10 MB | 8 per request |
| Compliance document | `POST /documents` | PDF, JPEG, PNG | 10 MB | — |
| Support attachment | `POST /support/attachments` | PDF, JPEG, PNG | 10 MB | 5 per ticket |
| Profile avatar | `PUT /me/avatar` | JPEG, PNG | 4 MB | 1 |

The copy on `iStep2` and `docs` promises "PDF or JPG · up to 10 MB"; the server must honour exactly that
and return `422 document/too-large` rather than a proxy's bare `413`.

### 7.3 Server-side processing

KYC captures are checked automatically for glare, crop and focus. A failure returns
`422 kyc/document-unreadable` with a `hint` the client shows against the retake affordance:

```json
{
  "code": "kyc/document-unreadable",
  "message": "We could not read your ID.",
  "hint": "Flash glare across the photo page — try again in indirect light.",
  "fields": { "idFront": "Glare detected" }
}
```

Uploaded media is private. URLs are signed and expire in **15 minutes**; the client must not cache them
beyond the screen's lifetime.

---

## 8. Realtime channels

### 8.1 Transport

Authenticated WebSocket. The access token goes in the subprotocol header, never the query string:

```
wss://api.mineralbridge.co/v1/ws/auctions/auc_01HQZX8K3M
Sec-WebSocket-Protocol: mineralbridge.v1, bearer.<accessToken>
```

Frames are JSON with a discriminating `event`:

```json
{ "event": "bid.placed", "at": "2026-10-16T09:41:02Z", "data": { … } }
```

Client keeps the socket alive with a `ping` every 30 s and reconnects with exponential backoff
(1 s, 2 s, 4 s, 8 s, capped at 30 s), then falls back to polling the REST equivalent every 10 s.

### 8.2 W1 — Auction channel

`wss://…/ws/auctions/{auctionId}` — drives `aDetail`'s countdown and "Auto-updating" bid history, and the
outbid banner.

| Event | Data |
|---|---|
| `bid.placed` | `{ bid: Bid, highestBid: Money, bidCount: int, reserveMet: bool, version: int }` |
| `bidder.outbid` | `{ auctionId, auctionName, newHighestBid: Money, closesAt, yourBid: Money }` |
| `auction.extended` | `{ closesAt, reason: "anti_sniping" }` |
| `auction.closed` | `{ outcome: "won" \| "lost" \| "reserve_not_met", winningBid: Money, yourBid: Money }` |

`bidder.outbid` is also delivered as a push notification, since the user may have the app closed — it is
the source of the outbid banner's copy ("New highest bid $49,600 · 2h 14m left").

### 8.3 W2 — Sell request channel

`wss://…/ws/sell-requests/{requestId}` — drives `sEval`'s live progress and `sTrack`'s timeline.

| Event | Data |
|---|---|
| `stage.advanced` | `{ stage: TimelineStep, progress: int, eta: DisplayTime }` |
| `evaluator.assigned` | `{ evaluator: Evaluator }` |
| `assay.complete` | `{ assayedWeight: Quantity, confirmedPurity: string }` |
| `offer.issued` | `{ offerId, amount: Money, expiresAt }` |

### 8.4 W3 — Support chat channel

`wss://…/ws/support/chat/{sessionId}` — drives `chat`.

| Event | Data |
|---|---|
| `agent.joined` | `{ agent: { id, name, initials, avatarUrl } }` |
| `agent.typing` | `{ isTyping: bool }` |
| `message.received` | `{ message: ChatMessage }` |
| `message.read` | `{ messageIds: string[] }` |
| `session.ended` | `{ endedBy: "user" \| "agent" \| "timeout", transcriptEmailedTo: string }` |

The client sends `{ "event": "message.send", "data": { "text": "…", "clientId": "<uuid>" } }` and
`{ "event": "typing", "data": { "isTyping": true } }`. `clientId` is echoed on `message.received` so the
optimistic bubble can be reconciled rather than duplicated.

---

## 9. Domain contracts

Endpoint numbers match [API-ENDPOINTS.md](API-ENDPOINTS.md).

### 9.1 Authentication and session

#### #1 `POST /auth/otp/request`

```json
{ "phone": "+2348024419087", "intent": "signup", "channel": "sms" }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `phone` | string | ✔ | E.164. The client composes `+234` + 10 national digits |
| `intent` | `signup` \| `login` | ✔ | From `authMode`; drives the copy on `otp` |
| `channel` | `sms` \| `voice` \| `whatsapp` | | Defaults to `sms` |

When `NODE_ENV=development` and `DEV_OTP_ENABLED=true`, the 200 body also includes `developmentOtp`. The app shows it only in a debug build. Production omits the field and sends the SMS through the configured provider. `DEV_OTP_ENABLED` is separate from `DEV_LOGIN_ENABLED`.

```json
200 OK
{
  "challengeId": "chl_01HQZX8K3M",
  "expiresIn": 60,
  "resendAfter": 42,
  "channel": "sms",
  "maskedPhone": "+234 802 441 ••87",
  "accountExists": true
}
```

`resendAfter` seeds the countdown on `otp` (the client's default is 42). `accountExists` lets the client
correct a `signup` intent on a known number — and must **not** be returned to unauthenticated callers in
a form that enables number enumeration: rate-limit per IP and per number, and return the same shape
either way.

Errors: `422 auth/invalid-phone`, `429 auth/otp-rate-limited`.

#### Development login

`GET /auth/dev-login`, `POST /auth/dev-login` and `POST /auth/dev-login/verify` are a separate local flow. The server answers them only when `NODE_ENV=development` and `DEV_LOGIN_ENABLED=true`. Otherwise `POST` returns `404 auth/dev-login-disabled`.

```json
{ "email": "dev.app@example.com", "password": "••••••••" }
```

```json
{ "challengeId": "chl_…", "expiresIn": 120, "codeLength": 6, "developmentOtp": "••••••" }
```

The code is shown in the development UI and is not sent by SMS. `POST /auth/dev-login/verify` with `{ challengeId, code }` returns the same access and refresh token body as `POST /auth/otp/verify`. The normal OTP routes do not accept this challenge and never include `developmentOtp`.

#### #2 `POST /auth/otp/verify`

```json
{ "challengeId": "chl_01HQZX8K3M", "phone": "+2348024419087", "code": "441908", "device": { "id": "…", "platform": "android", "name": "Pixel 8", "pushToken": "…" } }
```

```json
200 OK
{
  "accessToken": "eyJhbGciOi…",
  "refreshToken": "rt_01HQZX…",
  "expiresIn": 900,
  "tokenType": "Bearer",
  "isNewAccount": true,
  "account": {
    "id": "acc_01HQZX8K3M",
    "fullName": null,
    "phone": "+2348024419087",
    "tier": null,
    "kyc": { "status": "none" },
    "onboarding": { "nextStep": "intro" }
  }
}
```

`onboarding.nextStep` tells the client where to go after `verifying` — `intro`, `tier`, `kycStart` or
`home` — so resumed signups land in the right place instead of replaying the whole funnel.

Errors: `422 auth/otp-invalid`, `410 auth/otp-expired`, `429 auth/otp-attempts-exceeded`.

#### #3 `POST /auth/otp/resend`

```json
{ "challengeId": "chl_01HQZX8K3M" }
```
→ `200` with the same body as #1. Returns `429 auth/otp-rate-limited` before `resendAfter` elapses.

#### #4 `POST /auth/otp/alternate-channel`

```json
{ "challengeId": "chl_01HQZX8K3M", "channel": "voice" }
```

`channel` is `voice` ("Call me with the code" — automated voice call in English) or `whatsapp`
("Send the code on WhatsApp"). → `200`, same body as #1. The help sheet's third option, "Talk to support",
is a client-side route to `support`, not a call here.

#### #5 `POST /auth/token/refresh`

```json
{ "refreshToken": "rt_01HQZX…" }
```
→ `200` with a fresh `accessToken` / `refreshToken` pair and `expiresIn`.
Errors: `401 auth/token-invalid`, `401 auth/refresh-reused`.

#### #6 `POST /auth/sign-out`

```json
{ "allDevices": false }
```
→ `204`. The client also calls #90 to unregister its push token.

#### #7 `DELETE /auth/account`

Requires `X-Transaction-Pin`. → `204`.
Errors: `409 auth/account-deletion-blocked` with `blockingOrders: [{ id, reference, status }]` — surfaced
as "Active orders must be settled first" in the delete sheet.

#### #8 `GET /auth/sessions`

```json
{
  "data": [
    { "id": "ses_01H…", "deviceName": "Pixel 8", "platform": "android", "current": true,
      "lastActiveAt": "2026-10-16T09:02:00Z", "location": "Lagos, NG" }
  ],
  "meta": { "total": 2 }
}
```

#### #9 `DELETE /auth/sessions/{sessionId}` → `204`. `409` if it is the current session (use #6).

#### #10 `PUT /auth/pin`

```json
{ "currentPin": "4471", "newPin": "8120" }
```
`currentPin` is omitted when setting a PIN for the first time. → `204`.
Errors: `422 auth/pin-invalid`, `423 auth/pin-locked`, `422` with `fields.newPin` for a weak PIN
(sequential or repeated digits).

---

### 9.2 Account and profile

#### #11 `GET /me`

```json
{
  "id": "acc_01HQZX8K3M",
  "fullName": "Adaeze Chioma Okafor",
  "displayName": "Adaeze Okafor",
  "initials": "AO",
  "phone": "+2348024419087",
  "phoneVerified": true,
  "email": "adaeze.okafor@auroraref.ng",
  "dateOfBirth": "1989-03-14",
  "avatarUrl": null,
  "business": { "name": "Aurora Refining Ltd.", "registrationNumber": "RC-1140882" },
  "tier": { "id": 2, "tag": "TIER 2", "name": "Small group / SME" },
  "kyc": { "status": "verified", "verifiedAt": "2026-09-06T10:22:00Z", "reference": "KYC-2026-77310" },
  "lockedFields": ["phone", "dateOfBirth", "fullName"],
  "appVersion": { "minimumSupported": "2.2.0" }
}
```

`lockedFields` drives the padlock icons on `editProfile`. The screen shows "Verified at signup. Contact
support to change it." against `phone` and "Taken from your verified ID." against `dateOfBirth` — the
server is the authority on which fields those are, because the set changes with KYC state.

#### #12 `PATCH /me`

```json
{ "fullName": "Adaeze Chioma Okafor", "email": "…", "business": { "name": "…", "registrationNumber": "…" } }
```
→ `200` with the updated account. A locked field returns `422` with
`fields.phone = "Locked to your verified ID"`.

#### #13 `PUT /me/avatar` — multipart, `file`. → `200 { "avatarUrl": "…" }`.

#### #14 `GET /me/stats`

```json
{
  "sellRequests": 12,
  "totalSales": { "amount": 4850000, "currency": "USD", "scale": 2 },
  "activeBids": 3,
  "learn": { "completed": 6, "total": 23 }
}
```

Backs the three profile hero counters and the "6 of 23 lessons complete" row.

#### #15 `GET /me/tier`

```json
{
  "current": { "id": 2, "tag": "TIER 2", "name": "Small group / SME" },
  "available": [ /* see #105 */ ],
  "changeable": true
}
```

#### #16 `PUT /me/tier`

```json
{ "tierId": 3 }
```
→ `200` with the updated tier plus `requiredDocuments`, so the client can warn that Tier 3 needs an export
permit before the user reaches `iStep2`:

```json
{
  "tier": { "id": 3, "tag": "TIER 3", "name": "Registered company" },
  "requiredDocuments": [
    { "type": "export_permit", "label": "Export permit", "status": "missing" },
    { "type": "import_permit", "label": "Import permit", "status": "on_file" }
  ]
}
```

Errors: `409 tier/change-blocked` while a sell request is mid-flight under the old tier's rules.

#### #17 `GET /me/preferences`

```json
{
  "language": "en",
  "currency": "USD",
  "units": "metric",
  "alerts": { "bids": true, "orders": true, "lots": true, "marketing": false },
  "security": { "biometric": true, "pinSet": true }
}
```

Field names map one-to-one onto `AppState.prefs` and `AppState.prefsVal`.

#### #18 `PATCH /me/preferences` — any subset of the above. → `200` with the full object.

#### #19 `GET /me/addresses`

```json
{
  "data": [
    {
      "id": "adr_01H…", "kind": "pickup", "label": "Ilesha Lease Site 4",
      "streetAddress": "Off Ijebu-Jesa Road, Ilesha", "city": "Ilesha", "region": "Osun State",
      "country": "NG", "contactPerson": "Adaeze Okafor", "contactPhone": "+2348024419087",
      "isDefault": true, "savedAt": "2026-08-12T00:00:00Z",
      "source": "profile", "geo": { "lat": 7.6211, "lng": 4.7174 }
    },
    {
      "id": "adr_02H…", "kind": "delivery", "label": "Aurora Refining Ltd.",
      "streetAddress": "14 Creek Road, Apapa", "city": "Lagos", "region": "Lagos State",
      "country": "NG", "contactPerson": "Adaeze Okafor", "contactPhone": "+2348024419087",
      "isDefault": true, "importPermitNumber": "NG-IMP-2026-44817"
    }
  ]
}
```

`kind` is `pickup` or `delivery`. `source: "profile"` drives the "FROM YOUR PROFILE" pill on `qPickup`.

#### #20 `POST /me/addresses` — the same shape without `id`. → `201`.
#### #21 `PATCH /me/addresses/{addressId}` — any subset. → `200`.

---

### 9.3 KYC

#### #22 `GET /kyc/status`

```json
{
  "status": "pending",
  "reference": "KYC-2026-77310",
  "submittedAt": "2026-09-06T08:40:00Z",
  "estimatedClearanceHours": 2,
  "steps": [
    { "key": "documents_received", "title": "Documents received",
      "sub": "ID and selfie uploaded successfully.", "state": "done" },
    { "key": "database_check", "title": "Identity database check",
      "sub": "Name, DOB and number matched against NIMC.", "state": "active" },
    { "key": "approved", "title": "Account approved",
      "sub": "Ordering, listing and bidding unlock automatically.", "state": "pending" }
  ],
  "rejection": null
}
```

On `status: "rejected"`, `rejection` carries `{ reason, code, retryAllowed, hint }`.
`steps[].state` is `done` / `active` / `pending`, matching the client's `StepState`.

#### #23 `GET /kyc/id-types`

```json
{
  "data": [
    { "id": "nin", "name": "National ID (NIN)", "shortLabel": "NIN",
      "hint": "11-digit number on your NIMC slip or card.",
      "numberFormat": { "pattern": "^\\d{11}$", "mask": "#### #### ###", "example": "2213 4477 901" },
      "requiresBack": true },
    { "id": "passport", "name": "International Passport", "shortLabel": "Passport",
      "hint": "Photo page, must be in date.",
      "numberFormat": { "pattern": "^[A-Z]\\d{8}$", "mask": "@### #####", "example": "A501 88274" },
      "requiresBack": false },
    { "id": "drivers_licence", "name": "Driver's Licence", "shortLabel": "Licence",
      "hint": "Front and back, both sides needed.",
      "numberFormat": { "pattern": "^[A-Z]{3}-\\d{4}-[A-Z]{2}$", "example": "OSU-4471-AB" },
      "requiresBack": true },
    { "id": "voters_card", "name": "Voter's Card (PVC)", "shortLabel": "PVC",
      "hint": "Permanent voter card with VIN.",
      "numberFormat": { "pattern": "^[0-9A-Z]{12}$", "example": "90F5A2213447" },
      "requiresBack": true }
  ]
}
```

`requiresBack` controls whether `kycDoc` asks for a second capture — the screen currently hard-codes a
front/back pair, and this field is what lets a passport skip the back.

#### #24 `POST /kyc/documents` — multipart: `file`, `kind` (`id_front` / `id_back` / `selfie`), `idTypeId`.

```json
201 Created
{
  "id": "kdoc_01H…",
  "kind": "id_front",
  "quality": { "passed": true, "glare": false, "blur": false, "cornersVisible": true },
  "uploadedAt": "2026-10-16T09:14:22Z"
}
```

A `selfie` upload also returns `liveness: { "passed": true, "faceDetected": true, "score": 0.97 }`, which
is what `kycSelfie`'s "Face detected — hold still" state reflects.
Errors: `422 kyc/document-unreadable` (with `hint`), `422 kyc/selfie-mismatch`.

#### #25 `POST /kyc/submissions`

```json
{
  "idTypeId": "nin",
  "idNumber": "22134477901",
  "documentIds": ["kdoc_01H…", "kdoc_02H…", "kdoc_03H…"],
  "tierId": 2,
  "declaredDetails": { "fullName": "Adaeze Chioma Okafor", "dateOfBirth": "1989-03-14" },
  "consent": true
}
```

`consent` must be `true` — it is the checkbox on `kycReview` authorising the national-database check and
regulator sharing. `false` returns `422 kyc/consent-required`.

```json
202 Accepted
{ "id": "kyc_01H…", "reference": "KYC-2026-77310", "status": "pending", "estimatedClearanceHours": 2 }
```

#### #26 `GET /kyc/submissions/{submissionId}` → the same body as #22, scoped to one submission.

#### #27 `POST /kyc/notify-me` → `204`. Registers interest in a push when approval lands
("Notify me when approved" on `kycPending`).

---

### 9.4 Catalog

#### #28 `GET /catalog/categories`

```json
{
  "data": [
    { "id": "cat_precious", "slug": "precious-metals", "name": "Precious Metals",
      "liveLotCount": 38, "imageUrl": "https://cdn…/precious.jpg" },
    { "id": "cat_gemstone", "slug": "gemstones", "name": "Gemstones",
      "liveLotCount": 21, "imageUrl": "…" },
    { "id": "cat_industrial", "slug": "industrial-minerals", "name": "Industrial Minerals",
      "liveLotCount": 46, "imageUrl": "…" },
    { "id": "cat_critical", "slug": "battery-critical", "name": "Battery & Critical",
      "liveLotCount": 29, "imageUrl": "…" }
  ]
}
```

`liveLotCount` is an integer, not "38 lots live" — the client composes that string.

#### #29 `GET /catalog/categories/{categorySlug}/types`

```json
{
  "data": [
    { "id": "typ_gold", "slug": "gold", "name": "Gold", "lotCount": 12,
      "gradeRange": "18K – 24K", "forms": ["doré", "concentrate", "dust", "grain", "biscuit", "bullion"],
      "imageUrl": "…" },
    { "id": "typ_platinum", "slug": "platinum", "name": "Platinum", "lotCount": 5,
      "gradeRange": "sponge & ingot", "imageUrl": "…" }
  ],
  "meta": { "total": 4, "categoryName": "Precious Metals" }
}
```

`meta.categoryName` supplies `bTypes`' header title, so the client need not carry it through navigation.

#### #30 `GET /catalog/types/{typeSlug}/products`

```json
{
  "data": [
    {
      "id": "prd_01H…", "name": "Gold Doré Bar", "form": "doré",
      "unitPrice": { "amount": 6140, "currency": "USD", "scale": 2 }, "per": "g",
      "available": { "value": 4.2, "unit": "kg", "grams": 4200 },
      "purity": { "karat": 22, "percentage": 91.6, "display": "22K (91.6%)" },
      "origin": { "region": "Osun State", "country": "NG", "display": "Osun State, NG" },
      "assurance": { "assured": true, "originTraced": true, "oecdCompliant": true },
      "imageUrl": "…", "thumbnailUrl": "…"
    }
  ],
  "meta": { "total": 12, "limit": 20, "nextCursor": null, "typeName": "Gold" }
}
```

#### #31 `GET /catalog/products/{productId}`

```json
{
  "id": "prd_01H…", "name": "Gold Doré Bar",
  "subtitle": "22K · Osun State · sold by Mineral Bridge",
  "unitPrice": { "amount": 6140, "currency": "USD", "scale": 2 }, "per": "g",
  "description": "Bought outright from a licensed cooperative lease in Osun State and now owned by Mineral Bridge. Weighed, fire-assayed and sealed on intake, held in our Lagos vault, and sold to you at a fixed price.",
  "specs": [
    { "key": "PURITY", "value": "22K (91.6%)" },
    { "key": "FORM", "value": "Doré bar, sealed" },
    { "key": "ORIGIN", "value": "Osun State, NG" },
    { "key": "AVAILABLE", "value": "4.2 kg" }
  ],
  "badges": [
    { "kind": "assured", "label": "Mineral Bridge Assured" },
    { "kind": "origin_traced", "label": "Origin traced" },
    { "kind": "oecd", "label": "OECD due diligence" }
  ],
  "compliance": [
    "Fire assay on intake — 22 Aug 2026",
    "Purchased outright, title held by Mineral Bridge",
    "Conflict-free and OECD-compliant sourcing"
  ],
  "available": { "value": 4.2, "unit": "kg", "grams": 4200 },
  "sourcing": { "leadTimeDays": 14,
    "note": "Seller has 4.2 kg in the Lagos vault. Larger volumes are sourced within 14 days." },
  "vault": { "location": "Lagos", "sealed": true },
  "mediaCount": 4,
  "version": 7
}
```

`specs`, `badges` and `compliance` are server-driven lists rather than client constants, because the
assertions differ per lot and are a compliance surface — hard-coding them in the app would make every
copy change a release. `sourcing.note` is the footnote under the quantity stepper on `bQty`.

#### #32 `GET /catalog/products/{productId}/media`

```json
{ "data": [ { "id": "med_01H…", "url": "…", "thumbnailUrl": "…", "position": 1, "alt": "Sealed doré bar, obverse" } ], "meta": { "total": 4 } }
```

#### #33 `GET /catalog/search?q=gold&limit=20`

```json
{
  "data": [
    { "kind": "product", "id": "prd_01H…", "name": "Gold Doré Bar", "subtitle": "$61.40 / g · 4.2 kg", "imageUrl": "…" },
    { "kind": "type", "id": "typ_gold", "name": "Gold", "subtitle": "12 lots · 18K – 24K", "imageUrl": "…" },
    { "kind": "auction", "id": "auc_01H…", "name": "Gold Doré Bar", "subtitle": "Lot MB-A-2231 · closes in 41m", "imageUrl": "…" }
  ],
  "meta": { "total": 17, "query": "gold" }
}
```

A single mixed-kind list, because the search field on `bHome` ("Search gold, cobalt, lithium…") spans
categories, types, products and live auctions.

#### #34 `GET /catalog/filters?type=gold`

```json
{
  "facets": [
    { "key": "purity", "label": "PURITY", "kind": "multi",
      "options": [ { "value": "22K+", "label": "22K+", "count": 7 },
                   { "value": "18K-22K", "label": "18K – 22K", "count": 4 },
                   { "value": "under-18K", "label": "Under 18K", "count": 1 } ] },
    { "key": "sellerTier", "label": "SELLER TIER", "kind": "multi",
      "options": [ { "value": "artisanal", "label": "Artisanal", "count": 3 },
                   { "value": "cooperative", "label": "Cooperative", "count": 6 },
                   { "value": "registered", "label": "Registered", "count": 3 } ] },
    { "key": "verifiedOnly", "label": "Verified lots only", "kind": "boolean", "count": 12 }
  ],
  "resultCount": 12
}
```

`resultCount` is what the filter sheet's "Show 12 results" button displays, recomputed as facets change.

---

### 9.5 Cart

#### #35 `GET /cart`

```json
{
  "id": "crt_01H…",
  "items": [
    {
      "id": "cit_01H…", "productId": "prd_01H…", "name": "Gold Doré Bar · 22K",
      "spec": "$61.40 / g · Osun State",
      "unitPrice": { "amount": 6140, "currency": "USD", "scale": 2 }, "per": "g",
      "quantity": { "value": 250, "unit": "kg", "grams": 250000 },
      "lineTotal": { "amount": 1535000000, "currency": "USD", "scale": 2 },
      "imageUrl": "…", "step": 5, "minimum": 5, "maximum": 4200
    }
  ],
  "totals": {
    "subtotal": { "amount": 1787800000, "currency": "USD", "scale": 2 },
    "assayAndHandling": { "amount": 32180400, "currency": "USD", "scale": 2, "rate": 0.018 },
    "bondedTransport": null,
    "transportNote": "Quoted after assay",
    "total": { "amount": 1819980400, "currency": "USD", "scale": 2 }
  },
  "note": "No payment is taken now. A verified quote with final assay weight arrives within 48 hours.",
  "version": 3
}
```

`step`, `minimum` and `maximum` are per item so the stepper's bounds come from the server (the client
hard-codes 5 kg steps today). `bondedTransport` is `null` until the assay sets it; `transportNote` is the
placeholder copy. The 1.8% handling rate is returned as `rate`, not assumed by the client.

#### #36 `POST /cart/items`

```json
{ "productId": "prd_01H…", "quantity": { "value": 250, "unit": "kg" } }
```
→ `201` with the updated cart. Errors: `409 catalog/product-unavailable`,
`422 catalog/insufficient-quantity` with `fields.quantity` carrying the ceiling.

#### #37 `PATCH /cart/items/{itemId}`

```json
{ "quantity": { "value": 255, "unit": "kg" } }
```
→ `200` with the updated cart.

#### #38 `DELETE /cart/items/{itemId}` → `200` with the updated cart (not `204` — the client needs new totals).

#### #39 `POST /cart/quote`

```json
{ "deliveryAddressId": "adr_02H…" }
```
→ `200` with a `totals` block including transport once an address is known. Use before `bReview` so the
indicative total shown matches what the order will carry.

---

### 9.6 Orders

#### #40 `POST /orders/requirements/price`

```json
{ "productId": "prd_01H…", "quantity": { "value": 250, "unit": "kg" }, "tierId": 2 }
```

```json
{
  "quantity": { "value": 250, "unit": "kg", "grams": 250000 },
  "unitPrice": { "amount": 6140, "currency": "USD", "scale": 2 }, "per": "g",
  "indicativeTotal": { "amount": 1535000000, "currency": "USD", "scale": 2 },
  "rateAsOf": "2026-10-16T09:37:00Z",
  "note": "No payment is taken now. A verified quote with final assay weight arrives within 48 hours."
}
```

Backs the "INDICATIVE TOTAL" row on `bReview`, which the client currently computes as `grams × 61.40`.
Server-side pricing matters here because the rate moves and the client must not disagree with the order it
is about to create.

#### #41 `POST /orders`

```json
{
  "productId": "prd_01H…",
  "cartId": null,
  "quantity": { "value": 250, "unit": "kg" },
  "neededBy": "2026-09-28",
  "delivery": {
    "addressId": "adr_02H…",
    "facilityName": "Aurora Refining Ltd.",
    "streetAddress": "14 Creek Road, Apapa",
    "city": "Lagos",
    "region": "Lagos State",
    "country": "NG",
    "contactPerson": "Adaeze Okafor",
    "contactPhone": "+2348024419087",
    "importPermitNumber": "NG-IMP-2026-44817"
  },
  "acceptedTerms": true
}
```

Either `productId` + `quantity` (the `bDetail → bQty` path) or `cartId` (the cart path) is supplied, not
both. `importPermitNumber` is required for Tier 3 and rejected otherwise.

```json
201 Created
{
  "id": "ord_01H…", "reference": "MB-2026-04871", "status": "verifying",
  "statusLabel": "VERIFICATION DESK REVIEW",
  "product": { "id": "prd_01H…", "name": "Gold Doré Bar · 22K", "imageUrl": "…" },
  "quantity": { "value": 250, "unit": "kg", "grams": 250000 },
  "indicativeTotal": { "amount": 1535000000, "currency": "USD", "scale": 2 },
  "paymentTaken": false,
  "nextSteps": [
    { "n": 1, "title": "Verification desk review",
      "sub": "Assay and origin documents re-checked. Within 24 hours.", "state": "active" },
    { "n": 2, "title": "Verified quote issued",
      "sub": "Final weight, price and transport cost sent for approval.", "state": "pending" },
    { "n": 3, "title": "Payment and release",
      "sub": "Escrow funded, then bonded transport is booked.", "state": "pending" }
  ],
  "createdAt": "2026-09-04T09:12:00Z"
}
```

`paymentTaken: false` is contractual: the response is what `bDone` renders, and that screen states in bold
that no payment has been taken. `nextSteps` is server-driven so the promise and the process stay in step.

Errors: `422 order/permit-required`, `422 order/permit-invalid`, `422 order/address-incomplete`,
`422 order/needed-by-too-soon`, `409 catalog/product-unavailable`, `403 kyc/not-verified`.

#### #42 `GET /orders?tab=active&limit=20`

`tab` is `active` or `completed`. The "Selling" tab is #54.

```json
{
  "data": [
    {
      "id": "ord_01H…", "reference": "MB-2026-04871",
      "product": { "name": "Gold Doré Bar", "imageUrl": "…" },
      "quantity": { "value": 250, "unit": "kg", "grams": 250000 },
      "value": { "amount": 1535000000, "currency": "USD", "scale": 2, "display": "$15.35M" },
      "status": "in_transit", "statusLabel": "IN TRANSIT", "tone": "live",
      "stage": { "current": 5, "total": 6, "label": "Step 5 of 6" },
      "progress": 78,
      "eta": { "from": "2026-09-10T14:00:00Z", "to": "2026-09-10T17:00:00Z",
               "display": "Arriving Wed 10 Sep, 14:00–17:00" }
    }
  ],
  "meta": { "limit": 20, "nextCursor": null, "counts": { "active": 2, "selling": 3, "completed": 1 } }
}
```

`progress` is an integer percentage (the client renders `"78%"` as a bar width). `tone` is
`live` / `warn` / `done` / `gold`, matching the client's `Tone` type, and drives the pill and bar colours;
it is explicitly a presentation hint derived from `status`, sent so that the two front ends colour the same
state identically.

#### #43 `GET /orders/{orderId}`

```json
{
  "id": "ord_01H…", "reference": "MB-2026-04871",
  "status": "in_transit", "statusLabel": "In transit", "tone": "live",
  "product": { "id": "prd_01H…", "name": "Gold Doré Bar · 22K", "imageUrl": "…" },
  "quantity": { "value": 250, "unit": "kg", "grams": 250000 },
  "escrow": { "funded": true, "amount": { "amount": 1535000000, "currency": "USD", "scale": 2 },
              "fundedAt": "2026-09-06T16:05:00Z", "releasedAt": null },
  "assay": { "finalWeight": { "value": 249.6, "unit": "kg", "grams": 249600 },
             "purity": "22K", "certifiedAt": "2026-09-05T11:40:00Z" },
  "seal": { "reference": "MB-SL-4471", "photographedAt": "2026-09-08T07:30:00Z" },
  "carrier": { "name": "Fidelis Secure Logistics", "bonded": true, "escorts": 2 },
  "eta": { "from": "2026-09-10T14:00:00Z", "to": "2026-09-10T17:00:00Z",
           "display": "Arriving Wed 10 Sep, 14:00–17:00" },
  "canConfirmDelivery": false,
  "version": 11
}
```

#### #44 `GET /orders/{orderId}/tracking`

```json
{
  "route": { "from": "LAGOS VAULT", "to": "APAPA FACILITY", "progress": 62,
             "position": { "lat": 6.4512, "lng": 3.3721 }, "updatedAt": "2026-10-16T09:41:00Z" },
  "steps": [
    { "key": "submitted", "title": "Request submitted",
      "sub": "Requirement sent to the verification desk.",
      "at": "2026-09-04T09:12:00Z", "display": "4 Sep · 09:12", "state": "done" },
    { "key": "quote_issued", "title": "Verified quote issued",
      "sub": "Final assay weight 249.6 kg at 22K confirmed.",
      "at": "2026-09-05T11:40:00Z", "display": "5 Sep · 11:40", "state": "done" },
    { "key": "escrow_funded", "title": "Escrow funded",
      "sub": "$15,350,000 held by Mineral Bridge escrow.",
      "at": "2026-09-06T16:05:00Z", "display": "6 Sep · 16:05", "state": "done" },
    { "key": "released", "title": "Sealed and released from vault",
      "sub": "Tamper seal MB-SL-4471 photographed and logged.",
      "at": "2026-09-08T07:30:00Z", "display": "8 Sep · 07:30", "state": "done" },
    { "key": "in_transit", "title": "In transit",
      "sub": "Bonded carrier Fidelis Secure Logistics · 2 escorts.",
      "at": null, "display": "Now", "state": "active" },
    { "key": "delivered", "title": "Delivered and confirmed",
      "sub": "You confirm the seal and assay, then escrow releases.",
      "at": null, "display": "Wed 10 Sep", "state": "pending" }
  ]
}
```

`route.progress` animates the travelling dot on `track`. `steps[].state` is `done`/`active`/`pending`.

#### #45 `GET /orders/{orderId}/documents`

```json
{
  "data": [
    { "id": "doc_01H…", "name": "Assay certificate", "kind": "assay_certificate",
      "contentType": "application/pdf", "bytes": 245760, "issuedAt": "2026-09-05T00:00:00Z",
      "meta": "PDF · 240 KB · issued 5 Sep", "ready": true,
      "downloadUrl": "https://cdn…?sig=…", "expiresIn": 900 },
    { "id": "doc_02H…", "name": "Waybill and seal photos", "kind": "waybill",
      "meta": "PDF · 1.1 MB · issued 8 Sep", "ready": true, "downloadUrl": "…", "expiresIn": 900 },
    { "id": "doc_03H…", "name": "Escrow receipt", "kind": "escrow_receipt",
      "meta": "PDF · 88 KB · issued 6 Sep", "ready": true, "downloadUrl": "…", "expiresIn": 900 }
  ]
}
```

`ready: false` means the document is not issued yet — `sTrack` shows "Not available yet" and suppresses the
download icon. `downloadUrl` is signed and short-lived.

#### #46 `POST /orders/{orderId}/confirm-delivery`

```json
{ "sealIntact": true, "assayAccepted": true, "note": null, "version": 11 }
```
→ `200` with the order in `delivered` and `escrow.releasedAt` set.
Errors: `409 order/not-deliverable`, `409 order/already-confirmed`.

---

### 9.7 Sell

#### #47 `GET /sell/mineral-types?tier=2`

```json
{
  "data": [
    { "id": "smt_dust", "name": "Gold Dust", "form": "Unrefined", "imageUrl": "…", "estimable": true },
    { "id": "smt_conc", "name": "Gold Concentrate", "form": "Sluice output", "imageUrl": "…", "estimable": true },
    { "id": "smt_grain", "name": "Gold Grain / Shot", "form": "Melted", "imageUrl": "…", "estimable": true },
    { "id": "smt_dore", "name": "Gold Doré Bar", "form": "Smelted", "imageUrl": "…", "estimable": true },
    { "id": "smt_biscuit", "name": "Gold Biscuit", "form": "24K", "imageUrl": "…", "estimable": true },
    { "id": "smt_bullion", "name": "Gold Bullion Bar", "form": "Refinery grade", "imageUrl": "…", "estimable": true }
  ],
  "meta": { "flow": "standard", "tierId": 2 }
}
```

`meta.flow` is `standard` or `bulk` for the caller's tier — this is what `sPick` routes on when it sends
Tier 3 to `iStep1` instead of `qList`.

#### #48 `POST /sell/media` — multipart, `file` + `purpose: sell_lot_photo`. → `201` (see §7.1).

#### #49 `POST /sell/estimates`

```json
{
  "mineralTypeId": "smt_dust",
  "quantity": { "value": 250, "unit": "kg" },
  "photoIds": ["med_01H…", "med_02H…", "med_03H…"],
  "assumedPurity": null
}
```

```json
{
  "id": "est_01H…",
  "quantity": { "value": 250, "unit": "kg", "grams": 250000 },
  "band": {
    "low": { "amount": 1310000000, "currency": "USD", "scale": 2 },
    "high": { "amount": 1447500000, "currency": "USD", "scale": 2 },
    "display": "$13.1M – $14.5M"
  },
  "midpoint": { "amount": 1377500000, "currency": "USD", "scale": 2, "display": "$13.8M" },
  "factors": [
    { "key": "Quantity declared", "value": "250 kg" },
    { "key": "Assumed purity", "value": "22K (91.6%)" },
    { "key": "Today's reference rate", "value": "$61.40 / g" },
    { "key": "Refining and handling", "value": "− 10.3%", "tone": "warn" }
  ],
  "rate": { "perGram": { "amount": 6140, "currency": "USD", "scale": 2 },
            "asOf": "2026-10-16T09:37:00Z", "display": "Rate updated 4 minutes ago" },
  "disclaimer": "This is an estimate, not an offer. Our evaluator confirms weight and purity on site, then you get a firm price you can accept or decline.",
  "expiresAt": "2026-10-16T21:37:00Z"
}
```

The client currently derives the band locally from $52.40–$57.90 per gram with a $55.10 midpoint, rounded
to the nearest $100 (`src/lib/hooks/useEstimate.ts`). **That arithmetic must move to the server.** The
band is a commercial commitment the user acts on, the refining deduction is a desk parameter, and the
reference rate moves — none of the three belong in a shipped binary. `factors` is returned as a list so the
"HOW WE GOT THERE" card stays truthful when the pricing model changes.

Errors: `409 sell/bulk-flow-required`, `422 sell/photos-required`, `403 kyc/not-verified`.

#### #50 `GET /sell/evaluation-slots?addressId=adr_01H…&from=2026-09-10&days=5`

```json
{
  "days": [
    { "date": "2026-09-10", "dow": "THU", "dayOfMonth": 10, "available": true },
    { "date": "2026-09-11", "dow": "FRI", "dayOfMonth": 11, "available": true },
    { "date": "2026-09-12", "dow": "SAT", "dayOfMonth": 12, "available": true },
    { "date": "2026-09-13", "dow": "SUN", "dayOfMonth": 13, "available": false },
    { "date": "2026-09-14", "dow": "MON", "dayOfMonth": 14, "available": true }
  ],
  "slots": {
    "2026-09-12": [
      { "time": "08:00", "available": true },
      { "time": "10:00", "available": true },
      { "time": "12:00", "available": true },
      { "time": "14:00", "available": false, "reason": "booked" },
      { "time": "16:00", "available": true },
      { "time": "18:00", "available": true }
    ]
  },
  "meta": { "timezone": "Africa/Lagos", "freeOfCharge": true }
}
```

`available: false` with `reason: "booked"` is what `qPickup` strikes through.

#### #51 `POST /sell/requests`

```json
{
  "estimateId": "est_01H…",
  "mineralTypeId": "smt_dust",
  "quantity": { "value": 250, "unit": "kg" },
  "photoIds": ["med_01H…", "med_02H…", "med_03H…"],
  "pickup": { "addressId": "adr_01H…" },
  "evaluation": { "date": "2026-09-12", "slot": "10:00" },
  "payoutAccountId": "pac_01H…"
}
```

```json
201 Created
{
  "id": "srq_01H…", "reference": "MB-S-90412", "status": "booked", "statusLabel": "EVALUATION BOOKED",
  "lot": { "name": "Gold Dust · unrefined", "imageUrl": "…", "photoCount": 3 },
  "quantity": { "value": 250, "unit": "kg", "grams": 250000 },
  "estimate": { "band": { "low": {…}, "high": {…}, "display": "$13.1M – $14.5M" } },
  "evaluation": {
    "at": "2026-09-12T10:00:00Z", "display": "Sat 12 Sep · 10:00",
    "address": { "label": "Ilesha Lease Site 4", "display": "Off Ijebu-Jesa Road, Ilesha\nOsun State, Nigeria" },
    "freeOfCharge": true
  },
  "payoutAccount": { "id": "pac_01H…", "display": "Bank transfer · GTB ••4471" },
  "custodyNote": "You keep the mineral until you accept our offer. Evaluation is always free.",
  "createdAt": "2026-09-09T08:40:00Z"
}
```

Errors: `409 sell/slot-taken`, `422 sell/slot-unavailable`, `409 sell/bulk-flow-required`.

#### #52 `POST /sell/bulk-quotes`

```json
{
  "mineralTypeId": "smt_bullion",
  "purity": { "percentage": 99.5 },
  "quantity": { "value": 12.5, "unit": "kg" },
  "photoIds": ["med_01H…", "med_02H…", "med_03H…", "med_04H…"],
  "offtakePartner": "Aurora Refining Ltd.",
  "origin": { "site": "Ilesha Consolidated Lease, Osun", "extractionDate": "2026-07-14" },
  "description": "Refinery-grade bullion from consolidated cooperative intake, re-assayed at 99.5% and bar-stamped. Full chain-of-custody documents available on request.",
  "facility": {
    "name": "Ilesha Consolidated Minerals Ltd.",
    "streetAddress": "Plot 7, Ijebu-Jesa Industrial Way",
    "city": "Ilesha", "region": "Osun State", "country": "NG",
    "contactPerson": "Tunde Balogun", "contactPhone": "+2347031182260"
  },
  "exportPermitNumber": "NG-EXP-2026-11204",
  "proofOfAddressDocumentId": "doc_09H…",
  "acknowledgment": true
}
```

`acknowledgment` is the regulatory checkbox on `iStep2` — conflict-free, valid lease, royalties remitted,
regulator sharing permitted. `false` returns `422 sell/acknowledgment-required`.

```json
201 Created
{
  "id": "bqt_01H…", "reference": "MB-Q-90418", "status": "desk_pricing",
  "statusLabel": "DESK PRICING",
  "nextSteps": [
    { "n": 1, "title": "Document check",
      "sub": "Permit and lease validated against the register. 1–2 days.", "state": "active" },
    { "n": 2, "title": "Assay confirmation",
      "sub": "Sample drawn at your facility by an accredited lab.", "state": "pending" },
    { "n": 3, "title": "Firm offer issued",
      "sub": "The desk prices the consignment and sends you an offer.", "state": "pending" }
  ],
  "expectedOfferBy": "2026-09-10T17:00:00Z",
  "wholeConsignmentOnly": true
}
```

`wholeConsignmentOnly: true` backs the stated promise that Mineral Bridge buys the full consignment with no
partial purchase.

Errors: `409 sell/standard-flow-required`, `422 sell/export-permit-required`,
`422 sell/acknowledgment-required`.

#### #53 `GET /sell/bulk-quotes/{quoteId}/valuation`

```json
{
  "quantity": { "value": 12.5, "unit": "kg", "grams": 12500 },
  "purity": { "percentage": 99.5, "display": "12.5 kg at 99.5% purity" },
  "deskReference": { "perGram": { "amount": 6510, "currency": "USD", "scale": 2 },
                     "display": "Desk reference $65.10 / g" },
  "band": { "low": { "amount": 78000000, "currency": "USD", "scale": 2 },
            "high": { "amount": 81400000, "currency": "USD", "scale": 2 },
            "display": "$780K – $814K" },
  "wholeConsignmentOnly": true,
  "note": "Our trading desk confirms documents, samples the consignment, then sends a firm offer within two working days."
}
```

Callable before submission with the draft as query parameters, so `iReview` can show the band before the
user commits.

#### #54 `GET /sell/requests?tab=selling`

```json
{
  "data": [
    {
      "id": "srq_01H…", "reference": "MB-S-90412", "kind": "standard",
      "lot": { "name": "Gold Dust", "imageUrl": "…" },
      "quantity": { "value": 250, "unit": "kg", "grams": 250000 },
      "valueLabel": "Est. $13.1M – $14.5M",
      "status": "evaluating", "statusLabel": "EVALUATING", "tone": "warn",
      "stage": { "current": 3, "total": 5, "label": "Step 3 of 5" }, "progress": 62,
      "eta": { "at": "2026-09-09T16:30:00Z", "display": "Offer expected by 16:30 today" },
      "action": { "kind": "track", "label": "Track this request" }
    },
    {
      "id": "srq_02H…", "reference": "MB-S-90408", "kind": "standard",
      "lot": { "name": "Gold Concentrate", "imageUrl": "…" },
      "quantity": { "value": 18, "unit": "kg", "grams": 18000 },
      "valueLabel": "Offer $986,400",
      "status": "offer_ready", "statusLabel": "OFFER READY", "tone": "gold",
      "stage": { "label": "Awaiting you" }, "progress": 80,
      "eta": { "at": "2026-09-10T15:02:00Z", "display": "Expires in 48 hours — accept or decline" },
      "action": { "kind": "offer", "label": "View my offer", "offerId": "ofr_01H…" }
    },
    {
      "id": "bqt_01H…", "reference": "MB-Q-90418", "kind": "bulk",
      "lot": { "name": "Gold Bullion Bar", "imageUrl": "…" },
      "quantity": { "value": 12.5, "unit": "kg", "grams": 12500 },
      "valueLabel": "Bulk quote requested",
      "status": "desk_pricing", "statusLabel": "DESK PRICING", "tone": "live",
      "stage": { "current": 2, "total": 5, "label": "Step 2 of 5" }, "progress": 34,
      "eta": { "display": "Quote within two working days" },
      "action": { "kind": "track", "label": "Track this request" }
    }
  ],
  "meta": { "counts": { "active": 2, "selling": 3, "completed": 1 } }
}
```

Standard requests and bulk quotes come back in one list, discriminated by `kind`, because the "Selling"
tab shows both. `action` tells the client where the row leads — the client currently stores a hard-coded
`dest` screen id per row, which cannot survive real data.

#### #55 `GET /sell/requests/{requestId}`

```json
{
  "id": "srq_01H…", "reference": "MB-S-90412", "kind": "standard",
  "status": "evaluating", "statusLabel": "EVALUATING", "tone": "warn",
  "headline": "Evaluation in progress",
  "lot": { "name": "Gold Dust", "imageUrl": "…", "photoCount": 3 },
  "quantity": { "value": 250, "unit": "kg", "grams": 250000 },
  "valueLabel": "Est. $13.1M – $14.5M",
  "tier": { "id": 2, "tag": "TIER 2" },
  "stage": { "current": 3, "total": 5, "label": "Step 3 of 5" }, "progress": 62,
  "submittedAt": "2026-09-09T08:40:00Z",
  "eta": { "at": "2026-09-09T16:30:00Z", "display": "Offer expected by 16:30 today" },
  "evaluator": {
    "id": "evl_01H…", "name": "Emeka Balogun", "initials": "EB",
    "subtitle": "Certified evaluator · 412 evaluations", "evaluationsCompleted": 412,
    "onSite": true, "checkedInAt": "2026-09-10T10:02:00Z",
    "canCall": true, "canChat": true
  },
  "offer": null,
  "custodyNote": "The lot stays with you throughout. Nothing moves until you accept an offer.",
  "version": 6
}
```

When an offer exists, `offer` carries `{ id, amount, expiresAt, status }` so `sTrack` can show the gold
"Your offer is ready" row without a second call.

#### #56 `GET /sell/requests/{requestId}/timeline`

```json
{
  "steps": [
    { "key": "submitted", "title": "Request submitted",
      "sub": "Photos, quantity and type sent to the desk.",
      "at": "2026-09-09T08:40:00Z", "display": "9 Sep · 08:40", "state": "done" },
    { "key": "estimate_issued", "title": "Estimate issued",
      "sub": "Indicative range $13.1M – $14.5M at today's rate.",
      "at": "2026-09-09T08:41:00Z", "display": "9 Sep · 08:41", "state": "done" },
    { "key": "evaluator_assigned", "title": "Evaluator assigned",
      "sub": "Emeka Balogun · 412 evaluations completed.",
      "at": "2026-09-09T09:05:00Z", "display": "9 Sep · 09:05", "state": "done" },
    { "key": "weighing", "title": "On site and weighing",
      "sub": "Gross weight recorded, tare deducted and photographed.",
      "at": "2026-09-10T10:24:00Z", "display": "10 Sep · 10:24", "state": "done" },
    { "key": "assay", "title": "Fire assay running",
      "sub": "Sample under test. Around 90 minutes remaining.",
      "at": null, "display": "Now", "state": "active" },
    { "key": "offer_issued", "title": "Firm offer issued",
      "sub": "Sent to your phone the moment the assay clears.",
      "at": null, "display": "By 16:30", "state": "pending" },
    { "key": "paid", "title": "Paid to your account",
      "sub": "Within 24 hours of you accepting.",
      "at": null, "display": "Pending", "state": "pending" }
  ]
}
```

#### #57 `GET /sell/requests/{requestId}/documents` — the same shape as #45, with `kind` drawn from
`intake_receipt`, `weight_certificate`, `assay_certificate`, `offer_letter`, `sale_agreement`,
`payment_advice`, `consignment_manifest`, `export_permit_copy`, `valuation_report`.

#### #58 `GET /sell/requests/{requestId}/offer`

```json
{
  "id": "ofr_01H…", "requestId": "srq_01H…", "status": "open",
  "amount": { "amount": 1365000000, "currency": "USD", "scale": 2, "display": "$13.65M" },
  "issuedAt": "2026-09-10T15:02:00Z",
  "expiresAt": "2026-09-12T15:02:00Z",
  "validityHours": 48,
  "assay": {
    "assayedWeight": { "value": 248.6, "unit": "kg", "grams": 248600 },
    "confirmedPurity": { "karat": 21.6, "percentage": 90.1, "display": "21.6K (90.1%)" },
    "evaluatedAt": "2026-09-12T10:00:00Z", "evaluatedAtDisplay": "Sat 12 Sep 2026 · 10:00",
    "location": "Ilesha Lease Site 4",
    "tareDeducted": { "value": 1.4, "unit": "kg", "grams": 1400 }
  },
  "vsEstimate": { "deltaPercent": -0.9, "withinRange": true, "display": "− 0.9% (within range)" },
  "payoutAccount": { "id": "pac_01H…", "display": "GTBank ••4471" },
  "settlement": { "withinHours": 24, "note": "Paid to GTBank ••4471 within 24 hours of acceptance." },
  "afterAccept": [
    "Title transfers to Mineral Bridge and we seal the lot on the spot.",
    "Payment is released to your bank within 24 hours.",
    "We refine, certify and retail it — you have nothing further to do."
  ],
  "canRequestReview": true,
  "version": 2
}
```

`status` is `open`, `accepted`, `declined`, `expired` or `withdrawn`. The client currently computes the
offer as `grams × 54.60`; like the estimate, this must be server-authoritative — it is a binding price.

Errors: `409 sell/offer-not-ready`, `410 sell/offer-expired`.

#### #59 `POST /sell/requests/{requestId}/offer/accept`

```json
{ "offerId": "ofr_01H…", "payoutAccountId": "pac_01H…", "version": 2 }
```

```json
200 OK
{
  "saleReference": "MB-S-90412",
  "status": "sold",
  "titleTransferredAt": "2026-09-10T15:40:00Z",
  "payout": {
    "amount": { "amount": 1365000000, "currency": "USD", "scale": 2, "display": "$13.65M" },
    "account": { "display": "GTBank ••4471" },
    "expectedBy": "2026-09-11T15:40:00Z",
    "etaDisplay": "Arrives at GTBank ••4471 within 24 hours"
  },
  "documents": [
    { "id": "doc_11H…", "name": "Sale agreement", "kind": "sale_agreement", "ready": true },
    { "id": "doc_12H…", "name": "Assay certificate", "kind": "assay_certificate", "ready": true },
    { "id": "doc_13H…", "name": "Payment advice", "kind": "payment_advice", "ready": true }
  ]
}
```

This response is exactly what `sPaid` renders. Requires `Idempotency-Key`.
Errors: `410 sell/offer-expired`, `409 sell/offer-already-decided`, `409` with `current` on a version
mismatch, `409 payout/account-unverified`.

#### #60 `POST /sell/requests/{requestId}/offer/decline`

```json
{ "offerId": "ofr_01H…", "reason": "price_too_low", "note": null, "version": 2 }
```
→ `200 { "status": "declined", "lotRetainedBySeller": true, "message": "Offer declined — the lot stays yours." }`.
`reason` is optional and drawn from `price_too_low`, `found_other_buyer`, `changed_mind`,
`timing`, `other`.

#### #61 `POST /sell/requests/{requestId}/offer/review`

```json
{ "offerId": "ofr_01H…", "reason": "Offer seems low", "note": null }
```
→ `202 { "ticketReference": "TCK-4482", "callbackExpected": { "withinHours": 4, "display": "The desk will call you" } }`.
Pauses the 48-hour expiry while the review is open; the response's `offerExpiresAt` reflects the extension.

---

### 9.8 Auctions

#### #62 `GET /auctions?status=live&limit=20`

```json
{
  "data": [
    {
      "id": "auc_01H…", "reference": "MB-A-2214", "name": "Cobalt Hydroxide",
      "lot": { "quantity": { "value": 18, "unit": "t", "grams": 18000000 },
               "grade": "30% Co", "display": "18 t · 30% Co" },
      "status": "live",
      "bid": { "amount": 4820000, "currency": "USD", "scale": 2, "display": "$48,200" },
      "bidLabel": "CURRENT BID",
      "closesAt": "2026-10-16T11:55:00Z", "countdownDisplay": "2h 14m",
      "bidCount": 14, "reserveMet": true,
      "assured": true, "imageUrl": "…"
    }
  ],
  "meta": { "limit": 20, "nextCursor": null, "counts": { "live": 12, "upcoming": 5, "ended": 38 } }
}
```

`status` is `live`, `upcoming` or `ended`. `bidLabel` differs per tab — "CURRENT BID", "STARTING BID",
"SOLD FOR" — and comes from the server so the three tabs stay consistent with how the lot is priced.
`countdownDisplay` is a convenience; the client counts down from `closesAt`.

#### #63 `GET /auctions/{auctionId}`

```json
{
  "id": "auc_01H…", "reference": "MB-A-2214", "name": "Cobalt Hydroxide",
  "status": "live",
  "lot": { "quantity": { "value": 18, "unit": "t", "grams": 18000000 }, "grade": "30% Co",
           "display": "Lot MB-A-2214 · 18 tonnes · 30% Co" },
  "description": "Cooperative intake from Kolwezi, dried and bagged in 1-tonne sacks. Independent sampling by SGS on 28 August, moisture 8.2%.",
  "badges": [
    { "kind": "assured", "label": "Mineral Bridge Assured" },
    { "kind": "origin_traced", "label": "Origin traced" },
    { "kind": "certification", "label": "Cobalt Institute" }
  ],
  "sampling": { "by": "SGS", "at": "2026-08-28T00:00:00Z", "moisturePercent": 8.2 },
  "bidding": {
    "startingBid": { "amount": 3800000, "currency": "USD", "scale": 2, "display": "$38,000" },
    "highestBid": { "amount": 4820000, "currency": "USD", "scale": 2, "display": "$48,200" },
    "minimumIncrement": { "amount": 20000, "currency": "USD", "scale": 2, "display": "$200" },
    "nextValidBid": { "amount": 4840000, "currency": "USD", "scale": 2, "display": "$48,400" },
    "quickIncrements": [20000, 50000, 100000],
    "bidCount": 14, "reserveMet": true,
    "yourBid": { "amount": 4820000, "currency": "USD", "scale": 2, "display": "$48,200" },
    "youAreHighest": true
  },
  "closesAt": "2026-10-16T11:55:00Z",
  "antiSniping": { "enabled": true, "extendByMinutes": 2, "withinMinutes": 2 },
  "bindingNote": "Bids are binding. Winning bids move straight to delivery details.",
  "imageUrl": "…", "mediaCount": 4,
  "version": 14
}
```

`nextValidBid` is what the bid sheet pre-fills, and `quickIncrements` drives its +$200 / +$500 / +$1,000
buttons — both server-supplied so a change to increment policy does not need an app release.

#### #64 `GET /auctions/{auctionId}/bids?limit=20`

```json
{
  "data": [
    { "id": "bid_01H…", "bidderDisplayName": "Aurora Refining", "initials": "AR",
      "amount": { "amount": 4820000, "currency": "USD", "scale": 2, "display": "$48,200" },
      "placedAt": "2026-10-16T09:39:00Z", "agoDisplay": "2 minutes ago",
      "leading": true, "isYou": true }
  ],
  "meta": { "total": 14, "nextCursor": "…" }
}
```

`bidderDisplayName` is the bidder's trading name where they permit it and a pseudonym otherwise
("Bidder #4417"). Never return a bidder's real identity, phone or account id.

#### #65 `POST /auctions/{auctionId}/bids`

Headers: `Idempotency-Key`, `X-Transaction-Pin`.

```json
{ "amount": { "amount": 4840000, "currency": "USD", "scale": 2 }, "version": 14, "acceptBinding": true }
```

```json
201 Created
{
  "bid": { "id": "bid_09H…", "amount": { "amount": 4840000, "currency": "USD", "scale": 2 },
           "placedAt": "2026-10-16T09:41:02Z", "leading": true },
  "auction": { "highestBid": { "amount": 4840000, "currency": "USD", "scale": 2 },
               "bidCount": 15, "closesAt": "2026-10-16T11:55:00Z", "version": 15 }
}
```

Errors: `422 auction/bid-too-low` with `fields.amount` carrying the floor, `409 auction/outbid` with
`current`, `422 auction/self-outbid`, `409 auction/not-open`, `410 auction/closed`,
`422 auth/pin-invalid`, `403 kyc/not-verified`.

#### #66 `GET /auctions/{auctionId}/result`

```json
{
  "auction": { "id": "auc_01H…", "reference": "MB-A-2214", "name": "Cobalt Hydroxide",
               "lot": { "display": "18 tonnes · 30% Co · Kolwezi" }, "imageUrl": "…" },
  "outcome": "won",
  "closedAt": "2026-09-08T16:00:00Z", "closedAtDisplay": "WON · 8 SEP 2026",
  "winningBid": { "amount": 4980000, "currency": "USD", "scale": 2, "display": "$49,800" },
  "yourLastBid": { "amount": 4980000, "currency": "USD", "scale": 2, "display": "$49,800" },
  "escrow": { "held": true,
              "note": "Payment is held in escrow and released only after you confirm the delivered assay." },
  "nextAction": { "kind": "delivery_details", "label": "Proceed to delivery details" },
  "similarLots": []
}
```

`outcome` is `won`, `lost` or `reserve_not_met`. On a loss, `similarLots` carries the "OPENING SOON"
suggestions (`[{ id, name, subtitle, imageUrl, opensAt }]`) and `nextAction.kind` is `browse_similar`.

#### #67 `GET /me/bids?status=active`

```json
{
  "data": [
    { "auctionId": "auc_01H…", "auctionName": "Cobalt Hydroxide", "imageUrl": "…",
      "yourBid": { "amount": 4820000, "currency": "USD", "scale": 2 },
      "highestBid": { "amount": 4840000, "currency": "USD", "scale": 2 },
      "youAreHighest": false, "status": "outbid",
      "closesAt": "2026-10-16T11:55:00Z" }
  ],
  "meta": { "counts": { "active": 3, "won": 1, "lost": 4 } }
}
```

`status` is `leading`, `outbid`, `won` or `lost`. Backs the profile's "3 active · 1 won this week".

#### #68 `POST /auctions/{auctionId}/watch`

```json
{ "notifyOnSimilar": true }
```
→ `204`. "Notify me next time" on `aLost`.

---

### 9.9 Learning Center

#### #69 `GET /learn/tracks`

```json
{
  "data": [
    {
      "key": "miner", "label": "For miners", "title": "Safe mining",
      "subtitle": "For artisanal and small-scale miners",
      "progress": { "completed": 1, "total": 6 },
      "sections": [
        { "id": "lsec_ground_safety", "label": "GROUND SAFETY",
          "blurb": "Work a small site without getting hurt: ground support, air, mercury and first aid.",
          "lessonCount": 6, "completedCount": 1 }
      ]
    },
    {
      "key": "trade", "label": "Trading", "title": "Trading on Mineral Bridge",
      "subtitle": "Selling, grading, compliance and auctions",
      "progress": { "completed": 5, "total": 17 },
      "sections": [
        { "id": "lsec_getting_started", "label": "GETTING STARTED",
          "blurb": "What Mineral Bridge does and how to set your account up.",
          "lessonCount": 3, "completedCount": 3 },
        { "id": "lsec_selling_safely", "label": "SELLING SAFELY",
          "blurb": "Avoid underpayment, unsafe handover and unlicensed buyers.",
          "lessonCount": 4, "completedCount": 0 }
      ]
    }
  ]
}
```

`lHome` shows lesson rows inline under each section, so the response may embed the first page of
`lessons` per section. The client requests `?include=lessons` to get them in one round trip.

#### #70 `GET /learn/sections/{sectionId}`

```json
{
  "id": "lsec_selling_safely", "label": "SELLING SAFELY", "title": "Selling Safely",
  "blurb": "Avoid underpayment, unsafe handover and unlicensed buyers.",
  "track": "trade",
  "progress": { "completed": 0, "total": 4 },
  "lessons": [
    { "id": "les_01H…", "position": 1, "name": "Spotting an unlicensed buyer",
      "durationSeconds": 195, "durationDisplay": "3:15",
      "state": "up_next", "completed": false, "iconKey": "warning",
      "thumbnailUrl": "…" }
  ]
}
```

`state` is `completed`, `up_next` or `not_started` — exactly the three labels `lList` renders.

#### #71 `GET /learn/lessons/{lessonId}`

```json
{
  "id": "les_01H…", "name": "Weighing and pricing your lot",
  "sectionId": "lsec_selling_safely", "sectionLabel": "SELLING SAFELY",
  "position": 2, "sectionLessonCount": 4,
  "description": "A short walkthrough with the practical steps, the mistakes people make, and what to do next.",
  "durationSeconds": 168, "durationDisplay": "2:48",
  "media": { "url": "https://cdn…/les_01H.m3u8", "kind": "hls",
             "posterUrl": "…", "captionsUrl": "…/en.vtt", "expiresIn": 3600 },
  "chapters": [
    { "position": 0, "name": "Why weight is measured twice", "startSeconds": 0, "display": "00:00" },
    { "position": 1, "name": "Reading the scale certificate", "startSeconds": 41, "display": "00:41" },
    { "position": 2, "name": "Legitimate deductions", "startSeconds": 78, "display": "01:18" },
    { "position": 3, "name": "Questions to ask before handover", "startSeconds": 124, "display": "02:04" }
  ],
  "progress": { "positionSeconds": 0, "chapter": 0, "completed": false }
}
```

#### #72 `PUT /learn/lessons/{lessonId}/progress`

```json
{ "positionSeconds": 78, "chapter": 2 }
```
→ `204`. Debounced client-side to at most one call every 10 seconds of playback.

#### #73 `POST /learn/lessons/{lessonId}/complete`

```json
200 OK
{
  "lesson": { "id": "les_01H…", "completed": true, "completedAt": "2026-10-16T09:48:00Z" },
  "section": { "id": "lsec_selling_safely", "progress": { "completed": 1, "total": 4 } },
  "track": { "key": "trade", "progress": { "completed": 6, "total": 17 } },
  "nextLesson": { "id": "les_02H…", "name": "Safe handover at the pickup site" }
}
```

Returning all three progress levels lets `lList` and `lHome` update without refetching either.

---

### 9.10 Payouts

#### #74 `GET /payouts/balance`

```json
{
  "available": { "amount": 4850000, "currency": "USD", "scale": 2, "display": "$48,500.00" },
  "inEscrow": { "amount": 1240000, "currency": "USD", "scale": 2, "display": "$12,400" },
  "escrowNote": "$12,400 in escrow, releases on delivery",
  "minimumWithdrawal": { "amount": 10000, "currency": "USD", "scale": 2 },
  "dailyLimit": { "amount": 10000000, "currency": "USD", "scale": 2 },
  "withdrawnToday": { "amount": 0, "currency": "USD", "scale": 2 },
  "presets": [
    { "amount": 1000000, "label": "$10,000" },
    { "amount": 2500000, "label": "$25,000" },
    { "amount": 4850000, "label": "All" }
  ]
}
```

`presets` is server-supplied because the "All" preset must equal the live balance — the client currently
hard-codes 10,000 / 25,000 / 48,500.

#### #75 `GET /payouts/accounts`

```json
{
  "data": [
    { "id": "pac_01H…", "kind": "bank", "label": "GTBank · ••4471",
      "holderName": "Adaeze C. Okafor", "currency": "NGN",
      "subtitle": "Adaeze C. Okafor · NGN",
      "isDefault": true, "verified": true, "iconKey": "bank" },
    { "id": "pac_02H…", "kind": "wise", "label": "Wise · USD balance",
      "subtitle": "For international settlement", "currency": "USD",
      "isDefault": false, "verified": true, "iconKey": "globe" }
  ]
}
```

Account numbers are always masked to the last four digits. The full number is never returned, and the app
never collects or displays it.

#### #76 `POST /payouts/accounts`

```json
{ "kind": "bank", "bankCode": "058", "accountNumber": "0123454471", "holderName": "Adaeze C. Okafor", "currency": "NGN" }
```
→ `201` with the masked account and `verified: false` while name verification runs.
Errors: `422 payout/name-mismatch` when the holder name does not match the KYC name.

> The mobile app does **not** implement this form today — `payout` shows "Add a payout account" as a toast
> only. Specified here so the backend contract is complete; see §15.

#### #77 `PUT /payouts/accounts/{accountId}/default` → `200` with the refreshed account list.
#### #78 `DELETE /payouts/accounts/{accountId}` → `204`. `409` if it is the only account and a payout is pending.

#### #79 `POST /payouts/withdrawals`

Headers: `Idempotency-Key`, `X-Transaction-Pin`.

```json
{ "amount": { "amount": 2500000, "currency": "USD", "scale": 2 }, "accountId": "pac_01H…" }
```

```json
201 Created
{
  "id": "pwd_01H…",
  "amount": { "amount": 2500000, "currency": "USD", "scale": 2, "display": "$25,000.00" },
  "account": { "id": "pac_01H…", "label": "GTBank · ••4471" },
  "fee": { "amount": 0, "currency": "USD", "scale": 2, "display": "Free" },
  "status": "processing",
  "expectedBy": "2026-10-17T09:50:00Z", "etaDisplay": "Within 24 hours",
  "remainingBalance": { "amount": 2350000, "currency": "USD", "scale": 2, "display": "$23,500.00" }
}
```

`fee` and `remainingBalance` back the two rows on `withdraw`; the "Transfer fee: Free" line must come from
the server, not the binary.

Errors: `422 payout/insufficient-balance`, `422 payout/below-minimum`, `429 payout/daily-limit-exceeded`,
`409 payout/account-unverified`, `422 auth/pin-invalid`, `423 auth/pin-locked`.

#### #80 `GET /payouts/history?limit=20`

```json
{
  "data": [
    { "id": "pwd_09H…", "amount": { "amount": 1840000, "currency": "USD", "scale": 2, "display": "$18,400.00" },
      "account": { "label": "GTBank ••4471" }, "status": "paid", "statusLabel": "PAID",
      "settledAt": "2026-09-02T00:00:00Z", "meta": "GTBank ••4471 · 2 Sep 2026" }
  ],
  "meta": { "total": 14, "nextCursor": "…" }
}
```

`status` is `processing`, `paid`, `failed` or `reversed`.

---

### 9.11 Documents

#### #81 `GET /documents`

```json
{
  "data": [
    {
      "id": "doc_01H…", "name": "National ID (NIN)", "kind": "government_id",
      "status": "verified", "statusLabel": "VERIFIED",
      "meta": "Verified 6 Sep 2026 · no expiry",
      "verifiedAt": "2026-09-06T00:00:00Z", "expiresAt": null,
      "rows": [
        { "key": "TYPE", "value": "Government ID" },
        { "key": "NUMBER", "value": "2213 4477 901" },
        { "key": "VERIFIED", "value": "6 Sep 2026" },
        { "key": "EXPIRES", "value": "No expiry", "tone": "success" }
      ]
    },
    {
      "id": "doc_02H…", "name": "Export permit", "kind": "export_permit",
      "status": "expiring", "statusLabel": "EXPIRING",
      "meta": "NG-EXP-2026-11204 · expires 30 Sep",
      "expiresAt": "2026-09-30T00:00:00Z", "daysUntilExpiry": 21,
      "rows": [ … ]
    }
  ],
  "meta": {
    "total": 4,
    "warning": { "kind": "expiring", "count": 1, "daysUntilExpiry": 21,
      "title": "One document expires in 21 days",
      "sub": "Renew your export permit to keep selling in bulk." }
  }
}
```

`status` is `verified`, `expiring`, `in_review`, `expired` or `rejected`. `rows` is the server-driven
metadata table `docDetail` renders — the fields differ per document kind, so they cannot be a client
constant. `meta.warning` drives the amber banner on `docs`.

#### #82 `GET /documents/{documentId}`

As one `data` entry above, plus:

```json
{
  "previewUrl": "https://cdn…?sig=…", "previewExpiresIn": 900,
  "downloadUrl": "https://cdn…?sig=…", "downloadExpiresIn": 900,
  "contentType": "application/pdf", "bytes": 1468006,
  "canReplace": true, "canDelete": true
}
```

`canDelete` is `false` for documents a pending submission depends on — the delete affordance on
`docDetail` must respect it rather than fail after the tap.

#### #83 `POST /documents` — multipart: `file`, `kind`, optional `expiresAt`, `number`.
→ `201` with the document in `in_review`.
Errors: `422 document/too-large`, `422 document/unsupported-type`, `422 document/expired`.

#### #84 `PUT /documents/{documentId}` — multipart, same fields; replaces the file and resets status to
`in_review`. → `200`.

#### #85 `DELETE /documents/{documentId}` → `204`. `409 document/in-use` when a submission depends on it.

---

### 9.12 Notifications

#### #86 `GET /notifications?limit=20`

```json
{
  "data": [
    {
      "id": "ntf_01H…", "kind": "auction_outbid",
      "title": "You have been outbid on Cobalt Hydroxide",
      "body": "New highest bid $49,600 · 2h 14m left",
      "createdAt": "2026-10-16T09:37:00Z", "agoDisplay": "4 minutes ago",
      "read": false,
      "iconKey": "gavel", "tone": "warn",
      "target": { "kind": "auction", "id": "auc_01H…" }
    },
    {
      "id": "ntf_02H…", "kind": "order_in_transit",
      "title": "Order MB-2026-04871 is in transit",
      "body": "Arriving Wed 10 Sep, 14:00–17:00",
      "createdAt": "2026-10-16T07:41:00Z", "agoDisplay": "2 hours ago",
      "read": false, "iconKey": "truck", "tone": "info",
      "target": { "kind": "order", "id": "ord_01H…" }
    }
  ],
  "meta": { "total": 24, "nextCursor": "…", "unreadCount": 3 }
}
```

`target` is what the client routes on when a notification is tapped — the deep-link destination belongs to
the server, not to a client switch on `kind`. `kind` values in use: `auction_outbid`, `auction_won`,
`auction_ending`, `order_in_transit`, `order_quote_ready`, `order_delivered`, `sell_offer_ready`,
`sell_evaluator_assigned`, `sell_paid`, `kyc_approved`, `kyc_rejected`, `document_expiring`,
`payout_paid`, `support_reply`, `learn_new_lesson`.

#### #87 `POST /notifications/read` → `200 { "unreadCount": 0 }`.
#### #88 `POST /notifications/{notificationId}/read` → `200 { "unreadCount": 2 }`.

#### #89 `POST /notifications/devices`

```json
{ "token": "fcm_…", "platform": "android", "deviceId": "…", "appVersion": "2.4.0", "locale": "en-NG" }
```
→ `204`. Called at bootstrap and whenever the push token rotates.

#### #90 `DELETE /notifications/devices/{token}` → `204`. Called on sign-out before #6.

---

### 9.13 Support

#### #91 `GET /support/channels`

```json
{
  "deskOpen": true,
  "hours": { "display": "DESK OPEN · 08:00–20:00 WAT", "timezone": "Africa/Lagos",
             "opensAt": "08:00", "closesAt": "20:00",
             "days": "Mon–Sat, 8am–8pm WAT" },
  "replyTimes": { "chat": "Typical reply in 4 minutes", "email": "same day" },
  "channels": [
    { "kind": "chat", "name": "Live chat", "subtitle": "Replies in ~2 min", "available": true },
    { "kind": "phone", "name": "Call the desk", "subtitle": "+234 700 646 3725",
      "value": "+2347006463725", "available": true },
    { "kind": "email", "name": "Email us", "subtitle": "help@mineralbridge.co",
      "value": "help@mineralbridge.co", "available": true },
    { "kind": "whatsapp", "name": "WhatsApp", "subtitle": "Same number, 24/7",
      "value": "+2347006463725", "available": true }
  ]
}
```

Phone numbers, the email address and the desk hours are all operational facts that change — none should be
compiled into the app, as they are today.

#### #92 `GET /support/faqs`

```json
{
  "data": [
    { "id": "faq_01", "question": "When do I get paid for a lot?",
      "answer": "Escrow releases within 24 hours of you and the buyer both confirming the delivered assay. Payout lands in your default account on the next banking day.",
      "position": 1 }
  ]
}
```

#### #93 `GET /support/tickets`

```json
{
  "data": [
    { "id": "tkt_01H…", "reference": "TCK-4471",
      "subject": "Assay weight differs from my own scale",
      "status": "agent_replied", "statusLabel": "AGENT REPLIED",
      "messageCount": 3, "updatedAt": "2026-10-16T07:50:00Z",
      "meta": "Updated 2 hours ago · 3 messages",
      "relatedTo": { "kind": "sell_request", "id": "srq_01H…", "reference": "MB-S-90412" } }
  ],
  "meta": { "total": 2, "counts": { "open": 1, "resolved": 1 } }
}
```

`status` is `open`, `agent_replied`, `awaiting_you`, `resolved` or `closed`.

#### #94 `POST /support/tickets`

```json
{
  "topic": "evaluation",
  "relatedTo": { "kind": "sell_request", "id": "srq_01H…" },
  "description": "The evaluator recorded 248.6 kg but my own scale read 250 kg before they arrived. Can you explain the difference?",
  "attachmentIds": ["att_01H…"]
}
```

`topic` is `evaluation`, `payment`, `documents`, `order` or `other` — the five chips on `newTicket`.
→ `201` with the ticket. Requires `Idempotency-Key`.

#### #95 `GET /support/tickets/{ticketId}`

```json
{
  "id": "tkt_01H…", "reference": "TCK-4471",
  "subject": "Assay weight differs from my own scale",
  "status": "agent_replied", "statusLabel": "AGENT REPLIED",
  "openedAt": "2026-09-08T11:20:00Z", "meta": "Opened 8 Sep · about request MB-S-90412",
  "relatedTo": { "kind": "sell_request", "id": "srq_01H…", "reference": "MB-S-90412" },
  "canReply": true, "canResolve": true,
  "messages": [
    { "id": "msg_01H…", "author": { "kind": "user", "label": "YOU" },
      "text": "The evaluator recorded 248.6 kg but my own scale read 250 kg before they arrived. Can you explain the difference?",
      "at": "2026-09-08T11:20:00Z", "display": "8 Sep · 11:20", "attachments": [] },
    { "id": "msg_02H…", "author": { "kind": "agent", "label": "MINERAL BRIDGE", "name": "Ngozi A." },
      "text": "Thanks for flagging it. Our evaluator deducts tare weight for the sealed container, which was 1.4 kg on this lot.",
      "at": "2026-09-08T11:44:00Z", "display": "8 Sep · 11:44", "attachments": [] }
  ]
}
```

#### #96 `POST /support/tickets/{ticketId}/messages`

```json
{ "text": "Understood, that matches. Thank you.", "attachmentIds": [] }
```
→ `201` with the created message. `409 support/ticket-closed` on a resolved ticket.

#### #97 `POST /support/tickets/{ticketId}/resolve`

```json
{ "satisfied": true, "note": null }
```
→ `200` with the ticket in `resolved`.

#### #98 `POST /support/attachments` — multipart, `file`. → `201 { "id": "att_01H…", "name": …, "bytes": …, "contentType": … }`.

#### #99 `POST /support/chat/sessions`

```json
{ "relatedTo": { "kind": "sell_request", "id": "srq_01H…" }, "topic": "evaluation" }
```

```json
201 Created
{
  "id": "cht_01H…",
  "agent": { "id": "agt_01H…", "name": "Ngozi A.", "initials": "NA",
             "online": true, "statusDisplay": "Online · replies in about 2 min" },
  "socketUrl": "wss://api.mineralbridge.co/v1/ws/support/chat/cht_01H…",
  "relatedCard": {
    "reference": "MB-S-90412", "name": "Gold Dust · 250 kg", "imageUrl": "…",
    "target": { "kind": "sell_request", "id": "srq_01H…" }, "linkLabel": "Open this request"
  },
  "quickReplies": [
    "Where is my evaluator?",
    "Change my payout account",
    "Talk about an order"
  ],
  "openedAt": "2026-10-16T14:06:00Z", "openedAtDisplay": "Today · 14:06"
}
```

`quickReplies` and `relatedCard` are server-supplied: the suggestions should reflect the user's actual open
requests, which the client cannot know. `503 support/chat-unavailable` outside desk hours, with the hours
in `message`.

#### #100 `GET /support/chat/sessions/{sessionId}/messages?limit=50`

```json
{
  "data": [
    { "id": "cms_01H…", "author": "agent",
      "text": "Hi Adaeze, Ngozi from the verification desk. How can I help?",
      "at": "2026-10-16T14:06:00Z", "display": "14:06", "read": true },
    { "id": "cms_02H…", "author": "user", "clientId": "…",
      "text": "My evaluation is running now. When will I see the offer?",
      "at": "2026-10-16T14:07:00Z", "display": "14:07", "read": true }
  ],
  "meta": { "total": 3, "nextCursor": null, "agentTyping": false }
}
```

#### #101 `POST /support/chat/sessions/{sessionId}/messages`

```json
{ "text": "Where is my evaluator?", "clientId": "a3f1…", "attachmentIds": [] }
```
→ `201` with the created message. The HTTP fallback when the socket is unavailable; `clientId` dedupes
against a message that also arrives over W3.

#### #102 `POST /support/chat/sessions/{sessionId}/end`

```json
{ "emailTranscript": true }
```
→ `200 { "endedAt": "…", "transcriptEmailedTo": "adaeze.okafor@auroraref.ng" }` — the "Chat ended — a
transcript was emailed to you" confirmation.

---

### 9.14 Reference and content

#### #103 `POST /support/contact-requests`

```json
{
  "about": { "kind": "order", "id": "ord_01H…" },
  "target": "verification_desk",
  "reason": "delivery_question",
  "preferredTime": null
}
```

`target` is `verification_desk` or `evaluator`; with `evaluator`, `evaluatorId` is required.

```json
202 Accepted
{
  "id": "crq_01H…",
  "target": "verification_desk",
  "message": "Verification desk notified — they will call you",
  "expectedWithinMinutes": 30
}
```

`message` is the toast text, server-supplied so the promise matches the desk's actual SLA. This one
endpoint serves "Contact the desk" on `track` and `sTrack`, and "Call Emeka Balogun" on `sEval` and
`sTrack`.

#### #104 `GET /content/intro`

```json
{
  "video": {
    "url": "https://cdn…/intro.m3u8", "durationSeconds": 35, "posterUrl": "…",
    "shots": [
      { "position": 1, "startSeconds": 0, "durationSeconds": 6.5, "imageUrl": "…",
        "kicker": "MINERAL BRIDGE", "title": "Verified mineral trade",
        "subtitle": "Artisanal and institutional sellers meeting industrial buyers." },
      { "position": 2, "startSeconds": 6.5, "durationSeconds": 6.5, "imageUrl": "…",
        "kicker": "1 — SELLING", "title": "We buy it from you",
        "subtitle": "Instant estimate, free evaluation, firm offer, paid in 24h." }
    ]
  },
  "audiences": [
    { "key": "buyers", "title": "Buyers", "subtitle": "People and businesses who need material",
      "levels": [
        { "n": 1, "name": "Individual", "subtitle": "Small personal purchases — a jeweller, a collector." },
        { "n": 2, "name": "Small group / SME", "subtitle": "Buys to resell locally or across the region." },
        { "n": 3, "name": "Registered company", "subtitle": "Refineries and factories buying by the tonne." }
      ] },
    { "key": "sellers", "title": "Sellers", "subtitle": "People and companies who dig or hold material",
      "levels": [ … ] }
  ],
  "paths": [
    { "key": "buy", "label": "IF YOU BUY", "title": "Buy assured stock", "imageUrl": "…",
      "points": [
        "Browse stock Mineral Bridge already owns",
        "Fixed prices, no haggling with a stranger",
        "Every lot assayed and Mineral Bridge Assured",
        "Bid on bulk consignments in live auctions"
      ] },
    { "key": "sell", "label": "IF YOU SELL", "title": "Sell it to us", "imageUrl": "…",
      "points": [
        "Get a price estimate in under a minute",
        "Free evaluation at your own site",
        "A firm offer you can accept or decline",
        "Paid within 24 hours — we handle the rest"
      ] }
  ],
  "topics": [
    { "position": 1, "title": "What is a mineral?", "subtitle": "…", "body": "…" },
    { "position": 2, "title": "Who can join?", "subtitle": "Two sides, three levels each", "body": "…" },
    { "position": 3, "title": "How does Mineral Bridge fit in?", "subtitle": "…", "body": "…" },
    { "position": 4, "title": "What can you do here?", "subtitle": "…", "body": "…" }
  ],
  "version": "2026-10-01",
  "etag": "W/\"intro-2026-10-01\""
}
```

All of this is marketing copy that explains a regulated business to first-time users. It is currently
compiled into the binary (`src/lib/catalog.ts`: `VID`, `INTRO_WHO`, `INTRO_CAN`, and `IntroTopics.tsx`).
Serving it with an `ETag` lets it be corrected without a store release — which matters, because some of it
makes commercial promises.

#### #105 `GET /content/account-tiers`

```json
{
  "data": [
    { "id": 1, "tag": "TIER 1", "name": "Individual", "shortName": "Individual",
      "description": "Legal artisanal miners, solo operators, small leaseholders or personal buyers.",
      "hint": "Tier 1 needs only an ID. Selling is a 4-step flow with no permits.",
      "iconKey": "person", "sellFlow": "standard",
      "requiredDocuments": ["government_id"] },
    { "id": 2, "tag": "TIER 2", "name": "Small group / SME", "shortName": "Small group / SME",
      "description": "A cooperative, mining group or trading business.",
      "hint": "Tier 2 adds a group registration number, checked once at KYC.",
      "iconKey": "group", "sellFlow": "standard",
      "requiredDocuments": ["government_id", "group_registration"] },
    { "id": 3, "tag": "TIER 3", "name": "Registered company", "shortName": "Registered company",
      "description": "A licensed trader, refinery or institutional buyer.",
      "hint": "Tier 3 unlocks bulk consignments and requires import or export permits.",
      "iconKey": "building", "sellFlow": "bulk",
      "requiredDocuments": ["government_id", "company_registration", "export_permit"] }
  ],
  "note": "This is a tag on your account, not a limit. Everyone can buy and sell — your tier only sets how much paperwork we ask for."
}
```

`sellFlow` is what `sPick` routes on. `requiredDocuments` lets the client warn before `iStep2` rather than
after a `422`.

#### #106 `GET /reference/rates?minerals=gold,cobalt`

```json
{
  "data": [
    { "mineral": "gold", "perGram": { "amount": 6140, "currency": "USD", "scale": 2 },
      "display": "$61.40 / g", "purityBasis": "22K (91.6%)",
      "asOf": "2026-10-16T09:37:00Z", "ageDisplay": "Rate updated 4 minutes ago",
      "deskReference": { "amount": 6510, "currency": "USD", "scale": 2, "display": "$65.10 / g" } },
    { "mineral": "cobalt", "perTonne": { "amount": 267800, "currency": "USD", "scale": 2 },
      "display": "$2,678 / t", "asOf": "2026-10-16T09:37:00Z" }
  ],
  "refreshAfterSeconds": 300
}
```

`ageDisplay` is the "Rate updated 4 minutes ago" line on `sEstimate`. `refreshAfterSeconds` tells the
client how long it may cache.

---

## 10. Shared schemas

```ts
type Money = {
  amount: number;        // integer, minor units
  currency: 'USD' | 'NGN' | 'EUR' | 'GBP';
  scale: number;         // decimal places implied by `amount`
  display?: string;      // server-formatted, for read-only presentation
};

type Quantity = {
  value: number;
  unit: 'g' | 'kg' | 't';
  grams: number;         // always present; the client never converts
};

type UnitPrice = { unitPrice: Money; per: 'g' | 'kg' | 't' | 'ct' };

type Purity = { karat?: number; percentage: number; display: string };

type DisplayTime = { at: string | null; display: string };

type TimeWindow = { from: string; to: string; display: string };

type StepState = 'done' | 'active' | 'pending';

type TimelineStep = {
  key: string;
  title: string;
  sub: string;
  at: string | null;
  display: string;
  state: StepState;
};

type NumberedStep = { n: number; title: string; sub: string; state: StepState };

type Tone = 'live' | 'warn' | 'done' | 'gold' | 'info' | 'success';

type Stage = { current?: number; total?: number; label: string };

type Address = {
  id: string;
  kind: 'pickup' | 'delivery';
  label: string;
  streetAddress: string;
  city: string;
  region: string;
  country: string;
  contactPerson: string;
  contactPhone: string;
  isDefault: boolean;
  source?: 'profile' | 'manual';
  geo?: { lat: number; lng: number };
  importPermitNumber?: string;
};

type Badge = { kind: string; label: string };

type KeyValueRow = { key: string; value: string; tone?: Tone };

type MediaRef = {
  id: string;
  url: string;
  thumbnailUrl?: string;
  contentType: string;
  bytes: number;
  position?: number;
  alt?: string;
};

type DocumentRef = {
  id: string;
  name: string;
  kind: string;
  meta: string;
  ready: boolean;
  downloadUrl?: string;
  expiresIn?: number;
};

type Evaluator = {
  id: string;
  name: string;
  initials: string;
  subtitle: string;
  evaluationsCompleted: number;
  onSite: boolean;
  checkedInAt: string | null;
  canCall: boolean;
  canChat: boolean;
};

type Bid = {
  id: string;
  bidderDisplayName: string;
  initials: string;
  amount: Money;
  placedAt: string;
  agoDisplay: string;
  leading: boolean;
  isYou: boolean;
};

type ChatMessage = {
  id: string;
  clientId?: string;
  author: 'user' | 'agent' | 'system';
  text: string;
  at: string;
  display: string;
  read: boolean;
  attachments: MediaRef[];
};

type Paged<T> = {
  data: T[];
  meta: {
    total?: number;
    limit: number;
    nextCursor: string | null;
    hasMore?: boolean;
    counts?: Record<string, number>;
  };
};

type ApiErrorBody = {
  code: string;
  message: string;
  fields?: Record<string, string>;
  hint?: string;
  requestId?: string;
  current?: unknown;      // on 409 version conflicts
  kycStatus?: KycStatus;  // on 403 kyc/not-verified
};
```

### Why `display` fields exist

Several schemas carry both a machine value and a `display` string. This is deliberate, not redundancy.
Mineral Bridge's timelines and status copy are written by the verification desk and are part of how the
product explains a regulated process ("Gross weight recorded, tare deducted and photographed"). The client
must render that wording verbatim, and cannot synthesise it from an enum. The machine value is there so the
client can still sort, compare, count down and localise.

The rule: **the client computes from the machine value and renders the `display` string.** Where the two
could disagree — money the user acts on, quantities that drive a stepper — the machine value wins and the
client formats it itself.

---

## 11. Enumerations

| Enum | Values |
|---|---|
| `KycStatus` | `none`, `pending`, `verified`, `rejected` |
| `TierId` | `1`, `2`, `3` |
| `SellFlow` | `standard`, `bulk` |
| `Unit` | `g`, `kg`, `t` |
| `Currency` | `USD`, `NGN`, `EUR`, `GBP` |
| `Language` | `en`, `ha`, `yo`, `ig`, `fr` |
| `UnitSystem` | `metric`, `imperial`, `troy` |
| `OrderStatus` | `verifying`, `quote_issued`, `escrow_funded`, `released`, `in_transit`, `delivered`, `cancelled` |
| `SellRequestStatus` | `booked`, `evaluator_assigned`, `evaluating`, `offer_ready`, `sold`, `declined`, `expired`, `cancelled` |
| `BulkQuoteStatus` | `submitted`, `document_check`, `desk_pricing`, `assay_confirmation`, `offer_ready`, `sold`, `declined` |
| `OfferStatus` | `open`, `accepted`, `declined`, `expired`, `withdrawn` |
| `AuctionStatus` | `upcoming`, `live`, `ended` |
| `AuctionOutcome` | `won`, `lost`, `reserve_not_met` |
| `BidStatus` | `leading`, `outbid`, `won`, `lost` |
| `PayoutStatus` | `processing`, `paid`, `failed`, `reversed` |
| `PayoutAccountKind` | `bank`, `wise` |
| `DocumentStatus` | `verified`, `expiring`, `in_review`, `expired`, `rejected` |
| `DocumentKind` | `government_id`, `group_registration`, `company_registration`, `export_permit`, `import_permit`, `mining_lease`, `proof_of_address`, `assay_certificate`, `weight_certificate`, `intake_receipt`, `offer_letter`, `sale_agreement`, `payment_advice`, `waybill`, `escrow_receipt`, `consignment_manifest`, `valuation_report` |
| `TicketStatus` | `open`, `agent_replied`, `awaiting_you`, `resolved`, `closed` |
| `TicketTopic` | `evaluation`, `payment`, `documents`, `order`, `other` |
| `LessonState` | `completed`, `up_next`, `not_started` |
| `LearnTrack` | `miner`, `trade` |
| `OtpChannel` | `sms`, `voice`, `whatsapp` |
| `OtpIntent` | `signup`, `login` |
| `NotificationKind` | see #86 |
| `StepState` | `done`, `active`, `pending` |

**Forward compatibility.** The client must not crash on an unrecognised enum member. For status-like
enums it falls back to the accompanying `statusLabel` and a neutral `tone`; for `tone` it falls back to
`info`. New members may therefore be added within `/v1`.

---

## 12. Rate limits

| Scope | Limit | Window | Code |
|---|---|---|---|
| `POST /auth/otp/request` per phone | 3 | 15 min | `auth/otp-rate-limited` |
| `POST /auth/otp/request` per IP | 20 | 15 min | `auth/otp-rate-limited` |
| `POST /auth/otp/verify` per challenge | 5 | per challenge | `auth/otp-attempts-exceeded` |
| `X-Transaction-Pin` failures per account | 5 | 30 min | `auth/pin-locked` |
| `POST /auctions/{id}/bids` per account per lot | 30 | 1 min | `429` |
| `POST /payouts/withdrawals` per account | 5 | 1 day | `payout/daily-limit-exceeded` |
| Authenticated reads per account | 600 | 1 min | `429` |
| Unauthenticated reads per IP | 120 | 1 min | `429` |
| Uploads per account | 60 | 1 hour | `429` |

`429` responses carry `Retry-After` in seconds. The client backs off and surfaces the server's `message`.

---

## 13. Push notifications and app config

### 13.1 Push payload

Pushes carry data only, so the client renders them consistently with the in-app feed:

```json
{
  "notification": { "title": "You have been outbid on Cobalt Hydroxide",
                    "body": "New highest bid $49,600 · 2h 14m left" },
  "data": {
    "id": "ntf_01H…",
    "kind": "auction_outbid",
    "target": "{\"kind\":\"auction\",\"id\":\"auc_01H…\"}",
    "deepLink": "mineralbridge://aDetail?auctionId=auc_01H…",
    "unreadCount": "3"
  }
}
```

`deepLink` uses the scheme the client already registers (`src/navigation/linking.ts`), and the screen ids
are the same ones `SCREEN_IDS` defines. A deep link replaces the navigation history, so the back button
returns to that screen's tab home.

Pushes are gated by the user's `alerts` preferences (#17): `bids` → `auction_*`, `orders` → `order_*` and
`sell_*`, `lots` → new matching supply, `marketing` → product news. Transactional notifications
(`kyc_*`, `payout_paid`, `support_reply`) are always sent.

### 13.2 `GET /config/app`

Not counted in the 106 — platform infrastructure, called once at launch, unauthenticated.

```json
{
  "minimumSupportedVersion": "2.2.0",
  "latestVersion": "2.4.0",
  "updateRequired": false,
  "maintenance": { "active": false, "message": null, "until": null },
  "features": { "auctions": true, "bulkSell": true, "liveChat": true, "biometricUnlock": true },
  "support": { "phone": "+2347006463725", "email": "help@mineralbridge.co" }
}
```

`updateRequired: true` blocks the app behind an update prompt. `maintenance.active: true` shows the
maintenance screen; while it is set, every other endpoint may return `503`.

---

## 14. Client integration

### 14.1 Replacement `ENDPOINTS` map

`src/api/config.ts` currently declares 44 keys across 32 distinct path templates. Below is the full map
for all 106 endpoints plus the three sockets. Shape and style follow the existing file, so it is a
drop-in replacement. Some keys deliberately share a path template where one path serves two methods
(`orders.list` / `orders.create`, `auctions.bids` / `auctions.placeBid`,
`documents.detail` / `.replace` / `.remove`), so the call site reads as the action it performs.

```ts
export const ENDPOINTS = {
  auth: {
    requestOtp: '/auth/otp/request',
    verifyOtp: '/auth/otp/verify',
    resendOtp: '/auth/otp/resend',
    alternateChannel: '/auth/otp/alternate-channel',
    refresh: '/auth/token/refresh',
    signOut: '/auth/sign-out',
    deleteAccount: '/auth/account',
    sessions: '/auth/sessions',
    session: (id: string) => `/auth/sessions/${id}`,
    pin: '/auth/pin',
  },
  account: {
    profile: '/me',
    avatar: '/me/avatar',
    stats: '/me/stats',
    tier: '/me/tier',
    preferences: '/me/preferences',
    addresses: '/me/addresses',
    address: (id: string) => `/me/addresses/${id}`,
  },
  kyc: {
    status: '/kyc/status',
    idTypes: '/kyc/id-types',
    uploadDocument: '/kyc/documents',
    submit: '/kyc/submissions',
    submission: (id: string) => `/kyc/submissions/${id}`,
    notifyMe: '/kyc/notify-me',
  },
  catalog: {
    categories: '/catalog/categories',
    types: (category: string) => `/catalog/categories/${category}/types`,
    products: (type: string) => `/catalog/types/${type}/products`,
    product: (id: string) => `/catalog/products/${id}`,
    productMedia: (id: string) => `/catalog/products/${id}/media`,
    search: '/catalog/search',
    filters: '/catalog/filters',
  },
  cart: {
    get: '/cart',
    items: '/cart/items',
    item: (id: string) => `/cart/items/${id}`,
    quote: '/cart/quote',
  },
  orders: {
    priceRequirement: '/orders/requirements/price',
    create: '/orders',
    list: '/orders',
    detail: (id: string) => `/orders/${id}`,
    tracking: (id: string) => `/orders/${id}/tracking`,
    documents: (id: string) => `/orders/${id}/documents`,
    confirmDelivery: (id: string) => `/orders/${id}/confirm-delivery`,
  },
  sell: {
    mineralTypes: '/sell/mineral-types',
    media: '/sell/media',
    estimate: '/sell/estimates',
    slots: '/sell/evaluation-slots',
    requests: '/sell/requests',
    request: (id: string) => `/sell/requests/${id}`,
    timeline: (id: string) => `/sell/requests/${id}/timeline`,
    documents: (id: string) => `/sell/requests/${id}/documents`,
    offer: (id: string) => `/sell/requests/${id}/offer`,
    acceptOffer: (id: string) => `/sell/requests/${id}/offer/accept`,
    declineOffer: (id: string) => `/sell/requests/${id}/offer/decline`,
    reviewOffer: (id: string) => `/sell/requests/${id}/offer/review`,
    bulkQuote: '/sell/bulk-quotes',
    bulkValuation: (id: string) => `/sell/bulk-quotes/${id}/valuation`,
  },
  auctions: {
    list: '/auctions',
    detail: (id: string) => `/auctions/${id}`,
    bids: (id: string) => `/auctions/${id}/bids`,
    placeBid: (id: string) => `/auctions/${id}/bids`,
    result: (id: string) => `/auctions/${id}/result`,
    watch: (id: string) => `/auctions/${id}/watch`,
    myBids: '/me/bids',
  },
  learn: {
    tracks: '/learn/tracks',
    section: (id: string) => `/learn/sections/${id}`,
    lesson: (id: string) => `/learn/lessons/${id}`,
    progress: (id: string) => `/learn/lessons/${id}/progress`,
    complete: (id: string) => `/learn/lessons/${id}/complete`,
  },
  payouts: {
    balance: '/payouts/balance',
    accounts: '/payouts/accounts',
    account: (id: string) => `/payouts/accounts/${id}`,
    setDefaultAccount: (id: string) => `/payouts/accounts/${id}/default`,
    withdraw: '/payouts/withdrawals',
    history: '/payouts/history',
  },
  documents: {
    list: '/documents',
    create: '/documents',
    detail: (id: string) => `/documents/${id}`,
    replace: (id: string) => `/documents/${id}`,
    remove: (id: string) => `/documents/${id}`,
  },
  notifications: {
    list: '/notifications',
    markAllRead: '/notifications/read',
    markRead: (id: string) => `/notifications/${id}/read`,
    devices: '/notifications/devices',
    device: (token: string) => `/notifications/devices/${token}`,
  },
  support: {
    channels: '/support/channels',
    faqs: '/support/faqs',
    tickets: '/support/tickets',
    ticket: (id: string) => `/support/tickets/${id}`,
    ticketMessages: (id: string) => `/support/tickets/${id}/messages`,
    resolveTicket: (id: string) => `/support/tickets/${id}/resolve`,
    attachments: '/support/attachments',
    chatSessions: '/support/chat/sessions',
    chatMessages: (id: string) => `/support/chat/sessions/${id}/messages`,
    endChat: (id: string) => `/support/chat/sessions/${id}/end`,
    contactRequests: '/support/contact-requests',
  },
  content: {
    intro: '/content/intro',
    accountTiers: '/content/account-tiers',
    rates: '/reference/rates',
    appConfig: '/config/app',
  },
  ws: {
    auction: (id: string) => `/ws/auctions/${id}`,
    sellRequest: (id: string) => `/ws/sell-requests/${id}`,
    chat: (id: string) => `/ws/support/chat/${id}`,
  },
} as const;
```

### 14.2 What the client already handles

The existing `apiRequest` wrapper (`src/api/index.ts`) needs no structural change to consume this contract.
It already does the right thing with:

- the error body shapes in §4.1, including the `{ errors: { field: [msg] } }` variant;
- `204` / `205` / `304` and empty bodies;
- a caller `AbortSignal` composed with the configured timeout;
- distinguishing a caller's cancellation from a timeout from a network failure;
- `ApiError` carrying `status`, `code` and `fields`, which is what screens need to branch on.

### 14.3 What the client needs added

| Need | Where | Why |
|---|---|---|
| `Authorization` header injection | `apiRequest` | No token handling exists yet |
| Refresh-on-`401` with single retry and request queueing | `apiRequest` | §3.2 |
| `Idempotency-Key` generation | `apiRequest`, for the §6.1 methods | Retry safety |
| `X-Client`, `X-Platform`, `X-Device-Id`, `X-Request-Id`, `Accept-Language` | `apiRequest` | §2.2 |
| Multipart support | New `apiUpload` | `Content-Type` must not be forced to JSON |
| Secure token storage | New `src/lib/auth/tokenStore.ts` | Keychain / Keystore |
| Per-call timeout overrides | Call sites | §2.9 |
| WebSocket client with backoff and REST fallback | New `src/lib/realtime/` | §8 |
| Replace locally computed money | `useEstimate`, `CartScreen`, `ReviewRequestScreen`, `WithdrawScreen`, `AuctionDetailScreen` | Prices are commercial commitments; §9.7 |
| Replace hard-coded content | `catalog.ts`, `IntroTopics`, `SupportScreen`, `PayoutScreens`, `NotificationsScreen` | Copy, rates, contact details and compliance text are all server-owned |
| Server-driven routing targets | `SELL_REQUESTS[].dest`, notification taps | `action` / `target` replace client switches |

### 14.4 Migration sequence

Each phase leaves the app shippable, with unmigrated screens still on bundled data.

| Phase | Scope | Endpoints |
|---|---|---|
| 1 | Auth, token storage, refresh, profile bootstrap | 1–7, 11, 17, 104–106, `/config/app` |
| 2 | KYC and the trading gate | 22–27 |
| 3 | Catalog browsing (works for guests) | 28–34 |
| 4 | Buy flow: cart, requirement, order, tracking | 35–46 |
| 5 | Sell flow, standard and bulk | 47–61, W2 |
| 6 | Auctions and realtime bidding | 62–68, W1 |
| 7 | Payouts, documents, notifications, push | 74–90 |
| 8 | Support, tickets, live chat | 91–103, W3 |
| 9 | Learn, preferences, sessions, remaining account surface | 8–10, 12–16, 18–21, 69–73 |

---

## 15. Open questions for the backend team

These are decisions the client cannot make alone. Each one blocks or reshapes part of the contract above.

1. **Pricing authority.** The app currently computes the estimate band, offer, cart handling fee and
   indicative totals locally from constants. This contract moves all of it server-side (#40, #49, #58, #39).
   Confirm the pricing service can answer inside the 20 s budget, and who owns the refining-deduction
   parameter.
2. **Reference-rate freshness.** `sEstimate` promises "Rate updated 4 minutes ago". What is the real
   refresh interval, and should an estimate be refused when the rate is stale beyond some threshold?
3. **Estimate validity.** §9.7 proposes `expiresAt` on an estimate. Does one exist commercially, and may a
   booking be made against an expired estimate?
4. **Offer expiry under review.** #61 pauses the 48-hour clock while a review is open. Confirm that is the
   intended behaviour rather than a hard 48 hours from issue.
5. **Partial order fulfilment.** Can a buy requirement be partially filled from the vault with the balance
   sourced within 14 days, and if so does that become one order or two?
6. **Cart and order relationship.** Does checking out a multi-line cart create one order or one per line?
   `bDone` shows a single order reference, which implies one.
7. **Guest cart.** Should an anonymous cart exist and merge on sign-in, or is #35–#39 authenticated-only as
   specified? The client's gate on `bDetail` currently implies the latter.
8. **Auction anti-sniping.** Does the close time extend on a late bid? §9.8 assumes a 2-minute extension
   within the last 2 minutes; the client's countdown needs to know.
9. **Bidder identity.** May a bidder's trading name be shown ("Aurora Refining"), or must all bidders be
   pseudonymous ("Bidder #4417")? The design shows both.
10. **Bid deposits.** Are bids backed by a deposit or hold? Nothing in the app collects one, yet bids are
    described as binding.
11. **Payout account creation.** #76 is specified but the app has no form for it. Is adding an account a
    mobile flow, a support-desk action, or web-only?
12. **PIN enrolment.** Where in the funnel is the transaction PIN first set? `settings` offers "Change PIN",
    which presumes one exists; the signup flow never creates one.
13. **Multi-currency.** The currency preference offers USD, NGN, EUR and GBP. Is that display-only
    conversion, or are orders and payouts actually denominated in the selected currency?
14. **Localisation scope.** Five languages are offered. Does that cover desk-authored timeline copy and
    document names, or only static UI strings? It determines whether `display` fields are localised.
15. **Document expiry enforcement.** Does an expired export permit block a Tier 3 bulk submission outright,
    or only warn? `docs` warns at 21 days; `iStep2` does not say.
16. **Evaluator contact.** Does "Call Emeka Balogun" place a real call to a masked number, or raise a
    callback? #103 assumes a callback; the toast says "Calling Emeka Balogun…".
17. **Chat outside desk hours.** #99 returns `503` when the desk is closed. Should it instead queue an
    offline message?
18. **KYC re-submission.** After a rejection, is a fresh submission allowed immediately, and how many
    attempts before manual review?
19. **Tier downgrade.** May an account move from Tier 3 to Tier 1, and what happens to in-flight bulk
    consignments?
20. **Data retention on deletion.** `DELETE /auth/account` promises listings, bids and documents are removed
    permanently. Reconcile that with the regulatory retention a KYC'd marketplace is likely required to
    observe — the copy may need changing, not just the endpoint.
