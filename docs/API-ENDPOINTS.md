# Mineral Bridge Mobile — API Endpoint List

**Document version:** 1.0
**Date:** 16 October 2026
**Derived from:** `mineralbridge-mobile-app` — 59 screens, 7 bottom sheets, 4 tabs, 2 overlays (toast, outbid banner), analysed screen by screen.
**Companion:** [API-CONTRACT.md](API-CONTRACT.md) — schemas, payloads, errors, status codes.

---

## 1. Totals

| | Count |
|---|---|
| **REST endpoints (total)** | **106** |
| &nbsp;&nbsp;↳ `GET` (reads) | 51 |
| &nbsp;&nbsp;↳ `POST` (creates / actions) | 39 |
| &nbsp;&nbsp;↳ `PUT` (replaces) | 6 |
| &nbsp;&nbsp;↳ `DELETE` (removes) | 6 |
| &nbsp;&nbsp;↳ `PATCH` (partial updates) | 4 |
| **WebSocket channels** | **3** |
| **Functional domains** | **14** |
| **Screens served** | 59 |
| **Endpoints requiring a KYC-verified account** | 23 |
| **Endpoints callable without a token** | 24 (5 pre-auth + 19 guest-readable) |

### Endpoints per domain

| # | Domain | Endpoints | Primary screens |
|---|---|---|---|
| 1 | Authentication & Session | 10 | `splash` `welcome` `signupPhone` `login` `otp` `verifying` `authDone` `settings` |
| 2 | Account & Profile | 11 | `profile` `editProfile` `tier` `settings` |
| 3 | KYC / Identity | 6 | `kycStart` `kycId` `kycDoc` `kycSelfie` `kycReview` `kycPending` |
| 4 | Catalog (Buy) | 7 | `bHome` `bTypes` `bProducts` `bDetail` + filter sheet |
| 5 | Cart | 5 | `cart` `bDetail` |
| 6 | Orders (Buy-side) | 7 | `bQty` `bDeliv` `bReview` `bDone` `orders` `track` |
| 7 | Sell (Standard + Bulk) | 15 | `sPick` `qList` `sEstimate` `qPickup` `qReview` `qDone` `sEval` `sOffer` `sPaid` `iStep1` `iStep2` `iReview` `iDone` `sTrack` |
| 8 | Auctions | 7 | `aList` `aDetail` `aWon` `aLost` + bid sheet + outbid banner |
| 9 | Learning Center | 5 | `lHome` `lList` `lPlayer` |
| 10 | Payouts | 7 | `payout` `withdraw` |
| 11 | Documents | 5 | `docs` `docDetail` `iStep2` |
| 12 | Notifications | 5 | `notifs` `bHome` `profile` |
| 13 | Support | 12 | `support` `ticket` `newTicket` `chat` + help sheet |
| 14 | Reference & Content | 4 | `intro` `tier` `sEstimate` `splash` |
| | **Total** | **106** | |

**Legend used in the tables below**

| Mark | Meaning |
|---|---|
| **Auth** `—` | No token required (guest browsing) |
| **Auth** `✔` | Bearer access token required |
| **KYC** `✔` | Rejected with `403 kyc/not-verified` unless `kyc.status = "verified"` |
| **Tier** | Only reachable by, or required for, the listed account tier |

---

## 2. Domain 1 — Authentication & Session (10)

| # | Method | Path | Purpose | Screen | Auth | KYC |
|---|---|---|---|---|---|---|
| 1 | `POST` | `/auth/otp/request` | Send a 6-digit SMS code to a number; `intent` is `signup` or `login` | `signupPhone`, `login` | — | — |
| 2 | `POST` | `/auth/otp/verify` | Exchange phone + code for an access/refresh token pair | `otp` → `verifying` | — | — |
| 3 | `POST` | `/auth/otp/resend` | Re-issue the code; resets the 42-second expiry counter | `otp` | — | — |
| 4 | `POST` | `/auth/otp/alternate-channel` | Deliver the code by voice call or WhatsApp instead of SMS | Help sheet | — | — |
| 5 | `POST` | `/auth/token/refresh` | Rotate an expired access token | App-wide interceptor | — | — |
| 6 | `POST` | `/auth/sign-out` | Revoke the current device session | `settings` → logout sheet | ✔ | — |
| 7 | `DELETE` | `/auth/account` | Permanently delete the account | `settings` → delete sheet | ✔ | — |
| 8 | `GET` | `/auth/sessions` | List signed-in devices ("2 devices signed in") | `settings` | ✔ | — |
| 9 | `DELETE` | `/auth/sessions/{sessionId}` | Revoke one other device session | `settings` | ✔ | — |
| 10 | `PUT` | `/auth/pin` | Set or change the transaction PIN used for payouts and bids | `settings` | ✔ | — |

---

## 3. Domain 2 — Account & Profile (11)

| # | Method | Path | Purpose | Screen | Auth | KYC |
|---|---|---|---|---|---|---|
| 11 | `GET` | `/me` | Full profile: name, phone, email, business, tier, KYC state, avatar | `profile`, `editProfile`, bootstrap | ✔ | — |
| 12 | `PATCH` | `/me` | Update editable fields (name, email, business name, registration number) | `editProfile` | ✔ | — |
| 13 | `PUT` | `/me/avatar` | Upload a new profile photo (multipart) | `editProfile` | ✔ | — |
| 14 | `GET` | `/me/stats` | Profile hero counters: sell requests, total sales, active bids | `profile` | ✔ | — |
| 15 | `GET` | `/me/tier` | Current account tier and its paperwork rules | `tier`, `profile` | ✔ | — |
| 16 | `PUT` | `/me/tier` | Change the account tier (Tier 1 / 2 / 3) | `tier`, `sPick` | ✔ | — |
| 17 | `GET` | `/me/preferences` | Language, currency, units, alert toggles, biometric flag | `settings` | ✔ | — |
| 18 | `PATCH` | `/me/preferences` | Update any subset of the above | `settings`, picker sheet | ✔ | — |
| 19 | `GET` | `/me/addresses` | Saved pickup location and delivery facility | `qPickup`, `bDeliv`, `editProfile` | ✔ | — |
| 20 | `POST` | `/me/addresses` | Add a pickup or delivery address | `editProfile` | ✔ | — |
| 21 | `PATCH` | `/me/addresses/{addressId}` | Edit a saved address | `qPickup`, `editProfile` | ✔ | — |

---

## 4. Domain 3 — KYC / Identity (6)

| # | Method | Path | Purpose | Screen | Auth | KYC |
|---|---|---|---|---|---|---|
| 22 | `GET` | `/kyc/status` | State (`none` / `pending` / `verified` / `rejected`), reference, progress steps | `kycPending`, `bHome` nudge, `profile` | ✔ | — |
| 23 | `GET` | `/kyc/id-types` | Accepted ID types with hints and number formats (NIN, Passport, Licence, PVC) | `kycId` | ✔ | — |
| 24 | `POST` | `/kyc/documents` | Upload one capture: `id_front`, `id_back`, `selfie` (multipart) | `kycDoc`, `kycSelfie` | ✔ | — |
| 25 | `POST` | `/kyc/submissions` | Submit the completed check with the consent flag | `kycReview` → `kycPending` | ✔ | — |
| 26 | `GET` | `/kyc/submissions/{submissionId}` | Poll one submission's verification timeline | `kycPending` | ✔ | — |
| 27 | `POST` | `/kyc/notify-me` | Ask to be pushed when approval lands | `kycPending` | ✔ | — |

---

## 5. Domain 4 — Catalog / Buy-side browsing (7)

| # | Method | Path | Purpose | Screen | Auth | KYC |
|---|---|---|---|---|---|---|
| 28 | `GET` | `/catalog/categories` | The 4 categories with live-lot counts and imagery | `bHome` | — | — |
| 29 | `GET` | `/catalog/categories/{categorySlug}/types` | Mineral types inside a category (Gold, Platinum, Silver, Palladium) | `bTypes` | — | — |
| 30 | `GET` | `/catalog/types/{typeSlug}/products` | Paged product grid with price-per-gram and availability | `bProducts` | — | — |
| 31 | `GET` | `/catalog/products/{productId}` | Detail: specs, purity, origin, compliance assertions, assurance badges | `bDetail` | — | — |
| 32 | `GET` | `/catalog/products/{productId}/media` | Ordered image gallery (the "1 / 4" counter) | `bDetail` | — | — |
| 33 | `GET` | `/catalog/search` | Free-text search across categories, types and products | `bHome`, `bProducts` | — | — |
| 34 | `GET` | `/catalog/filters` | Facet definitions and result counts for the filter sheet | Filter sheet | — | — |

---

## 6. Domain 5 — Cart (5)

| # | Method | Path | Purpose | Screen | Auth | KYC |
|---|---|---|---|---|---|---|
| 35 | `GET` | `/cart` | Current cart lines plus computed totals | `cart` | ✔ | — |
| 36 | `POST` | `/cart/items` | "Add to Cart" from the product screen | `bDetail` | ✔ | ✔ |
| 37 | `PATCH` | `/cart/items/{itemId}` | Change a line quantity (5 kg steps) | `cart` | ✔ | ✔ |
| 38 | `DELETE` | `/cart/items/{itemId}` | Remove a line | `cart` | ✔ | ✔ |
| 39 | `POST` | `/cart/quote` | Recompute subtotal, assay & handling (1.8%), transport placeholder | `cart` | ✔ | ✔ |

---

## 7. Domain 6 — Orders / Buy-side fulfilment (7)

| # | Method | Path | Purpose | Screen | Auth | KYC |
|---|---|---|---|---|---|---|
| 40 | `POST` | `/orders/requirements/price` | Indicative total for a quantity + unit before submitting | `bQty`, `bReview` | ✔ | ✔ |
| 41 | `POST` | `/orders` | Submit the buying requirement (product, qty, delivery, permit, needed-by) | `bReview` → `bDone` | ✔ | ✔ |
| 42 | `GET` | `/orders` | Order list filtered by `tab=active｜completed` with stage progress | `orders` | ✔ | — |
| 43 | `GET` | `/orders/{orderId}` | One order: product, escrow value, status, ETA | `track` | ✔ | — |
| 44 | `GET` | `/orders/{orderId}/tracking` | Stage timeline plus the live route position | `track` | ✔ | — |
| 45 | `GET` | `/orders/{orderId}/documents` | Assay certificate, waybill and seal photos, escrow receipt | `track` | ✔ | — |
| 46 | `POST` | `/orders/{orderId}/confirm-delivery` | Confirm seal and assay, releasing escrow | `track` | ✔ | ✔ |

> "Contact the desk" on `track` is served by **#103** (`/support/contact-requests`) rather than a per-order
> path, because `track`, `sTrack` and `sEval` all raise the identical callback action.

---

## 8. Domain 7 — Sell to Mineral Bridge (15)

Covers the Tier 1/2 standard flow (`sPick → qList → sEstimate → qPickup → qReview → qDone → sEval → sOffer → sPaid`)
and the Tier 3 bulk consignment flow (`sPick → iStep1 → iStep2 → iReview → iDone`).

| # | Method | Path | Purpose | Screen | Auth | KYC | Tier |
|---|---|---|---|---|---|---|---|
| 47 | `GET` | `/sell/mineral-types` | Sellable forms (Gold Dust, Concentrate, Grain/Shot, Doré, Biscuit, Bullion) | `sPick` | — | — | all |
| 48 | `POST` | `/sell/media` | Upload a lot photo, returns a `mediaId` (multipart) | `qList`, `iStep1` | ✔ | — | all |
| 49 | `POST` | `/sell/estimates` | Instant estimate band + midpoint from type, quantity, unit, photos | `qList` → `sEstimate` | ✔ | ✔ | 1, 2 |
| 50 | `GET` | `/sell/evaluation-slots` | Bookable days and time slots, with taken slots marked | `qPickup` | ✔ | ✔ | 1, 2 |
| 51 | `POST` | `/sell/requests` | Book the free on-site evaluation | `qReview` → `qDone` | ✔ | ✔ | 1, 2 |
| 52 | `POST` | `/sell/bulk-quotes` | Submit a bulk consignment for desk pricing | `iReview` → `iDone` | ✔ | ✔ | 3 |
| 53 | `GET` | `/sell/bulk-quotes/{quoteId}/valuation` | Indicative valuation band for the consignment | `iReview` | ✔ | ✔ | 3 |
| 54 | `GET` | `/sell/requests` | All sell requests and bulk quotes for the "Selling" tab | `orders` | ✔ | — | all |
| 55 | `GET` | `/sell/requests/{requestId}` | One request: lot, status, progress, ETA, assigned evaluator | `sTrack`, `sEval` | ✔ | — | all |
| 56 | `GET` | `/sell/requests/{requestId}/timeline` | Stage history (submitted → estimate → evaluator → assay → offer → paid) | `sTrack`, `sEval` | ✔ | — | all |
| 57 | `GET` | `/sell/requests/{requestId}/documents` | Intake receipt, weight and assay certificates, offer letter | `sTrack`, `sPaid` | ✔ | — | all |
| 58 | `GET` | `/sell/requests/{requestId}/offer` | The firm offer: assayed weight, confirmed purity, amount, 48-hour expiry | `sOffer` | ✔ | — | all |
| 59 | `POST` | `/sell/requests/{requestId}/offer/accept` | Accept — transfers title and schedules payment | `sOffer` → `sPaid` | ✔ | ✔ | all |
| 60 | `POST` | `/sell/requests/{requestId}/offer/decline` | Decline — the lot stays with the seller | `sOffer` | ✔ | ✔ | all |
| 61 | `POST` | `/sell/requests/{requestId}/offer/review` | "Offer seems low? Request a review" — raises a desk callback | `sOffer` | ✔ | ✔ | all |

---

## 9. Domain 8 — Auctions (7)

| # | Method | Path | Purpose | Screen | Auth | KYC |
|---|---|---|---|---|---|---|
| 62 | `GET` | `/auctions` | Lots by `status=live｜upcoming｜ended`, with tab counts and countdowns | `aList` | — | — |
| 63 | `GET` | `/auctions/{auctionId}` | Lot detail, reserve state, current highest bid, time remaining | `aDetail` | — | — |
| 64 | `GET` | `/auctions/{auctionId}/bids` | Paged bid history, leading bid flagged | `aDetail` | — | — |
| 65 | `POST` | `/auctions/{auctionId}/bids` | Place a binding bid (minimum $200 increment) | Bid sheet | ✔ | ✔ |
| 66 | `GET` | `/auctions/{auctionId}/result` | Outcome after close: won / lost, winning amount, your last bid | `aWon`, `aLost` | ✔ | — |
| 67 | `GET` | `/me/bids` | The account's active, won and lost bids | `profile`, `aList` | ✔ | — |
| 68 | `POST` | `/auctions/{auctionId}/watch` | "Notify me next time" on a similar lot opening | `aLost` | ✔ | — |

---

## 10. Domain 9 — Learning Center (5)

| # | Method | Path | Purpose | Screen | Auth | KYC |
|---|---|---|---|---|---|---|
| 69 | `GET` | `/learn/tracks` | The two tracks (`miner`, `trade`), their sections and per-track tallies | `lHome` | — | — |
| 70 | `GET` | `/learn/sections/{sectionId}` | One section's lessons with blurb and completion count | `lList` | — | — |
| 71 | `GET` | `/learn/lessons/{lessonId}` | Lesson detail: media URL, duration, description, chapter marks | `lPlayer` | — | — |
| 72 | `PUT` | `/learn/lessons/{lessonId}/progress` | Persist playback position and current chapter | `lPlayer` | ✔ | — |
| 73 | `POST` | `/learn/lessons/{lessonId}/complete` | "Mark as complete" | `lPlayer` → `lList` | ✔ | — |

---

## 11. Domain 10 — Payouts (7)

| # | Method | Path | Purpose | Screen | Auth | KYC |
|---|---|---|---|---|---|---|
| 74 | `GET` | `/payouts/balance` | Available balance and the amount still held in escrow | `payout`, `withdraw`, `profile` | ✔ | ✔ |
| 75 | `GET` | `/payouts/accounts` | Payout destinations, default flagged | `payout`, `withdraw`, `qReview` | ✔ | ✔ |
| 76 | `POST` | `/payouts/accounts` | Add a bank or Wise account | `payout` | ✔ | ✔ |
| 77 | `PUT` | `/payouts/accounts/{accountId}/default` | Make an account the default destination | `payout` | ✔ | ✔ |
| 78 | `DELETE` | `/payouts/accounts/{accountId}` | Remove a payout account | `payout` | ✔ | ✔ |
| 79 | `POST` | `/payouts/withdrawals` | Withdraw an amount to a chosen account (PIN-confirmed) | `withdraw` → `payout` | ✔ | ✔ |
| 80 | `GET` | `/payouts/history` | Completed and in-flight payouts | `payout` | ✔ | ✔ |

---

## 12. Domain 11 — Documents (5)

| # | Method | Path | Purpose | Screen | Auth | KYC |
|---|---|---|---|---|---|---|
| 81 | `GET` | `/documents` | Documents on file with status pills and expiry warnings | `docs` | ✔ | — |
| 82 | `GET` | `/documents/{documentId}` | One document: preview URL and metadata rows | `docDetail` | ✔ | — |
| 83 | `POST` | `/documents` | Upload a permit, lease, utility bill or proof of address (≤ 10 MB) | `docs`, `iStep2` | ✔ | — |
| 84 | `PUT` | `/documents/{documentId}` | "Replace this document" | `docDetail` | ✔ | — |
| 85 | `DELETE` | `/documents/{documentId}` | Remove a document | `docDetail` | ✔ | — |

---

## 13. Domain 12 — Notifications (5)

| # | Method | Path | Purpose | Screen | Auth | KYC |
|---|---|---|---|---|---|---|
| 86 | `GET` | `/notifications` | Paged feed with unread count and per-type icons | `notifs` | ✔ | — |
| 87 | `POST` | `/notifications/read` | "Mark all read" | `notifs` | ✔ | — |
| 88 | `POST` | `/notifications/{notificationId}/read` | Mark one read when it is opened | `notifs` | ✔ | — |
| 89 | `POST` | `/notifications/devices` | Register an FCM/APNs push token | App bootstrap | ✔ | — |
| 90 | `DELETE` | `/notifications/devices/{token}` | Unregister on sign-out | Logout sheet | ✔ | — |

---

## 14. Domain 13 — Support (12)

| # | Method | Path | Purpose | Screen | Auth | KYC |
|---|---|---|---|---|---|---|
| 91 | `GET` | `/support/channels` | Desk hours, phone, email and WhatsApp numbers, current reply time | `support` | — | — |
| 92 | `GET` | `/support/faqs` | FAQ accordion entries | `support` | — | — |
| 93 | `GET` | `/support/tickets` | The account's tickets with status and message counts | `support` | ✔ | — |
| 94 | `POST` | `/support/tickets` | Open a ticket (topic, related request, description, attachments) | `newTicket` → `support` | ✔ | — |
| 95 | `GET` | `/support/tickets/{ticketId}` | One ticket with its full message thread | `ticket` | ✔ | — |
| 96 | `POST` | `/support/tickets/{ticketId}/messages` | Post a reply | `ticket` | ✔ | — |
| 97 | `POST` | `/support/tickets/{ticketId}/resolve` | "Mark as resolved" | `ticket` → `support` | ✔ | — |
| 98 | `POST` | `/support/attachments` | Upload a photo or document for a ticket or chat (multipart) | `newTicket`, `chat` | ✔ | — |
| 99 | `POST` | `/support/chat/sessions` | Open a live chat session, returns the assigned agent | `support` → `chat` | ✔ | — |
| 100 | `GET` | `/support/chat/sessions/{sessionId}/messages` | Transcript backfill and quick-reply suggestions | `chat` | ✔ | — |
| 101 | `POST` | `/support/chat/sessions/{sessionId}/messages` | Send a chat message (HTTP fallback for the socket) | `chat` | ✔ | — |
| 102 | `POST` | `/support/chat/sessions/{sessionId}/end` | End the chat and email the transcript | `chat` → `support` | ✔ | — |

---

## 15. Domain 14 — Reference & Content (4)

| # | Method | Path | Purpose | Screen | Auth | KYC |
|---|---|---|---|---|---|---|
| 103 | `POST` | `/support/contact-requests` | Request a callback from the verification desk or a named evaluator | `track`, `sTrack`, `sEval` | ✔ | — |
| 104 | `GET` | `/content/intro` | "How Mineral Bridge works": explainer video shots, audiences, buy/sell paths, topics | `intro`, `welcome` | — | — |
| 105 | `GET` | `/content/account-tiers` | The three tiers with copy, paperwork hints and badges | `tier`, `sPick`, `editProfile` | — | — |
| 106 | `GET` | `/reference/rates` | Live reference rate per mineral and the "updated N minutes ago" stamp | `sEstimate`, `bDetail`, `iReview` | — | — |

> `GET /config/app` (minimum supported build, feature flags, maintenance banner) is treated as platform
> infrastructure rather than a product endpoint and is **not** counted in the 106. It is specified in
> §13 of the contract document regardless; add it as **#107** if your release process needs a kill switch.

---

## 16. WebSocket channels (3)

Three screens update without user interaction and should not be polled.

| # | Channel | Events | Screen | Auth |
|---|---|---|---|---|
| W1 | `wss://…/ws/auctions/{auctionId}` | `bid.placed`, `auction.extended`, `auction.closed`, `bidder.outbid` | `aDetail`, outbid banner | ✔ |
| W2 | `wss://…/ws/sell-requests/{requestId}` | `stage.advanced`, `evaluator.assigned`, `assay.complete`, `offer.issued` | `sEval`, `sTrack` | ✔ |
| W3 | `wss://…/ws/support/chat/{sessionId}` | `message.received`, `agent.typing`, `agent.joined`, `session.ended` | `chat` | ✔ |

A REST fallback exists for each (#64, #56, #100), so the app degrades to polling where sockets are blocked.

---

## 17. Coverage check — screen to endpoint

Every one of the 59 screens is served. Screens marked *client-only* make no network call of their own and
are satisfied by data fetched upstream.

| Screen | Endpoints |
|---|---|
| `splash` | 104, 106 (bootstrap), 5 (token refresh) |
| `welcome` | *client-only* |
| `signupPhone` / `login` | 1 |
| `otp` | 2, 3, 4 |
| `verifying` | 2 (awaits result) |
| `authDone` | 11 |
| `intro` | 104 |
| `tier` | 15, 16, 105 |
| `kycStart` | 22 |
| `kycId` | 23 |
| `kycDoc` | 24 |
| `kycSelfie` | 24 |
| `kycReview` | 25 |
| `kycPending` | 22, 26, 27 |
| `bHome` | 28, 33, 22, 86 |
| `bTypes` | 29 |
| `bProducts` | 30, 33, 34 |
| `bDetail` | 31, 32, 36, 106 |
| `cart` | 35, 37, 38, 39 |
| `bQty` | 40, 15 |
| `bDeliv` | 19, 21 |
| `bReview` | 40 |
| `bDone` | 41 (response) |
| `orders` | 42, 54 |
| `track` | 43, 44, 45, 46, 103 |
| `sTrack` | 55, 56, 57, 103 |
| `sPick` | 47, 15, 16 |
| `qList` | 48, 49 |
| `sEstimate` | 49 (response), 106 |
| `qPickup` | 19, 50 |
| `qReview` | 50, 75 |
| `qDone` | 51 (response) |
| `sEval` | 55, 56, W2, 103 |
| `sOffer` | 58, 59, 60, 61 |
| `sPaid` | 57, 59 (response) |
| `iStep1` | 47, 48 |
| `iStep2` | 83, 19 |
| `iReview` | 53, 106 |
| `iDone` | 52 (response) |
| `aList` | 62, 67 |
| `aDetail` | 63, 64, 65, W1 |
| `aWon` | 66 |
| `aLost` | 66, 62, 68 |
| `lHome` | 69 |
| `lList` | 70 |
| `lPlayer` | 71, 72, 73 |
| `profile` | 11, 14, 22, 67, 74, 81, 86 |
| `editProfile` | 11, 12, 13, 19, 20, 21 |
| `support` | 91, 92, 93, 99 |
| `ticket` | 95, 96, 97 |
| `newTicket` | 94, 98 |
| `chat` | 99, 100, 101, 102, 98, W3 |
| `notifs` | 86, 87, 88 |
| `payout` | 74, 75, 76, 77, 78, 80 |
| `withdraw` | 74, 75, 79 |
| `docs` | 81, 83 |
| `docDetail` | 82, 84, 85 |
| `settings` | 17, 18, 8, 9, 10, 6, 7 |
| Signin sheet | *client-only* (routes to 1) |
| Picker sheet | 18 |
| Logout / delete sheet | 6, 7, 90 |
| KYC sheet | 22 |
| Help sheet | 4 |
| Bid sheet | 65 |
| Filter sheet | 34, 30 |
| Toast / outbid banner | W1, 86 |

---

## 18. Gap against the current client

`src/api/config.ts` already declares an `ENDPOINTS` map: **44 keys across 32 distinct path templates**,
roughly a third of the surface above. It needs the following additions before the client can drive the
full product.

| Area | Already in `ENDPOINTS` | Missing |
|---|---|---|
| Auth | request, verify, resend, sign-out, delete account | alternate channel, token refresh, sessions list, session revoke, PIN |
| Account | profile, tier, preferences | avatar, stats, addresses (3) |
| KYC | submit, status, uploadDocument | id-types, submission detail, notify-me |
| Catalog | categories, types, products, product | media, search, filters |
| Cart | `orders.cart` only | items (3), quote |
| Orders | list, create, detail, tracking | requirement pricing, documents, confirm-delivery |
| Sell | estimate, requests, request, slots, accept, decline, bulkQuote | mineral-types, media, bulk valuation, timeline, documents, offer read, offer review |
| Auctions | list, detail, bids (read) | place bid, result, my bids, watch |
| Learn | tracks, lesson, progress | sections, complete |
| Payouts | balance, accounts, withdraw, history | add account, set default, delete account |
| Documents | list, detail | upload, replace, delete |
| Notifications | list, markAllRead | mark one, device register, device unregister |
| Support | tickets, ticket, chat | channels, faqs, ticket messages, resolve, attachments, chat sessions (4) |
| Reference | *none* | contact-requests, intro content, account tiers, rates |

See §14 of the contract document for the exact replacement `ENDPOINTS` map.
