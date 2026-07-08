# Community Group

A Community Group (backend model: `CommunityGroup`) is an umbrella organization that groups multiple communities together (e.g. a chapter network). It has an **admin dashboard** for group leaders and a **public profile**. Public URLs are mounted under `/orgs`.

- Admin module: `apps/commudle-admin/src/app/feature-modules/community-groups/`
- Public module: `apps/commudle-admin/src/app/feature-modules/public-community-groups/`
- Service: `apps/commudle-admin/src/app/services/community-groups.service.ts`
- Model: `apps/shared-models/community-group.model.ts` (`ICommunityGroup`)
- API routes: `API_ROUTES.COMMUNITY_GROUPS` in `libs/shared/services/src/lib/api-routes.constant.ts`

Both sides route on `:community_group_id` (the group slug) and each has its own `CommunityGroupDetailsResolver` that preloads the group. Custom pages and channels use `EDbModels.COMMUNITY_GROUP` and `parent_type: 'CommunityGroup'`.

---

## URL structure

| Side   | Base path     | Mounted module                                                                           |
| ------ | ------------- | ---------------------------------------------------------------------------------------- |
| Admin  | `/admin/orgs` | `CommunityGroupsModule` (lazy, `AuthGuard`, role `COMMUNITY_ADMIN`, all pages `noIndex`) |
| Public | `/orgs`       | `PublicCommunityGroupsModule` (lazy, SEO indexed)                                        |

---

## Admin (dashboard)

Routing: `community-groups-routing.module.ts`. All routes `canActivate: [AuthGuard]` with `expectedRoles: [COMMUNITY_ADMIN]`. Tabs render inside `DashboardComponent` (collapsible sidebar via `SidebarService`).

### Routes

| Path                                                      | Component                                     | Purpose                             |
| --------------------------------------------------------- | --------------------------------------------- | ----------------------------------- |
| `create`                                                  | `CommunityGroupFormComponent`                 | Create a group                      |
| `:community_group_id`                                     | `DashboardComponent`                          | Admin shell (sidebar)               |
| `:community_group_id` (index)                             | `CommunitiesComponent` → `CommunityComponent` | Member communities (tabbed)         |
| `.../events`                                              | `CommunitiesComponent` → `EventsComponent`    | Events of member communities        |
| `.../admin-team`                                          | `AdminTeamComponent`                          | Manage group leaders/admins         |
| `.../edit`                                                | `CommunityGroupFormComponent`                 | Edit group profile/settings         |
| `.../members`                                             | `MembersListComponent`                        | Member directory (search/filter)    |
| `.../surveys`                                             | `CommunityGroupsSurveysComponent`             | Surveys                             |
| `.../channels` (+ `:community_channel_id`, `join/:token`) | `CommunityGroupChannelComponent`              | Org-level channels admin            |
| `.../forums` (+ same children)                            | `CommunityGroupChannelComponent`              | Forums (same component, forum mode) |
| `.../pages`                                               | `CommunityGroupCustomPagesComponent`          | Custom pages list                   |
| `.../pages/new` · `pages/edit/:page_slug`                 | `CustomPageFormComponent`                     | Create/edit custom page             |

> A `ChannelsComponent` exists but its route (`index/channels`) is currently commented out.

### Sub-features

- **Dashboard shell** — `DashboardComponent`: sidebar nav (communities, events, members, channels, forums, pages, surveys, edit), `noIndex`, mini-footer disabled.
- **Member communities** — `CommunityComponent`: paginated list with per-community admin toggles `toggleEmailVisibility` and `togglePaymentEnable` (via `CommunitiesService`).
- **Events** — `EventsComponent`: paginated group events, builds schema.org Event JSON-LD for upcoming events.
- **Leaders/roles** — `AdminTeamComponent`: invite by email (`inviteCommunityAdmin`), resend invitation, remove (via `UserRolesUsersService`, `parent_type: 'CommunityGroup'`, role `COMMUNITY_ADMIN`).
- **Members** — `MembersListComponent`: debounced search + tag filters (speaker, content creator, employer, employee), pagination.
- **Profile/settings** — `CommunityGroupFormComponent`: name, logo (≤2MB), `mini_description` (≤200), description (TinyMCE), `theme_color`, socials; reloads on save.
- **Custom pages** — `CommunityGroupCustomPagesComponent` + shared `CustomPageFormComponent`.
- **Channels/Forums** — `CommunityGroupChannelComponent` (hosts channel/forum admin from `CommunityChannelsModule`).
- **Surveys** — `CommunityGroupsSurveysComponent`.

---

## Public

Routing: `public-community-groups-routing.module.ts`. Parent shell: `CommunityGroupHomeComponent`. No auth guards.

### Routes

| Path (under `/orgs/:community_group_id`)                                    | Component                                                                                   | Purpose                                   |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `` (index)                                                                  | `CommunityGroupActivityComponent`                                                           | Landing/activity feed                     |
| `about`                                                                     | `CommunityGroupAboutComponent`                                                              | Rendered HTML description                 |
| `communities`                                                               | `CommunityGroupCommunitiesComponent`                                                        | Paginated member communities              |
| `events`                                                                    | `CommunityGroupEventsComponent`                                                             | Past + upcoming events                    |
| `channels` (+ `community-channels`, `:community_channel_id`, `join/:token`) | `CommunityGroupChannelsComponent` → `OrgChannelsComponent` / `CommunitiesChannelsComponent` | Public channels                           |
| `forums` (+ same children)                                                  | `CommunityGroupChannelsComponent`                                                           | Public forums (forum mode)                |
| `leaders`                                                                   | `CommunityGroupTeamComponent`                                                               | Organizers/leaders across all communities |
| `p/:page_slug`                                                              | `CommunityGroupCustomPageComponent`                                                         | Public custom page                        |

> `PublicCommunityGroupsComponent` exists but is essentially empty and not wired into routing.

### Sub-features

- **Shell** — `CommunityGroupHomeComponent`: `checkOrganizer()` against `userManagedCommunityGroups$` to show edit affordances; builds custom-page dropdown menu (`CustomPageService.getPIndex`) linking to `orgs/:slug/p/:slug`.
- **Activity** — `CommunityGroupActivityComponent`: `activeCommunityAndChannels()` (communities, channels, forums) + upcoming events (`pEvents(..., 'future')`).
- **About** — `CommunityGroupAboutComponent`: sanitized HTML.
- **Communities** — `CommunityGroupCommunitiesComponent`: cursor-paginated (`pCommunities`).
- **Events** — `CommunityGroupEventsComponent`: separate past (`pEvents 'past'`) and upcoming (`pEvents 'future'`) lists.
- **Leaders** — `CommunityGroupTeamComponent`: organizers across all communities (`pGetOrganizersAllCommunities`), cursor-paginated.
- **Channels/Forums** — `OrgChannelsComponent` (org level) vs `CommunitiesChannelsComponent` (per-community).
- **Custom page** — `CommunityGroupCustomPageComponent` (`CustomPageService.getPShow(slug, groupSlug, EDbModels.COMMUNITY_GROUP)`).

---

## Admin vs Public at a glance

| Sub-feature        | Admin                                          | Public                                            |
| ------------------ | ---------------------------------------------- | ------------------------------------------------- |
| Shell              | `DashboardComponent` (sidebar)                 | `CommunityGroupHomeComponent` (tabs)              |
| Member communities | `CommunityComponent` (+ email/payment toggles) | `CommunityGroupCommunitiesComponent`              |
| Events             | `EventsComponent` (schema.org)                 | `CommunityGroupEventsComponent` (past + upcoming) |
| Leaders/roles      | `AdminTeamComponent` (invite/remove)           | `CommunityGroupTeamComponent` (view)              |
| Members            | `MembersListComponent` (search/filter)         | organizers only shown publicly                    |
| About              | part of edit form                              | `CommunityGroupAboutComponent`                    |
| Settings/profile   | `CommunityGroupFormComponent`                  | —                                                 |
| Channels           | `CommunityGroupChannelComponent`               | `OrgChannelsComponent`                            |
| Forums             | `CommunityGroupChannelComponent` (forum mode)  | `CommunityGroupChannelsComponent` (forum mode)    |
| Custom pages       | `CommunityGroupCustomPagesComponent` + form    | `CommunityGroupCustomPageComponent`               |
| Surveys            | `CommunityGroupsSurveysComponent`              | —                                                 |
| Activity feed      | —                                              | `CommunityGroupActivityComponent`                 |

---

## Service — `CommunityGroupsService`

State: `userManagedCommunityGroups$` (BehaviorSubject, populated by `getManagingCommunityGroups`).

**Admin:** `checkSlug`, `create`, `update`, `show`, `getManagingCommunityGroups`, `communities`, `events`, `members`, `communityChannels`.

**Public:** `pShow`, `pCommunities`, `pChannels`, `pEvents`, `activeCommunityAndChannels`, `pGetOrganizersAllCommunities`.

> Both resolvers use raw `HttpClient` with `API_ROUTES.COMMUNITY_GROUPS.SHOW` / `.PUBLIC.SHOW` rather than the service.

---

## Model — `ICommunityGroup`

Fields: `id`, `name`, `description`, `mini_description`, `slug`, `is_visible?`, socials (`facebook`, `github`, `twitter`, `website`, `linkedin`), `logo` (`IAttachedFile`), `theme_color`, `member_count?`, `kommunities_count?`, `community_channels_count?`, `community_count_limit?`, `user_subscription_id?`.

Related: `ICommunityGroups { community_groups: ICommunityGroup[] }` (`community-groups.model.ts`).

---

## Backend API routes (`API_ROUTES.COMMUNITY_GROUPS`)

**Admin:** `CREATE` / `UPDATE` (`api/v2/community_groups`), `SHOW` (`.../show`), `CHECK_SLUG`, `COMMUNITIES`, `MANAGING_COMMUNITY_GROUPS` (`.../get_managing_community_groups`), `EVENTS`, `COMMUNITY_CHANNELS`, `MEMEBRS_DETAILS` (`.../members_details`).

**Public (`COMMUNITY_GROUPS.PUBLIC`):** `SHOW` (`api/v2/community_groups/public`), `COMMUNITIES`, `EVENTS`, `COMMUNITY_CHANNELS`, `ACTIVE_COMMUNITIES_AND_CHANNELS`, `ORGANIZERS_ALL_COMMUNITIES`.

Backend controller: `gdgapp/app/controllers/api/v2/community_groups_api_controller.rb`.
