# Community

A Community (backend model name: **Kommunity**) is the core organizing entity. Organizers manage it through an **admin control panel**, and the public browses it through public profile pages. A directory listing lets anyone discover communities.

- Listing module: `apps/commudle-admin/src/app/feature-modules/communities/`
- Admin control panel: `apps/commudle-admin/src/app/feature-modules/community-control-panel/`
- Public module: `apps/commudle-admin/src/app/feature-modules/public-community/`
- Service: `apps/commudle-admin/src/app/services/communities.service.ts`
- Model: `libs/shared/models/src/lib/community.model.ts` (`ICommunity`, exported via `@commudle/shared-models`)
- API routes: `API_ROUTES.COMMUNITIES` in `libs/shared/services/src/lib/api-routes.constant.ts`

Frontend parent-type strings use `'Kommunity'` and `EDbModels.KOMMUNITY`; endpoints live under `api/v2/communities/...`.

---

## URL structure

| Side      | Base path                    | Mounted module                                                                                   |
| --------- | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| Directory | `/communities`               | `CommunitiesModule`                                                                              |
| Public    | `/communities/:community_id` | `PublicCommunityModule`                                                                          |
| Admin     | `/admin/communities`         | `community-control-panel` module (lazy, `AuthGuard`, roles `ORGANIZER` / `SYSTEM_ADMINISTRATOR`) |

> Note: the control-panel module class is exported as `CommunityGroupsModule` (a historical misnomer — it is the community control panel). Hackathon admin lives separately at `/admin/communities/:community_id/hackathon-dashboard`.

---

## Directory

`communities-routing.module.ts` → `/communities` → `CommunitiesComponent` (public directory of all communities; sub-components `communities-list/`, `communities-featured/`).

---

## Admin (control panel)

Routing: `community-control-panel-routing.module.ts`. Resolver: `CommunityDetailsResolver`. Tabs render inside `CommunityControlPanelComponent` (sidebar shell). `CommunityStatsComponent` sits outside the shell.

### Routes

| Path (under `/admin/communities`)                                     | Component                              | Purpose                             |
| --------------------------------------------------------------------- | -------------------------------------- | ----------------------------------- |
| `new`                                                                 | `CommunityCreateComponent`             | Create a community                  |
| `:community_id/stats`                                                 | `CommunityStatsComponent`              | Analytics dashboard (Chart.js)      |
| `:community_id`                                                       | `CommunityControlPanelComponent`       | Admin shell (sidebar)               |
| `:community_id` (index)                                               | `CommunityEventsListComponent`         | Events management (default landing) |
| `:community_id/notifications`                                         | `CommunityAdminNotificationsComponent` | Admin notifications                 |
| `:community_id/forms`                                                 | `CommunityFormsListComponent`          | Data forms                          |
| `:community_id/surveys`                                               | `CommunitySurveysComponent`            | Surveys                             |
| `:community_id/edit`                                                  | `CommunityEditDetailsComponent`        | Edit community profile/settings     |
| `:community_id/payments`                                              | `CommunityPaymentsComponent`           | Payments (children below)           |
| `:community_id/payments` (index)                                      | `CommunityBankDetailsComponent`        | Bank details                        |
| `:community_id/payments/logs`                                         | `CommunityPaymentLogsComponent`        | Transaction logs                    |
| `:community_id/payments/logs/:edfeg_id`                               | `PaymentLogEdfegComponent`             | Single payment log                  |
| `:community_id/hackathons`                                            | `AdminCommunityHackathonComponent`     | Hackathon entry point               |
| `:community_id/pages`                                                 | `CommunityPageComponent`               | Custom pages list                   |
| `:community_id/pages/new` · `pages/edit/:page_slug`                   | `CustomPageFormComponent`              | Create/edit custom page             |
| `:community_id/emails`                                                | `CommunityMailsSentStatsComponent`     | Sent-email stats                    |
| `:community_id/newsletters`                                           | `CommunityNewsletterComponent`         | Newsletters list                    |
| `:community_id/newsletters/new` · `newsletters/edit/:newsletter_slug` | `NewsletterFormComponent`              | Create/edit newsletter              |
| `:community_id/members`                                               | `CommunityMembersListComponent`        | Members (tab wrapper)               |
| `:community_id/members` (index)                                       | `CommunityMembersComponent`            | Member directory                    |
| `:community_id/members/blocked`                                       | `CommunityBlockedUsersComponent`       | Blocked users                       |
| `:community_id/team`                                                  | `CommunityTeamComponent`               | Organizers & event organizers       |
| `:community_id/channels` (+ `:community_channel_id`, `join/:token`)   | `CommunityChannelsAndForumsComponent`  | Channels admin                      |
| `:community_id/forums`                                                | `ForumsModule` (lazy)                  | Forums                              |

### Sub-features

- **Dashboard shell** — `CommunityControlPanelComponent`: sidebar nav, organizer check against `userManagedCommunities$`, unread notification count, "Send Email to all members" (`EmailerComponent`), dark mode, `noIndex(true)`.
- **Events** — `CommunityEventsListComponent`: search, status filters, pagination, context menu (Clone, Public Page, Stats → event dashboard).
- **Members** — `CommunityMembersComponent`: search, filters (skills, experience level, employment status, gender, domains, most active / contributor / content creator / speaker), sort, pagination, activity-score thresholds, remove/block; `CommunityBlockedUsersComponent` for unblock.
- **Team / roles** — `CommunityTeamComponent`: invite organizers & event organizers by email/role (`UserRolesUsersService`), resend invite, remove.
- **Stats** — `CommunityStatsComponent`: Chart.js visualizations (gender, member growth, events timeline, speakers, content creators, attendance, skill tags, work experience) from `StatsCommunitiesService`.
- **Channels & Forums** — `CommunityChannelsAndForumsComponent` (uses `EDbModels`).
- **Forms & Surveys** — `CommunityFormsListComponent`, `CommunitySurveysComponent`.
- **Payments** — bank details, transaction logs; `togglePaymentEnable`.
- **Custom pages** — `CommunityPageComponent` + shared `CustomPageFormComponent`.
- **Newsletters** — `CommunityNewsletterComponent` + shared `NewsletterFormComponent`.
- **Emails / Notifications** — `CommunityMailsSentStatsComponent`, `CommunityAdminNotificationsComponent`.
- **Settings** — `CommunityEditDetailsComponent`; email visibility toggle (`toggleEmailVisibility`).

---

## Public

Routing: `public-community-routing.module.ts`. Parent shell: `HomeCommunityComponent` (resolves `community`).

### Routes

| Path (under `/communities/:community_id`)                                        | Component                               | Purpose                |
| -------------------------------------------------------------------------------- | --------------------------------------- | ---------------------- |
| `` (index)                                                                       | `AboutComponent`                        | Community home/about   |
| `events`                                                                         | `EventsComponent`                       | Upcoming & past events |
| `members`                                                                        | `MembersComponent`                      | Members & speakers     |
| `channels` (+ `:community_channel_id`, `join/:token`, `email-join/:email_token`) | `CommunityChannelsListComponent`        | Public channels & join |
| `forums`                                                                         | `ForumsModule` (lazy)                   | Forums                 |
| `notifications`                                                                  | `PublicCommunityNotificationsComponent` | Public notifications   |
| `hackathons`                                                                     | `PublicCommunityHackathonsComponent`    | Public hackathons      |
| `p/:page_slug`                                                                   | `CustomPageComponent`                   | Public custom page     |
| `newsletters`                                                                    | `NewslettersComponent`                  | Newsletters list       |
| `newsletters/:newsletter_slug`                                                   | `NewsletterComponent`                   | Newsletter detail      |

### Sub-features

- **Shell** — `HomeCommunityComponent`: sticky header (IntersectionObserver), dynamic tabs (custom pages + newsletters), banner upload for organizers, notification count, SEO tags + Organization schema.org JSON-LD.
- **About** — `AboutComponent`: about text, organizers, upcoming events & hackathons, default channel join, social links, Event schema.
- **Events** — `EventsComponent`: upcoming + paginated past events, Event schema, SEO.
- **Members** — `MembersComponent`: members + speakers, search + filters (employment status, domains, mutuals), infinite scroll.
- **Channels** — `CommunityChannelsListComponent`: list & join via token/email token.
- **Membership** — `MembershipToggleComponent` (join/leave); **Speakers** — `SpeakerCardComponent`.
- **Newsletters / Custom pages / Hackathons / Notifications** — public views.

---

## Admin vs Public at a glance

| Sub-feature          | Admin                                                      | Public                                         |
| -------------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| Home/shell           | `CommunityControlPanelComponent`                           | `HomeCommunityComponent`                       |
| About                | via `edit`                                                 | `AboutComponent` (index)                       |
| Events               | `CommunityEventsListComponent`                             | `EventsComponent`                              |
| Members              | `CommunityMembersComponent` (+ blocked)                    | `MembersComponent`                             |
| Team/roles           | `CommunityTeamComponent`                                   | organizers shown in About                      |
| Channels             | `CommunityChannelsAndForumsComponent`                      | `CommunityChannelsListComponent`               |
| Forums               | `ForumsModule`                                             | `ForumsModule`                                 |
| Hackathons           | `AdminCommunityHackathonComponent`                         | `PublicCommunityHackathonsComponent`           |
| Newsletters          | `CommunityNewsletterComponent`                             | `NewslettersComponent` / `NewsletterComponent` |
| Custom pages         | `CommunityPageComponent`                                   | `CustomPageComponent`                          |
| Forms & surveys      | `CommunityFormsListComponent`, `CommunitySurveysComponent` | —                                              |
| Payments             | `CommunityPaymentsComponent`                               | —                                              |
| Stats                | `CommunityStatsComponent`                                  | —                                              |
| Emails/Notifications | mails-sent stats, admin notifications                      | public notifications                           |

---

## Service — `CommunitiesService`

State: `userManagedCommunities$` (BehaviorSubject, populated by `getRoleCommunities`).

**Admin:** `create`, `createWithSubscription`, `checkSlug`, `getRoleCommunities`, `getCommunityDetails`, `updateCommunity`, `searchByName`, `getPopularTags`, `speakers`, `toggleEmailVisibility`, `togglePaymentEnable`, `sendCsvSpeakersList`, `getActivityScoreThresholds`.

**Public:** `pGetCommunities`, `pGetCommunityDetails`, `getSpeakersList`, `getPopularCommunities`.

**Supporting services:** `StatsCommunitiesService`, `UserRolesUsersService`, `EventsService`, `NewsletterService`, `CustomPageService`, `HackathonService`, `CommunityChannelsService`, `CommunityDetailsResolver`, `NotificationsStore`.

---

## Model — `ICommunity`

Notable fields: `id`, `name`, `about`, `mini_description`, `slug`, `logo_image` / `logo_image_path` / `logo_path`, `banner_image`, `contact_email`, socials (`facebook`, `github`, `twitter`, `website`, `linkedin`, `instagram`), `location`, `tags` (`ITag[]`), `members_count`, `is_visible`, `payments_enabled`, `emails_visible`, `hackathon_enabled`, `has_refund_policy`, counts (`community_channels_count?`, `completed_events_count?`, `upcoming_events_count`, `upcoming_hackathons_count`), `upcoming_events?`, `community_group` (`ICommunityGroup`), `user_subscription_id?`.

Related: `ICommunitySearch extends ICommunity { type }`, `ICommunities { communities, page, count, total }`, `IActivityScoreThresholds` (dormant / low_active / moderately_active / highly_active min-max).

---

## Backend API routes (`API_ROUTES.COMMUNITIES`)

`CHECK_SLUG`, `CREATE` (`api/v2/communities`), `USER_ROLE_COMMUNITIES`, `DETAILS` (`api/v2/communities`), `UPDATE` (`.../update`), `SEARCH_BY_NAME`, `SPEAKERS`, `POPULAR_TAGS`, `PUBLIC_INDEX` (`.../public_index`), `PUBLIC_DETAILS` (`.../public_show`), `TOGGLE_EMAIL_VISIBILITY`, `TOGGLE_PAYMENTS`, `CSV_SPEAKERS_LIST`, `ACTIVITY_SCORE_THRESHOLDS`, and `PUBLIC.INDEX` (`api/v2/communities/public`), `PUBLIC.SPEAKERS`.

**Related:** `API_ROUTES.STATS.COMMUNITIES.*` (members distribution, experience categories, new members, members/events timeline, emails, skill tags, work experience, speakers, content creators, event attendance); `API_ROUTES.USER_ROLES_USERS.*` (blocked_users, remove_user, block_user, unblock_user, roles, public leaders by role); `API_ROUTES.COMMUNITY_CHANNELS.*`; `API_ROUTES.FEATURED_COMMUNITIES.*`; `API_ROUTES.HOME.COMMUNITIES` / `HOME.PUBLIC.COMMUNITIES`.

> There is no `KOMMUNITIES` key — community endpoints live under `COMMUNITIES`.
