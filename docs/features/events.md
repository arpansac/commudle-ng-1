# Events

The Events feature lets community organizers create, configure, and run events (online or offline), and lets the public discover, register for, and attend them. It is split into an **admin control panel** (`events` module) and a **public** experience (`public-events` module).

- Admin module: `apps/commudle-admin/src/app/feature-modules/events/`
- Public module: `apps/commudle-admin/src/app/feature-modules/public-events/`
- Service: `apps/commudle-admin/src/app/services/events.service.ts`
- Model: `libs/shared/models/src/lib/event.model.ts` (`IEvent`, exported via `@commudle/shared-models`)
- API routes: `API_ROUTES.EVENTS` in `libs/shared/services/src/lib/api-routes.constant.ts`

An event always belongs to a community (backend: `kommunity`). Both admin and public routes are nested under a community.

---

## URL structure

| Side   | Base path                                          | Mounted module                     |
| ------ | -------------------------------------------------- | ---------------------------------- |
| Admin  | `/admin/communities/:community_id/event-dashboard` | `EventsModule` (lazy, `AuthGuard`) |
| Public | `/communities/:community_id/events/:event_id`      | `PublicEventsModule` (lazy)        |

---

## Admin (control panel)

Routing: `events-routing.module.ts`. Resolvers: `CommunityDetailsResolver` (root) and `EventDetailsResolver` (per `:event_id`). Most tabs render inside the `EventDashboardComponent` shell (sidebar layout).

### Routes

| Path (under `event-dashboard`)                                     | Component                           | Purpose                                                       |
| ------------------------------------------------------------------ | ----------------------------------- | ------------------------------------------------------------- |
| `new`                                                              | `CreateEventComponent`              | Create a new event                                            |
| `:event_id`                                                        | `EventDashboardComponent`           | Dashboard shell (sidebar)                                     |
| `:event_id` (index)                                                | `EventDetailsComponent`             | Event overview/detail                                         |
| `:event_id/stats`                                                  | `EventStatsComponent`               | Event analytics                                               |
| `:event_id/edit`                                                   | `EditEventComponent`                | Edit event form                                               |
| `:event_id/updates`                                                | `EventUpdatesComponent`             | Post updates/announcements                                    |
| `:event_id/agenda`                                                 | `EventAgendaComponent`              | Manage agenda / schedule                                      |
| `:event_id/registrations`                                          | `EventRegistrationsComponent`       | Registration configuration (resolves `QuestionTypesResolver`) |
| `:event_id/collaborations`                                         | `CollaboratingCommunitiesComponent` | Collaborating communities                                     |
| `:event_id/volunteers`                                             | `VolunteersComponent`               | Manage volunteers                                             |
| `:event_id/sponsors`                                               | `SponsorsComponent`                 | Manage sponsors                                               |
| `:event_id/emails`                                                 | `CommunityEmailsListComponent`      | Event emails (shared reusable component)                      |
| `:event_id/form-responses`                                         | `EventFormResponsesComponent`       | Registration form responses                                   |
| `:event_id/:event_simple_registration_id/user-event-registrations` | `UserEventRegistrationsComponent`   | Attendee registrations list                                   |
| `:event_id/scan-entry-pass`                                        | `EntryPassScanComponent`            | QR entry-pass scanning (ZXing)                                |
| `:event_id/scan-entry-pass/checked-in-list`                        | `EventCheckedInListComponent`       | Checked-in attendees                                          |
| `:event_id/scan-exit-pass`                                         | `ExitPassScanComponent`             | QR exit-pass scanning                                         |

### Sub-features

- **Event CRUD** — `create-event`, `edit-event`; header image upload/delete; clone an event (`cloneEvent`).
- **Status** — `EventStatusComponent`, `updateStatus` (draft/open/completed etc.).
- **Overview & stats** — `event-details`, `event-stats` (uses `StatsEventsService` / `API_ROUTES.STATS.EVENTS`).
- **Updates** — author announcements shown on the public page.
- **Agenda / locations / tracks** — `event-agenda`, `event-locations`, and `event-location-tracks/` (`TrackSlotsComponent`, `TimeBlocksComponent`, `track-slot-form/`).
- **Registrations** — `event-registrations` with:
  - `event-simple-registration/` (simple registration, `updateCustomRegistration`),
  - `form-groups/` + `payment-settings/` + `new-form-attach-groups/` (data-form based / paid registration),
  - `discount-coupons/` + `discount-coupon-form/`.
- **Form responses** — `event-form-responses` with cells for `user-details`, `user-engagement-data`, `user-payment-details`, `user-track-slots`, and `event-form-responses-graph`.
- **Sponsors / Speakers / Volunteers / Collaborations** — dedicated management components.
- **Entry / exit passes** — `user-event-registrations` with `entry-pass-scan`, `exit-pass-scan`, `event-checked-in-list`.
- **Streaming & recordings** — `event-streaming` (standalone), `event-embedded-video-stream`, `event-recordings` (100ms/HMS); `inviteGuestToWebinarStage`.
- **Comments** — `event-comments`.
- **Emails** — send event emails via shared `CommunityEmailsListComponent`.

---

## Public

Routing: `public-events-routing.module.ts`. Resolvers: `CommunityDetailsResolver` + `PublicEventDetailsResolver`.

### Routes

| Path (under `events/:event_id`) | Component                  | Purpose                                                      |
| ------------------------------- | -------------------------- | ------------------------------------------------------------ |
| `` (index)                      | `HomeEventComponent`       | Public event landing page                                    |
| `session`                       | `SessionPageComponent`     | Live session viewer (has `CheckRedirectGuard` canDeactivate) |
| `beam`                          | `HmsBeamComponent`         | Streaming beam (shared HMS module)                           |
| `attended-members`              | `AttendedMembersComponent` | Members who attended                                         |
| `agenda`                        | `EventsAgendaComponent`    | Public agenda view                                           |

### Sub-features

- **Landing** — `home-event` composes: `event-description`, `highlighted-links`, `agenda` (with `event-location-tracks/`), `speakers`, `sponsors`, `team`, `collaboration-communities`, `event-updates`, `attending-members`.
- **Attendance** — `attending-members`, `attended-members` (+ `attended-members-card/`), `auto-attendance`.
- **Live sessions** — `live-sessions` and `session-page` viewer with sub-panels: `session-page-details/`, `session-page-video/` (`session-page-chat`, `session-page-poll`, `session-page-qna`, `session-page-viewers`).
- **Agenda** — dedicated `events-agenda` route plus in-page agenda.

---

## Service — `EventsService`

**Admin methods:** `createEvent`, `updateEvent`, `cloneEvent`, `getEvent`, `updateStatus`, `updateCustomRegistration`, `updateCustomAgenda`, `updateHeaderImage`, `deleteHeaderImage`, `communityEventsForEmail`, `embeddedVideoStreamPastVisitors`, `embeddedVideoStreamVisitors`, `inviteGuestToWebinarStage`, `getRecordings`, `getAttendedMembers`, `attendedMemberNotification`, `getCommonEvents`.

**Public methods (`p`-prefixed):** `pGetUpcomingEvents`, `pGetRandomPastEvents`, `pGetCommunityEvents`, `pGetEvent`, `pGetEventVolunteers`, `getPolls`, `getSpeakersList`, `getTechSessions`, `getEventsList`, `getSocialResources`, `pGetEventsInterestedMembers`, `pGetSpeakerEdfegList`.

---

## Model — `IEvent`

Notable fields: `id`, `name`, `description`, `header_image` / `header_image_path`, `start_time`, `end_time`, `start_date?`, `timezone`, `slug`, `seats`, `event_status` (`IEventStatus`), `event_type` (`EEventType`), `custom_registration`, `custom_agenda`, `editable`, `tags` (`ITag[]`), `kommunity_id`, `kommunity_slug`, `kommunity?`, `community?`, `collaboration_communities` (`ICommunity[]`), `event_locations?` (`ILocation[]`), and counts: `event_locations_count`, `event_speakers_count`, `event_volunteers_count`, `interested_members_count`, `registrations_count?`, `attended_members_count?`.

```ts
export enum EEventType {
  OFFLINE = 'offline',
  ONLINE = 'online',
}
```

`IEventSearch extends IEvent { type: string }`.

---

## Backend API routes (`API_ROUTES.EVENTS`)

**Admin:** `CREATE`, `UPDATE`, `GET` (`api/v2/events`), `CLONE`, `COMMUNITY_EVENTS_FOR_EMAIL`, `UPDATE_STATUS`, `UPDATE_CUSTOM_REGISTRATION`, `UPDATE_CUSTOM_AGENDA`, `UPDATE_HEADER_IMAGE`, `DELETE_HEADER_IMAGE`, `EMBEDDED_VIDEO_STREAM_PAST_VISITORS`, `EMBEDDED_VIDEO_STREAM_VISITORS`, `INVITE_GUEST_TO_WEBINAR_STAGE`, `RECORDINGS`, `ATTENDED_MEMBERS`, `ATTENDED_MEMBERS_NOTIFICATION`, `COMMON_EVENTS`, `IS_MEMBER_OF_ALL_COLLABORATING_COMMUNITIES`.

**Public (`EVENTS.PUBLIC`):** `EVENTS_LIST` (`api/v2/events/public`), `GET` (`.../show`), `VOLUNTEERS`, `INDEX_BY_COMMUNITY`, `UPCOMING`, `RANDOM_PAST`, `POLLS`, `SPEAKERS_LIST`, `TECH_SESSIONS`, `SOCIAL_RESOURCES`, `INTERESTED_MEMBERS`, `SPEAKER_EDFEG_LIST`.

**Related:** `API_ROUTES.STATS.EVENTS.*` (unique visitors, registrations, attendees, discussions, polls, speakers, member stats), `API_ROUTES.COMMUNITY_GROUPS.EVENTS` / `.PUBLIC.EVENTS`.

> Registration form / data-form / discount-coupon / track-slot sub-features use their own route groups (e.g. `data_form_entity_response_groups`) beyond the `EVENTS` namespace.
