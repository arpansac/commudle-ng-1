# Commudle Subscription Flow — Frontend Guide (commudle-ng)

The complete end-user journey from pricing page to community creation, the
checkout billing form, the subscriptions/payment-history UI, the finance
dashboard (admin), and how each piece talks to the Rails API. All payments
are **one-time Razorpay Orders** — there is no recurring Razorpay Subscription
object anywhere in this system.

> Backend counterpart (models, tax/GST, invoice PDF, email triggers, cron
> schedule): `gdgapp/SUBSCRIPTION_FLOW.md`.

## Table of Contents

1. [Data model (frontend types)](#1-data-model-frontend-types)
2. [User journey — pricing to community](#2-user-journey--pricing-to-community)
3. [Checkout page — billing form](#3-checkout-page--billing-form)
4. [Checkout page — payment flow](#4-checkout-page--payment-flow)
5. [Trial flow (card verification)](#5-trial-flow-card-verification)
6. [My Subscriptions page](#6-my-subscriptions-page)
7. [Payment History page](#7-payment-history-page)
8. [Finance dashboard (admin)](#8-finance-dashboard-admin)
9. [Subscription status lifecycle](#9-subscription-status-lifecycle)
10. [Services reference](#10-services-reference)
11. [Where emails show up in the UI](#11-where-emails-show-up-in-the-ui)
12. [Key business rules](#12-key-business-rules)

---

## 1. Data model (frontend types)

```
ProductPrice (libs/shared/models/.../product-price.model.ts)
  ├── product_name, plan_name, original_price, final_price
  ├── currency, billing_cycle ('one_time' | 'monthly' | 'yearly')
  ├── is_subscription_plan, min_quantity, min_subscription_duration_months
  ├── trial_enabled, trial_period_days
  └── can_create_community_group, can_create_kommunity (via metadata)

PurchaseOrder (libs/shared/models/.../purchase-order.model.ts)
  ├── uuid, price, quantity, currency, status ('unpaid'|'paid'|'partial_refund'|'full_refund')
  ├── amount_to_be_paid, discount_amount, tax_amount, tax_name, tax_rate
  ├── invoice_number                      → "CMDLE-SYS/26-27/001"
  ├── invoice_metadata                    → { invoice_status?: 'active'|'cancelled', invoice_cancelled_at?, invoice_cancellation_reason?, invoice_cancelled_by_id? }
  ├── invoice_cancelled_by                → { id, name, email } | null
  ├── notes                               → { subscription_months, tax_breakdown?, prorated_addon?, extra_communities?, user_subscription_id?, renewal_of_subscription_id? }
  ├── contact_info                        → IContactInfo
  ├── discount_code                       → IDiscountCode
  └── razorpay_order                      → IRazorpayOrder

UserSubscription (libs/shared/models/.../user-subscription.model.ts)
  ├── id, status ('pending'|'active'|'cancelled'|'expired'|'payment_failed')
  ├── starts_at, ends_at, cancellation_requested_at?
  ├── komunity_limit?, community_group_limit?
  ├── kommunities_count, community_groups_count, kommunities[], community_groups[]
  ├── product_price → IProductPrice
  └── purchase_order → IPurchaseOrder

ContactInfo (libs/shared/models/.../contact-info.model.ts)
  ├── email, phone_number, country_code
  ├── tax_info: { gst, pan_card }
  └── address: { address, company_name?, pin_code, state?, contact_person_name?, contact_email?, contact_phone? }
```

### Relationship summary

```
User
 └──> PurchaseOrder (one per purchase / renewal / add-on)
        └──> ProductPrice (what was bought)
        └──> ContactInfo (billing details for this PO)
        └──> UserSubscription (created/extended on payment)
                └──> Kommunity[] / CommunityGroup[] (created under this subscription)
```

---

## 2. User journey — pricing to community

### Step 1 — Pricing page (`/pricing`)

`pricing.component.ts` renders plan cards (Startup / Enterprise / etc.) with
a Monthly/Annual toggle. Each CTA calls `createPurchaseOrderForPrice(...)`:

- **"Buy now"** → routes to `/checkout/<uuid>` with no trial intent.
- **"Start N-day free trial"** (shown when `product_price.trial_enabled &&
trial_period_days > 0`) → routes to `/checkout/<uuid>?with_trial=1`.

If the user isn't logged in, they're redirected to `/login` first.

### Step 2 — Checkout page (`/checkout/:purchase_order_uuid`)

Loads the `PurchaseOrder` via `PurchaseOrderService.showPurchaseOrder`. If
already `paid`, redirects to `/checkout/:uuid/complete` (or `/subscriptions`
for subscription plans / prorated add-ons). See [§3](#3-checkout-page--billing-form)
and [§4](#4-checkout-page--payment-flow) for the full breakdown.

### Step 3 — Payment success → `/subscriptions` or `/checkout/:uuid/complete`

- `ProductPrice` subscription purchases (new, renewal, or add-on) and
  successful trial starts → redirect to **`/subscriptions`**.
- Non-subscription purchases (e.g. ad campaigns) → redirect to
  **`/checkout/:uuid/complete`**.

A confetti burst (`ConfettiService.celebrate()`) fires on any successful
`ProductPrice` purchase.

### Step 4 — My Subscriptions page (`/subscriptions`)

See [§6](#6-my-subscriptions-page). User can create communities/orgs under an
active subscription, renew, cancel, or add extra community slots mid-cycle.

### Step 5 — Community/org creation

Standard `CreateCommunityFormComponent` / `CreateCommunityGroupFormComponent`
dialogs, opened with `subscriptionId` in context. Backend enforces quota
(`komunity_limit` / `community_group_limit`) at creation time.

---

## 3. Checkout page — billing form

`checkout-page.component.ts`, `initCheckoutForm()`. All billing fields are
collected on **every** checkout (there's no separate "personal vs business"
toggle anymore — Company Name is just an optional field alongside Full Name).

| Field                           | Control name      | Required        | Notes                                                                                                                       |
| ------------------------------- | ----------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Full Name                       | `name`            | ✓               | Own row, full width. Prefilled from `currentUser.name` if empty.                                                            |
| Company Name                    | `companyName`     | optional        | Own row, full width. If left blank, `address.company_name` falls back to the personal name so invoices never render blank.  |
| Email                           | `email`           | ✓               | Prefilled from `currentUser.email`.                                                                                         |
| Phone                           | `phone`           | ✓               | Prefilled from `currentUser.phone`.                                                                                         |
| Country                         | `country`         | ✓               | Native `<select>`, defaults from `phone_country_code` via `getUserCountryCode()`.                                           |
| State                           | `state`           | ✓ only if India | Native `<select>` populated from `indian_states` (all 28 states + 8 UTs, GSTIN state codes). Hidden entirely for non-India. |
| Address                         | `address`         | ✓               | Textarea. Placeholder: _"Enter company or business address if purchasing for a business"_.                                  |
| Pin/Zip Code                    | `pinCode`         | ✓               | Label switches "Pin Code" (India) / "Zip Code" (elsewhere).                                                                 |
| "Are you registered for GSTIN?" | `isGstRegistered` | —               | Checkbox, **India only**. Reveals the GSTIN input.                                                                          |
| GSTIN                           | `gst`             | optional        | Only sent to the backend when `isIndiaSelected && isGstRegistered`.                                                         |

Layout: fields are grouped into `.form-row` (CSS grid, 2 columns on `≥sm`,
1 column on mobile) for related pairs — **Email | Phone** and
**Country | State (or Zip on non-India)** — while Full Name, Company Name,
and Address each get their own full-width row. This keeps the form
significantly shorter than the old single-column layout.

### Prefill logic — `prefillContactForm(contactInfo)`

Runs when the PO already has a saved `ContactInfo` (e.g. user navigated back
to checkout). Backwards-compat handling:

```typescript
const personName =
  contactInfo.address?.contact_person_name || contactInfo.address?.company_name || currentUser?.name || '';
// Only prefill Company Name if it's clearly distinct from the personal name —
// older records stored the personal name in company_name when there was no
// separate field, so avoid showing the user's own name twice.
const savedCompanyName = contactInfo.address?.company_name || '';
const companyName = savedCompanyName && savedCompanyName !== personName ? savedCompanyName : '';
```

`email`/`phone_number` are read from the **top-level** `ContactInfo` columns
first (canonical location), falling back to legacy
`address.contact_email`/`address.contact_phone` for old records, then to the
current user's profile.

### Payload — `buildContactInfoPayload()`

```typescript
{
  country_code: string,
  email: string,
  phone_number: string,
  tax_info: { gst: string, pan_card: '' },   // gst only if isIndia && isGstRegistered
  address: {
    address: string,
    company_name: companyNameRaw || name,     // company name, or personal name as fallback
    pin_code: string,
    state: isIndia ? state : '',
    contact_person_name: name,                // always the buyer's full name
  },
}
```

Sent via `PurchaseOrderService.createContactInfo(uuid, payload)` →
`POST /api/v2/purchase_orders/create_contact_info`.

### State/country driving tax recalculation

Both the `country` and `state` form controls have `valueChanges` listeners
that call `refreshOrderTotals()`, which calls `updatePurchaseOrder()` →
`PurchaseOrderService.updatePurchaseOrder(uuid, { quantity, subscription_months, discount_code, country_code, state })`
→ `PUT /api/v2/purchase_orders`. The backend recomputes `tax_amount` and
`tax_breakdown` (CGST+SGST vs IGST — see backend §10) and returns the updated
PO, so the displayed total always matches what Razorpay will actually charge.
**Only a single aggregate "Tax" row is shown on checkout** — the CGST/SGST/IGST
split is invoice-PDF-only.

---

## 4. Checkout page — payment flow

### Regular purchase (`Pay()`)

```
Pay()
  │  validates contactInfoForm + minQuantity
  ▼
proceedWithPayment()
  │  if contact_info already saved → createRazorpayOrder(poId)
  │  else → createOrUpdateContactInfo() → createRazorpayOrder(poId)
  ▼
createRazorpayOrder(poId)
  │  amount = round(totalPrice * 100)
  │  if amount === 0 → handleFullDiscount()  [100%-discount codes]
  │  else → RazorpayService.createOrFindOrder({subscription_months}, {po_id})
  ▼
razorPaySubmit(order)
  │  opens Razorpay Checkout modal with order.rzp_order_id
  │  on success → RazorpayService.createOrUpdatePayment(response, false, paymentId)
  │             → PUT /api/v2/razorpay/create_or_update_payment
  ▼
Backend: RazorpayPayment saved → po.update_payment → po.activate!
  │  UserSubscription created/extended, welcome/payment_successful/renewal_confirmed
  │  emails enqueued (see backend §12)
  ▼
Frontend: paymentPaid = true, confetti, toast, redirect to /subscriptions
          (or /checkout/:uuid/complete for non-subscription orderables)
```

`handleFullDiscount()` — for a 100%-discount code bringing the total to ₹0:
calls `PurchaseOrderService.markPaidForFullyDiscounted(uuid)` →
`PUT /api/v2/purchase_orders/mark_paid_for_fully_discounted`. Backend marks
the PO paid and runs the exact same `activate!` side effects as a real
Razorpay payment — no Razorpay call is ever made for a fully-discounted order.

### Discount codes

`applyDiscountCode()` → `DiscountCodesService.canBeApplied({code, amount, usersCount, objectType})`.
If valid, `updatePurchaseOrder()` re-syncs the PO with the new
`discount_code_id` and recalculated `amount_to_be_paid`. Discount is
re-validated again right before payment in `Pay()` (belt-and-braces, in case
the code's limits changed between page load and clicking Pay).

### Prorated add-on checkout

Detected via `isProratedAddon` getter (`purchaseOrder.notes.prorated_addon === 'true'`).
UI hides the quantity selector, billing-cycle row, and subtotal breakdown;
shows an add-on-specific summary and "Due today (prorated)" total. Payment
path is identical to a regular one-time purchase — no special Razorpay
handling. See backend §6 for how the prorated amount and quota bump work.

---

## 5. Trial flow (card verification)

Trials require a nominal, refundable card-verification charge (₹2 INR / $1
USD) before activating — this is a Razorpay auth-only hold, never captured.

```
StartTrial()
  │  requires productPrice.id, hasTrial, purchaseOrder.id
  ▼
RazorpayService.createOrFindOrder({}, {po_id}, {trial_verification: true})
  │  POST /api/v2/razorpay/find_or_create_order  (params: po_id, trial_verification=true)
  │  backend overrides amount to ProductPrice#trial_verification_amount,
  │  creates an auth-only order (payment_capture: 0)
  ▼
openTrialVerificationCheckout(order)
  │  opens Razorpay Checkout for the small verification amount
  │  on success → UserSubscriptionService.startTrial(priceId, {razorpay_payment_id, razorpay_order_id, razorpay_signature, po_id})
  │             → POST /api/v2/user_subscriptions/start_trial
  ▼
Backend: verifies signature, creates UserSubscription (status: active,
         ends_at = now + trial_period_days), enqueues WelcomeMailerWorker only
         (no payment_successful — nothing was actually charged). No explicit
         refund call — the auth-only hold auto-voids after 5 days.
  ▼
Frontend: paymentPaid = true, confetti, toast "Your N-day free trial has
          started", redirect to /subscriptions
```

`hasTrial` getter: `productPrice.trial_enabled && trial_period_days > 0 &&
!isProratedAddon`. The pricing page sets `?with_trial=1` in the checkout URL
which locks the trial toggle **on**; `?with_trial` absent (or any other
value) locks it **off**. If the query param is absent entirely, the checkout
page defaults the toggle to `hasTrial` (i.e. shows the trial option if the
plan has one) but leaves it user-controllable.

---

## 6. My Subscriptions page

`user-subscriptions.component.ts` / `.html` — `GET /api/v2/user_subscriptions`
(paginated). Each active card shows:

- Plan/product name, status pill (Active / Pending / Expired / Cancelled /
  Payment Failed), days remaining or "Cancels <date>" if
  `cancellation_requested_at` is set.
- Community/org usage bars (`kommunities_count` / `komunity_limit`,
  `community_groups_count` / `community_group_limit`).
- **"+ Create New Community"** / **"+ Create New Organization"** buttons
  (enabled only when `status === 'active'` and quota isn't full).
- A kebab context menu with conditional actions:
  - **"Add more communities"** — opens a stepper dialog
    (`openAddCommunitiesDialog` → `confirmAddCommunities` →
    `UserSubscriptionService.addCommunities(subscriptionId, extraCommunities)`
    → `POST /api/v2/user_subscriptions/add_communities` → routes to
    `/checkout/<uuid>` for the prorated one-time payment).
  - **"Cancel subscription"** — opens a confirmation dialog
    (`cancelPlan` → `confirmCancel` →
    `UserSubscriptionService.cancelSubscription(id, cancelAtCycleEnd = true)`
    → `POST /api/v2/user_subscriptions/cancel`). Card updates in place from
    the response — no full page reload.
- **Renew** button on expired/pending-payment cards →
  `UserSubscriptionService.renew(id)` → `POST /api/v2/user_subscriptions/renew`
  → routes to `/checkout/<new_po_uuid>`.

**Context menu implementation note:** the kebab menu items must be
pre-computed into a `subMenuItemsMap: Record<number, NbMenuItem[]>` (rebuilt
whenever `subscriptions` changes) rather than returned fresh from a template
method binding. Nebular's `[nbContextMenu]` calls `validateItems()` on every
change-detection pass; if the bound value is ever `undefined` (which happens
if items are built lazily inside a click handler instead of ahead of time),
it throws `List of menu items expected`. The fix: build the map eagerly after
every subscriptions fetch/update, and gate the kebab button's visibility on
`subMenuItemsMap[sub.id]?.length` so the binding is always a valid non-empty
array.

---

## 7. Payment History page

`payment-history.component.ts` / `.html` —
`GET /api/v2/user_subscriptions/payment_history` (paginated, all POs for the
user where `orderable_type: 'ProductPrice'`). Table columns: Date,
Description, Communities, Duration, Tax, Total Paid, Status.

Row actions (in the Status cell, stacked with a gap below the status pill):

- **"Pay now"** — shown only when `status === 'unpaid'` and the PO has a
  `uuid`. `[routerLink]="['/checkout', order.uuid]"` — jumps straight to
  checkout to complete an abandoned/failed payment.
- **"Email invoice"** — shown only when `status === 'paid'`. Calls
  `PurchaseOrderService.sendInvoice(uuid)` →
  `POST /api/v2/purchase_orders/send_invoice` (owner-only self-service, no
  email override — always goes to the buyer's contact email). Shows a
  spinner while sending and a "Sent" ✓ state for 3 seconds after success.

---

## 8. Finance dashboard (admin)

`finance-dashboard.component.ts` / `.html`, route `/finance-dashboard`, sits
alongside the sys-admin section. Access gated to **SYS_ADMIN or
FINANCE_ADMIN** (mirrors the backend's `ALLOWED_ROLES`).

- Table of all purchase orders (`GET /api/v2/finance_dashboard/purchase_orders`),
  filterable by status (defaults to `paid`), free-text search (invoice number
  or buyer name/email), paginated.
- **Preview** — fetches the invoice PDF as a Blob
  (`FinanceDashboardService.previewInvoice(uuid)` →
  `GET /api/v2/finance_dashboard/preview_invoice`) and opens it in a new
  tab via `URL.createObjectURL`; falls back to a forced download if the
  popup is blocked. Uses `HttpClient` (not a bare `<a target="_blank">`) so
  the request carries auth headers.
- **Email invoice** — `FinanceDashboardService.sendInvoice(uuid)` →
  `POST /api/v2/finance_dashboard/send_invoice`. Same spinner/✓ pattern as
  the self-service button in Payment History.
- **Cancel invoice** — visible **only to SYS_ADMIN** (`isSystemAdmin` check
  against `EUserRoles.SYSTEM_ADMINISTRATOR` in the current user's roles),
  only on rows that are `paid` and not already cancelled. Opens a
  confirmation dialog with an optional free-text reason, then calls
  `FinanceDashboardService.cancelInvoice(uuid, reason)` →
  `POST /api/v2/finance_dashboard/cancel_invoice`. Cancelled rows show an
  inline red "Invoice cancelled" pill next to the payment status pill.
  **No email is sent** for this action — see backend §11.

---

## 9. Subscription status lifecycle

```
                   ┌─────────┐
    Purchase       │         │
    Initiated ────>│ PENDING │
                   │         │
                   └────┬────┘
                        │
              Payment   │
              Confirmed │
                        ▼
                   ┌─────────┐
                   │         │
                   │ ACTIVE  │◄── User can create communities/orgs
                   │         │
                   └────┬────┘
                        │
           ┌────────────┼────────────┐
           │            │            │
           ▼            ▼            ▼
      ┌─────────┐  ┌─────────┐  ┌──────────────┐
      │CANCELLED│  │ EXPIRED │  │PAYMENT_FAILED│
      └─────────┘  └─────────┘  └──────────────┘
```

| Status           | Can create community/org | Notes                                                                                                        |
| ---------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `pending`        | ✗                        | Payment not yet confirmed (or a trial's verification PO before activation)                                   |
| `active`         | ✓ (if quota left)        | Normal working state                                                                                         |
| `expired`        | ✗                        | `ends_at` passed; **existing communities are hidden** (`is_visible: false` — see backend §2/§9), not deleted |
| `cancelled`      | ✗                        | User requested cancellation (immediately or at cycle end, then auto-transitioned by the expiry job)          |
| `payment_failed` | ✗                        | A payment attempt failed                                                                                     |

Note the frontend behavior differs slightly from the backend mechanics: the
UI shows "Cancels <date>" on an `active` card once
`cancellation_requested_at` is set (cycle-end cancellation) — the status
itself doesn't flip to `cancelled` until either the user chose immediate
cancellation, or `SubscriptionExpiryJob` later transitions it once `ends_at`
passes.

---

## 10. Services reference

| Service                   | Key methods                                                                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PurchaseOrderService`    | `showPurchaseOrder`, `indexByOrderType`, `createContactInfo`, `updatePurchaseOrder`, `markPaidForFullyDiscounted`, `sendInvoice`                                                           |
| `RazorpayService`         | `createOrFindOrder(orderDetails, {po_id \| eto_id}, {trial_verification?})`, `createOrUpdatePayment`, `getAllPaymentDetails`, `getPaymentInfo`                                             |
| `UserSubscriptionService` | `getMySubscriptions`, `getStats`, `getPaymentHistory`, `createSubscription`, `getSubscription`, `cancelSubscription(id, cancelAtCycleEnd = true)`, `addCommunities`, `startTrial`, `renew` |
| `FinanceDashboardService` | `getPurchaseOrders`, `sendInvoice`, `previewInvoice`, `cancelInvoice`                                                                                                                      |
| `DiscountCodesService`    | `canBeApplied({code, amount, usersCount, objectType, ...})`                                                                                                                                |

---

## 11. Where emails show up in the UI

The frontend never sends emails directly — every email in the system is
backend-triggered (see `gdgapp/SUBSCRIPTION_FLOW.md` §12 for the full trigger
table). What the frontend _does_ do is surface toasts/redirects around the
moments that queue those emails:

| UI action                                                    | Email(s) queued server-side                                                                                                          | UI feedback                                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Complete first-time payment                                  | `subscription_activated` + `payment_successful`                                                                                      | Toast "Your Payment Was Received Successfully", confetti, redirect to `/subscriptions`         |
| Start a trial                                                | `subscription_activated` only                                                                                                        | Toast "Your N-day free trial has started", confetti, redirect to `/subscriptions`              |
| Complete a renewal payment                                   | `renewal_confirmed`                                                                                                                  | Same payment-success toast/confetti as a first-time purchase                                   |
| Click "Cancel subscription" → confirm                        | `subscription_cancelled`                                                                                                             | Card updates in place, toast "Your subscription cancellation has been scheduled."              |
| Click "Email invoice" (Payment History or Finance Dashboard) | `purchase_invoice` (PDF attached)                                                                                                    | Spinner → toast `Invoice <number> sent to <email>` → brief ✓ "Sent" state                      |
| _(no UI trigger — scheduled)_                                | `renewal_reminder` (7/3/1 days before `ends_at`), `trial_reminder` (3 days before trial end), `subscription_expired` (day 0, +1, +3) | None — these are cron-driven and the user just receives the email; nothing to click in the app |
| Click "Cancel invoice" (Finance Dashboard, SYS_ADMIN)        | **None** — no email sent                                                                                                             | Toast `Invoice <number> cancelled.`, red "Invoice cancelled" pill appears on the row           |

---

## 12. Key business rules

1. **No recurring Razorpay objects** — every charge (first purchase, renewal,
   add-on, trial verification) is a fresh one-time Razorpay Order. There is
   no Razorpay Plan or Razorpay Subscription anywhere in this system.
2. **Trials always require card verification** — a small refundable
   auth-only charge, never a "start trial with zero payment info" flow.
3. **Quota is snapshotted at checkout confirmation**, not at payment time —
   `PurchaseOrderApiController#update` stamps `notes.komunity_limit` /
   `notes.community_group_limit` the moment the user confirms quantity, so
   `UserSubscription` gets the correct cap regardless of any ProductPrice
   metadata changes between checkout and payment.
4. **Tax is computed on the full base** (price × quantity × months, post
   discount), never on the unit price alone. Only India currently has tax
   configured (18% GST, split CGST+SGST or single IGST depending on the
   buyer's state relative to Delhi where Commudle is registered).
5. **Communities survive subscription expiry, but go invisible** — expired
   subscriptions don't delete Kommunities, they flip `is_visible: false` in
   bulk. Renewing does **not** automatically restore visibility — the owner
   re-enables communities manually.
6. **Invoice numbers are permanent and sequential** — `CMDLE-SYS/<FY>/<seq>`,
   assigned once on `activate!` via an advisory-locked sequence per Indian
   financial year, never reused or renumbered. Cancelling an invoice voids
   the _document_ (adds a watermark) but never deletes the row or frees up
   the number.
7. **One subscription per purchase order** —
   `find_or_initialize_by(purchase_order:)` in `ProductPrice#build_active_subscription`
   prevents duplicate subscriptions from duplicate payment confirmations.
8. **Confirmation emails are additive, not exclusive** — a first-time paid
   subscription always sends _two_ emails (welcome + payment receipt); a
   trial sends _one_ (welcome only, since nothing was charged); a renewal
   sends _one_ (renewal confirmation); an add-on sends _none_ by default.
