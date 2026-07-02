# Commudle Subscription Flow

## Overview

This document covers the complete subscription model — the admin setup required before going live, the full end-user journey from pricing page to community creation, the technical flow for both payment types, and the production deployment checklist.

---

## Table of Contents

1. [Data Model](#1-data-model)
2. [Admin Setup — Before Any User Can Subscribe](#2-admin-setup--before-any-user-can-subscribe)
3. [User Journey — Step by Step](#3-user-journey--step-by-step)
4. [Technical Flow — Non-Subscription Plan (One-Time Payment)](#4-technical-flow--non-subscription-plan-one-time-payment)
5. [Technical Flow — Subscription Plan (Razorpay Subscription)](#5-technical-flow--subscription-plan-razorpay-subscription)
6. [Community Creation Flow](#6-community-creation-flow)
7. [Subscription Status Lifecycle](#7-subscription-status-lifecycle)
8. [API Reference](#8-api-reference)
9. [Key Business Rules](#9-key-business-rules)
10. [Production Deployment Checklist](#10-production-deployment-checklist)

---

## 1. Data Model

### Database Tables and Relationships

```
ProductPrice
  ├── id, uuid
  ├── product_name                     → e.g. "Commudle for Startups"
  ├── plan_name                        → e.g. "Startup Annual"
  ├── original_price                   → e.g. 10000.0
  ├── final_price                      → e.g. 8000.0 (after discount)
  ├── discount_amount / discount_percentage
  ├── currency                         → "INR" / "USD"
  ├── billing_cycle                    → one_time | monthly | yearly
  ├── is_subscription_plan             → true | false  ← KEY FLAG
  ├── min_subscription_duration_months → minimum billing period
  ├── metadata (JSONB)
  │     ├── max_kommunities            → max communities user can create
  │     ├── can_create_community_group → org creation allowed?
  │     ├── can_create_kommunity       → community creation allowed?
  │     └── rzp_plan_id                → Razorpay Plan ID ← SET BY ADMIN SETUP
  └── has_many :user_subscriptions, :purchase_orders

PurchaseOrder
  ├── id, uuid
  ├── user_id
  ├── orderable_type                   → "ProductPrice"
  ├── orderable_id                     → ProductPrice.id
  ├── price                            → amount in paise (×100)
  ├── quantity                         → number of communities
  ├── currency
  ├── status                           → unpaid | paid | partial_refund | full_refund
  ├── notes (JSONB)                    → { subscription_months: 12 }
  ├── discount_amount, tax_amount, amount_to_be_paid
  └── has_one :razorpay_order

UserSubscription
  ├── id
  ├── created_by_id                    → User.id (who purchased)
  ├── product_price_id                 → ProductPrice.id
  ├── purchase_order_id                → PurchaseOrder.id
  ├── rzp_subscription_id              → Razorpay Subscription ID (subscription plans only)
  ├── status                           → pending | active | cancelled | expired | payment_failed
  ├── starts_at
  ├── ends_at
  └── has_many :kommunities, :community_groups

Kommunity (Community)
  ├── user_subscription_id             → links community back to the subscription
  └── belongs_to :user_subscription (optional)
```

### Relationship Summary

```
User
 └──> PurchaseOrder (one per plan purchase)
        └──> ProductPrice (what was bought)
        └──> UserSubscription (activated after payment)
                └──> Kommunity[] (communities created under this subscription)
```

---

## 2. Admin Setup — Before Any User Can Subscribe

> **This is the most critical step. If skipped, users will hit an error when trying to pay for a subscription plan.**

The Razorpay Subscription flow requires three things to exist before a user can buy:

```
Razorpay Dashboard
  └── Plan (rzp_plan_id)       ← must exist first
        └── Subscription       ← created per user at purchase time

Commudle ProductPrice
  └── metadata.rzp_plan_id    ← must point to the Razorpay Plan above
```

### Step-by-Step Admin Setup

#### Step 1 — Create the ProductPrice record (Commudle Admin)

Call `POST /api/v2/product_prices` as a SYS_ADMIN user with:

```json
{
  "product_price": {
    "product_name": "Commudle for Startups",
    "plan_name": "Startup Annual",
    "original_price": 10000,
    "final_price": 8000,
    "discount_percentage": 20,
    "currency": "INR",
    "billing_cycle": "yearly",
    "is_subscription_plan": true,
    "min_subscription_duration_months": 12,
    "description": "Annual plan for startup communities"
  }
}
```

Also set the metadata fields via Rails console or a separate admin endpoint:

```ruby
pp = ProductPrice.find(<id>)
pp.update!(metadata: {
  'max_kommunities'        => 3,
  'can_create_kommunity'   => true,
  'can_create_community_group' => false
})
```

#### Step 2 — Create the Razorpay Plan (Admin Only)

Call `POST /api/v2/product_prices/create_rzp_plan?price_uuid=<uuid>` as a SYS_ADMIN user.

**What this does:**
- Reads `final_price`, `currency`, `billing_cycle`, `product_name`, `plan_name` from the `ProductPrice`
- Calls `Razorpay::Plan.create(period, interval: 1, item: { amount, currency, name })`
- Saves the returned Razorpay `plan.id` into `ProductPrice.metadata['rzp_plan_id']`

**Response:**
```json
{
  "rzp_plan_id": "plan_AbcXyz123456",
  "plan_name": "Commudle for Startups - Startup Annual",
  "interval": 1,
  "period": "yearly"
}
```

After this step, the `ProductPrice` record is fully configured and ready for users to purchase.

#### Step 3 — Verify Setup

Check `GET /api/v2/product_prices/show?price_uuid=<uuid>` — the response must include:

```json
{
  "is_subscription_plan": true,
  "billing_cycle": "yearly",
  "rzp_plan_id": "plan_AbcXyz123456"
}
```

If `rzp_plan_id` is present — setup is complete. Users can now buy the plan.

---

## 3. User Journey — Step by Step

### Step 1 — User lands on Pricing Page
- **URL:** `/pricing`
- User sees plan cards: **Startup**, **Enterprise**, **DevRel**
- Each card shows pricing (Monthly / Annual toggle), key features, and a CTA button
- Pricing data comes from **Sanity CMS** (`pp-commudle-for-startups`, `pp-commudle-for-enterprises`)
- Live price details (currency, discount %) are fetched from `GET /api/v2/product_prices/show?price_uuid=...`

---

### Step 2 — User clicks "Buy Now" / Plan CTA
- Frontend checks if the user is **logged in**
  - If **not logged in** → redirect to `/login`
  - If **logged in** → proceed
- Frontend calls `POST /api/v2/product_prices/create_purchase_order?price_uuid=<uuid>`
- Backend creates a `PurchaseOrder` with:
  - `status: unpaid`
  - `orderable: ProductPrice`
  - `notes: { subscription_months: <min_months> }`
  - `amount_to_be_paid` calculated including taxes
- Backend returns the `PurchaseOrder` with its `uuid`
- Frontend redirects to `/checkout/<purchase_order_uuid>`

---

### Step 3 — Checkout Page
- **URL:** `/checkout/<purchase_order_uuid>`
- Page loads `PurchaseOrder` via `GET /api/v2/purchase_orders/show?purchase_order_uuid=<uuid>`
- If PO is already `paid` → redirect to `/subscriptions`
- User fills in **Company Details** (Company Name, Address, Pin Code, optional GST)
- User can optionally enter a **Discount Code** (validated against `GET /api/v2/discount_codes/can_be_applied`)
- User can adjust **Quantity** (number of communities)
- Payment summary shows: Price, Quantity, Discount, Total

---

### Step 4 — User clicks "Pay Now"

#### Branch A — Regular One-Time Payment (`is_subscription_plan: false`)
```
Frontend
  → Saves contact info: POST /api/v2/purchase_orders/create_contact_info
  → Creates Razorpay order: POST /api/v2/razorpay/find_or_create_order?po_id=<id>
  → Opens Razorpay checkout modal (order_id)
  → User pays
  → On success: PUT /api/v2/razorpay/create_or_update_payment
Backend
  → RazorpayPayment saved
  → PurchaseOrder.update_payment() called
  → PO status → paid
  → UserSubscription created (status: active, ends_at = now + months)
  → Confirmation email sent (ProductPricePaidMailerWorker via Sidekiq)
Frontend
  → Redirects to /checkout/<uuid>/complete
```

#### Branch B — Subscription Plan (`is_subscription_plan: true`)
```
Frontend
  → Saves contact info: POST /api/v2/purchase_orders/create_contact_info
  → Creates Razorpay Subscription: POST /api/v2/razorpay/create_rzp_subscription?po_id=<id>
Backend
  → Reads rzp_plan_id from ProductPrice.metadata
  → Calls Razorpay::Subscription.create(plan_id, total_count, quantity)
  → Creates UserSubscription (status: pending, rzp_subscription_id stored)
  → Returns { rzp_subscription_id, status }
Frontend
  → Opens Razorpay checkout modal with subscription_id (not order_id)
  → User enters card / UPI details for recurring billing
  → On success: { razorpay_payment_id, razorpay_subscription_id, razorpay_signature }
  → PUT /api/v2/razorpay/create_or_update_payment?subscription_id=<rzp_sub_id>
Backend
  → Finds UserSubscription by rzp_subscription_id
  → UserSubscription.status → active
  → UserSubscription.starts_at = now
  → UserSubscription.ends_at = now + months
  → PurchaseOrder.status → paid
Frontend
  → Toast: "Subscription activated successfully!"
  → Redirects to /subscriptions
```

---

### Step 5 — My Subscriptions Page
- **URL:** `/subscriptions`
- Fetches user's subscriptions: `GET /api/v2/user_subscriptions`
- Each subscription card shows:
  - Plan name, product name
  - Status pill (Active / Pending / Expired / Cancelled)
  - Days remaining
  - Billing info (price, started, renews)
  - Community usage bar (used / max)
  - Organization usage bar (if applicable)
  - List of communities already created under this subscription
  - **"New Community" button** (enabled only if subscription is `active` and quota not full)

---

### Step 6 — User clicks "New Community"
- Opens `CreateCommunityFormComponent` dialog
- `subscriptionId` is passed as context to the dialog

---

### Step 7 — Community Creation Form
User fills in:
- **Community Name** (required, min 3 chars)
- **URL Slug** — auto-generated from name, validated in real-time
  - Calls `GET /api/v2/communities/check_slug?slug=<slug>` (debounced 500ms)
  - Shows ✓ available / ✗ taken indicator
- **Contact Email** (required)
- **Mini Description** (required, max 200 chars)
- **Location**, **Website**
- **About** (rich text via TinyMCE)
- **Logo Image** (PNG/JPG, max 5MB)
- **Banner Image** (1280×320px, max 5MB)
- **Social Links** (Facebook, Twitter, GitHub, LinkedIn, Instagram)

---

### Step 8 — User submits Community Form
```
Frontend
  → POST /api/v2/communities?user_subscription_id=<id>
  → FormData with all community fields + images
Backend
  → Validates subscription belongs to current user and is active
  → Checks quota: subscription.kommunities.count < max_kommunities
  → Creates Kommunity with user_subscription linked
  → Attaches logo_image and banner_image via Active Storage
  → Creates default CommunityChannel
  → Returns created community
Frontend
  → Toast: "Community created successfully!"
  → Closes dialog
  → Navigates to /communities/<slug>
```

---

## 4. Technical Flow — Non-Subscription Plan (One-Time Payment)

```
[Pricing Page]
      |
      | click Buy Now
      ↓
[POST /api/v2/product_prices/create_purchase_order]
      | PurchaseOrder created (status: unpaid)
      ↓
[Checkout Page /checkout/:uuid]
      |
      | fill company details + click Pay Now
      ↓
[POST /api/v2/purchase_orders/create_contact_info]
      |
      ↓
[POST /api/v2/razorpay/find_or_create_order?po_id=<id>]
      | RazorpayOrder created, rzp_order_id returned
      ↓
[Razorpay Modal opens with order_id]
      |
      | user pays
      ↓
[PUT /api/v2/razorpay/create_or_update_payment]
      |
      ↓
[PurchaseOrder.update_payment()]
      | PO status → paid
      | UserSubscription created/updated → active
      | Confirmation email queued (Sidekiq :high queue)
      ↓
[/checkout/:uuid/complete]
```

---

## 5. Technical Flow — Subscription Plan (Razorpay Subscription)

```
[ADMIN — one-time setup]
      |
      ↓
[POST /api/v2/product_prices/create_rzp_plan?price_uuid=<uuid>]
      | Razorpay Plan created → rzp_plan_id saved to ProductPrice.metadata
      ↓
[Plan is ready for users]

────────────────────────────────────────────────

[USER — every purchase]

[Pricing Page]
      |
      | click Buy Now
      ↓
[POST /api/v2/product_prices/create_purchase_order]
      | PurchaseOrder created (status: unpaid)
      ↓
[Checkout Page /checkout/:uuid]
      |
      | fill company details + click Pay Now
      ↓
[POST /api/v2/purchase_orders/create_contact_info]
      |
      ↓
[POST /api/v2/razorpay/create_rzp_subscription?po_id=<id>]
      | Reads rzp_plan_id from ProductPrice.metadata
      | Calls Razorpay::Subscription.create(plan_id, total_count, quantity)
      | UserSubscription created → status: pending, rzp_subscription_id stored
      | Returns { rzp_subscription_id }
      ↓
[Razorpay Modal opens with subscription_id]
      |
      | user enters card / UPI for recurring billing
      ↓
[PUT /api/v2/razorpay/create_or_update_payment?subscription_id=<rzp_sub_id>]
      |
      ↓
[Backend: find UserSubscription by rzp_subscription_id]
      | UserSubscription.status → active
      | UserSubscription.starts_at = now
      | UserSubscription.ends_at = now + months
      | PurchaseOrder.status → paid
      ↓
[Redirect to /subscriptions]
      |
      ↓
[User sees active subscription card with "New Community" button]
```

---

## 6. Community Creation Flow

```
[/subscriptions page]
      |
      | click "New Community" on active subscription card
      ↓
[CreateCommunityFormComponent dialog opens]
      | subscriptionId passed as context
      |
      | user types name → slug auto-generated
      | GET /api/v2/communities/check_slug?slug=<slug> (debounced, real-time)
      |
      | user fills required fields + uploads images
      | click "Create Community"
      ↓
[POST /api/v2/communities?user_subscription_id=<id>]
      |
      ↓
[Backend CommunitiesApiController#create]
      | 1. Find UserSubscription by id for current_user
      | 2. Validate status == active
      | 3. Check quota: kommunities.count < max_kommunities
      | 4. Create Kommunity with user_subscription linked
      | 5. Attach logo_image, banner_image via Active Storage
      | 6. Create default CommunityChannel
      | 7. Return community
      ↓
[Toast: "Community created successfully!"]
      |
      ↓
[Navigate to /communities/<slug>]
```

---

## 7. Subscription Status Lifecycle

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
                   │ ACTIVE  │◄── User can create communities
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

| Status           | Can Create Community  | Notes                                                  |
|------------------|-----------------------|--------------------------------------------------------|
| `pending`        | ✗ No                  | Payment not yet confirmed                              |
| `active`         | ✓ Yes (if quota left) | Normal working state                                   |
| `expired`        | ✗ No                  | Plan period ended — communities still visible          |
| `cancelled`      | ✗ No                  | User/admin cancelled                                   |
| `payment_failed` | ✗ No                  | Payment attempt failed                                 |

---

## 8. API Reference

### Admin — Plan Setup (SYS_ADMIN only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v2/product_prices` | Create a ProductPrice record |
| `PUT`  | `/api/v2/product_prices?price_uuid=<uuid>` | Update ProductPrice |
| `GET`  | `/api/v2/product_prices` | List all ProductPrices |
| `GET`  | `/api/v2/product_prices/show?price_uuid=<uuid>` | Fetch single ProductPrice (includes `rzp_plan_id`) |
| `POST` | `/api/v2/product_prices/create_rzp_plan?price_uuid=<uuid>` | **Create Razorpay Plan and save `rzp_plan_id`** |

### Pricing & Purchase Order

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/v2/product_prices/show?price_uuid=<uuid>` | Fetch plan details with live pricing |
| `POST` | `/api/v2/product_prices/create_purchase_order?price_uuid=<uuid>` | Create purchase order for a plan |
| `GET`  | `/api/v2/purchase_orders/show?purchase_order_uuid=<uuid>` | Fetch purchase order details |
| `PUT`  | `/api/v2/purchase_orders?purchase_order_uuid=<uuid>` | Update quantity / discount code |
| `POST` | `/api/v2/purchase_orders/create_contact_info?purchase_order_uuid=<uuid>` | Save billing details |

### Payment — One-Time

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v2/razorpay/find_or_create_order?po_id=<id>` | Create Razorpay order |
| `PUT`  | `/api/v2/razorpay/create_or_update_payment` | Confirm payment after Razorpay modal |

### Payment — Subscription

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v2/razorpay/create_rzp_subscription?po_id=<id>` | Create Razorpay Subscription — returns `rzp_subscription_id` |
| `PUT`  | `/api/v2/razorpay/create_or_update_payment?subscription_id=<rzp_sub_id>` | Activate subscription after Razorpay modal |

### Subscriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/v2/user_subscriptions` | List all subscriptions for current user |
| `GET`  | `/api/v2/user_subscriptions/show?id=<id>` | Single subscription details |

### Community Creation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/v2/communities/check_slug?slug=<slug>` | Real-time slug availability check |
| `POST` | `/api/v2/communities?user_subscription_id=<id>` | Create community linked to subscription |

---

## 9. Key Business Rules

1. **Razorpay Plan must be created before any user can subscribe** — `ProductPrice.metadata.rzp_plan_id` must be populated via `create_rzp_plan` before the subscription checkout flow will work.

2. **Only subscription plans use the Razorpay Subscription modal** — `ProductPrice.is_subscription_plan: true` triggers the subscription checkout path. All other plans use a one-time Razorpay order.

3. **Quota enforcement** — `ProductPrice.metadata.max_kommunities` defines how many communities can be created per subscription. Backend validates this on every community creation attempt.

4. **Slug is permanent** — Once a community's URL slug is set it cannot be changed. The form warns the user before submission.

5. **One subscription per purchase order** — `UserSubscription.find_or_initialize_by(purchase_order: po)` prevents duplicate subscriptions from duplicate payment confirmations.

6. **Communities survive subscription expiry** — When a subscription expires or is cancelled, existing communities remain active. Only new community creation is blocked.

7. **Confirmation email on payment** — `WProductPrice::ProductPricePaidMailerWorker` is enqueued via Sidekiq (`:high` queue) on every successful payment regardless of subscription type.

8. **Only subscription plan purchases redirect to `/subscriptions`** — Non-subscription `ProductPrice` purchases redirect to `/checkout/:uuid/complete` after payment.

9. **Razorpay webhook handles async payment events** — `POST /webhooks/razorpay` receives events (`payment.captured`, `payment.authorized`, `payment.failed`, `order.paid`) and processes them via `WRazorpay::RazorpayWebhookWorker` on the `:rzp_webhook` Sidekiq queue.

---

## 10. Production Deployment Checklist

### Backend (gdgapp)

#### Environment Variables — Required

Set these in your Elastic Beanstalk / server environment before deploying:

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `RAZORPAY_API_KEY_ID` | Razorpay live API key ID | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_API_KEY_SECRET` | Razorpay live API key secret | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature secret | Razorpay Dashboard → Webhooks → Secret |

#### Database Migrations

Run pending migrations after deploying:

```bash
bundle exec rails db:migrate
```

Key migrations required for the subscription system:
- `user_subscriptions` table with `rzp_subscription_id`, `starts_at`, `ends_at`, `status`, `purchase_order_id`
- `product_prices` table with `is_subscription_plan`, `billing_cycle`, `metadata` (JSONB)
- `kommunities` table with `user_subscription_id` column

Verify they are present:

```bash
bundle exec rails runner "puts ActiveRecord::Base.connection.columns('user_subscriptions').map(&:name)"
bundle exec rails runner "puts ActiveRecord::Base.connection.columns('product_prices').map(&:name)"
```

#### Sidekiq Queues

Ensure the `:rzp_webhook` and `:high` queues are running. Check `config/sidekiq.yml`:

```yaml
queues:
  - high
  - rzp_webhook
  - default
```

Verify Sidekiq is processing these queues in production:

```bash
bundle exec sidekiq -C config/sidekiq.yml
```

#### Razorpay Webhook Registration

In the Razorpay Dashboard, register the webhook URL pointing to production:

```
URL:    https://api.commudle.com/webhooks/razorpay
Secret: <RAZORPAY_WEBHOOK_SECRET value>
```

Enable these webhook events:
- `payment.authorized`
- `payment.captured`
- `payment.failed`
- `order.paid`
- `subscription.activated` ← required for subscription plans
- `subscription.charged`
- `subscription.cancelled`
- `subscription.paused`
- `subscription.resumed`

---

### Frontend (commudle-ng)

#### Environment Variables

In `libs/shared/environments/src/lib/environments.ts`, confirm the production environment uses the live Razorpay key:

```typescript
// Production environment
razorpay_key: 'rzp_live_nqGSJl7Jt6bsZx',
```

#### Build and Deploy

```bash
# Clear Nx cache
npx nx reset

# Build SSR production artifact
npx nx run commudle-admin:release

# Output: prod-server.zip
# Upload to Elastic Beanstalk
```

---

### Post-Deploy Admin Setup (Production)

After deploying to production, run these steps **once per subscription plan** before going live:

#### Step 1 — Create ProductPrice

```bash
# Via Rails console on production server
pp = ProductPrice.create!(
  product_name: 'Commudle for Startups',
  plan_name: 'Startup Annual',
  original_price: 10000,
  final_price: 8000,
  discount_percentage: 20,
  currency: 'INR',
  billing_cycle: 'yearly',
  is_subscription_plan: true,
  min_subscription_duration_months: 12,
  description: 'Annual plan for startup communities',
  metadata: {
    'max_kommunities'            => 3,
    'can_create_kommunity'       => true,
    'can_create_community_group' => false
  }
)
puts "ProductPrice UUID: #{pp.uuid}"
```

#### Step 2 — Create Razorpay Plan

```bash
# API call (SYS_ADMIN user token required)
curl -X POST "https://api.commudle.com/api/v2/product_prices/create_rzp_plan?price_uuid=<uuid>" \
  -H "Authorization: Bearer <admin_token>"
```

Expected response:
```json
{
  "rzp_plan_id": "plan_XXXXXXXXXXXXXXX",
  "plan_name": "Commudle for Startups - Startup Annual",
  "interval": 1,
  "period": "yearly"
}
```

#### Step 3 — Verify Plan is Ready

```bash
curl "https://api.commudle.com/api/v2/product_prices/show?price_uuid=<uuid>" \
  -H "Authorization: Bearer <admin_token>"
```

Confirm `rzp_plan_id` is present in the response. The plan is now live and purchasable.

#### Step 4 — Test with a Real Purchase

1. Open `https://commudle.com/pricing` in incognito
2. Click a plan CTA
3. Complete checkout with a real card (small amount) or use Razorpay test mode first
4. Verify `/subscriptions` shows the plan as `active`
5. Click "New Community" and complete the form
6. Confirm community appears at `/communities/<slug>`

---

### Rollback Plan

If the subscription flow breaks in production:

1. **Disable the plan CTA** — set `is_subscription_plan: false` on the ProductPrice to fall back to one-time payment flow
2. **Check Sidekiq** — ensure `rzp_webhook` queue is not backed up
3. **Check Razorpay Dashboard** — verify the webhook is receiving and responding with 200
4. **Manual subscription activation** — via Rails console if a user paid but subscription is stuck in `pending`:

```ruby
sub = UserSubscription.find_by(rzp_subscription_id: 'sub_XXXXX')
sub.update!(status: :active, starts_at: Time.current, ends_at: Time.current + 12.months)
sub.purchase_order.update!(status: :paid)
```
