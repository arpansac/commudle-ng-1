# Hackathon

The Hackathon feature lets community organizers create and manage hackathons (team or individual, online/offline/hybrid), and lets the public discover, register, and participate in them. It is split into an **admin control panel** and a **public** experience.

- Admin module: `apps/commudle-admin/src/app/feature-modules/hackathon-control-panel/`
- Public module: `apps/commudle-admin/src/app/feature-modules/public-hackathon/`
- Service: `apps/commudle-admin/src/app/services/hackathon.service.ts`
- Model: `libs/shared/models/src/lib/hackathon.model.ts` (`IHackathon`, exported via `@commudle/shared-models`)
- API routes: `API_ROUTES.HACKATHONS` in `libs/shared/services/src/lib/api-routes.constant.ts`

A hackathon belongs to a community (`community_id`) and optionally to a community group. Admin routes are nested under `/admin/communities/:community_id/hackathon-dashboard`.

---

## URL structure

| Side   | Base path                                              | Mounted module                                    |
| ------ | ------------------------------------------------------ | ------------------------------------------------- |
| Admin  | `/admin/communities/:community_id/hackathon-dashboard` | `HackathonControlPanelModule` (lazy, `AuthGuard`) |
| Public | `/communities/:community_id/hackathons/:hackathon_id`  | `PublicHackathonModule` (lazy)                    |

---

## Admin (control panel)

Routing: `hackathon-control-panel.routing.ts`. Shell: `HackathonControlPanelDashboardComponent` (sidebar layout).

### Routes

| Path (under `hackathon-dashboard`)              | Component                                          | Purpose                       |
| ----------------------------------------------- | -------------------------------------------------- | ----------------------------- |
| `new`                                           | `HackathonNewFormComponent`                        | Create a hackathon            |
| `:hackathon_id` (index)                         | `HackathonControlPanelBasicFormComponent`          | Basic info & settings         |
| `:hackathon_id/contact`                         | `HackathonControlPanelContactDetailsFormComponent` | Contact details               |
| `:hackathon_id/dates`                           | `HackathonControlPanelDatesFormComponent`          | Application & hackathon dates |
| `:hackathon_id/sponsors`                        | `HackathonControlPanelSponsorComponent`            | Sponsor management            |
| `:hackathon_id/tracks`                          | `HackathonControlPanelTracksPrizesComponent`       | Tracks & prizes               |
| `:hackathon_id/tracks/prizes`                   | `HackathonControlPanelPrizeComponent`              | Prize management              |
| `:hackathon_id/speakers`                        | `HackathonControlPanelSpeakerJudgeComponent`       | Speakers & judges             |
| `:hackathon_id/mentors`                         | `HackathonControlPanelMentorsComponent`            | Mentors                       |
| `:hackathon_id/mentor-slots`                    | `HackathonControlPanelMentorSlotsComponent`        | Mentor booking slots          |
| `:hackathon_id/faqs`                            | `HackathonControlPanelFaqsComponent`               | FAQs                          |
| `:hackathon_id/registrations`                   | `HackathonControlPanelRegistrationsComponent`      | Registration form config      |
| `:hackathon_id/updates`                         | `HackathonControlPanelUpdatesComponent`            | Post updates                  |
| `:hackathon_id/applications-dashboard`          | `HackathonControlPanelReviewComponent`             | Review & manage applications  |
| `:hackathon_id/rounds`                          | `HackathonControlPanelRoundsComponent`             | Judging rounds                |
| `:hackathon_id/collaboration`                   | `HackathonCollaborationCommunitiesComponent`       | Collaborating communities     |
| `:hackathon_id/emails`                          | `HackathonControlPanelEmailsComponent`             | Send emails to participants   |
| `:hackathon_id/channels`                        | `HackathonControlPanelChannelsComponent`           | Hackathon channels            |
| `:hackathon_id/stats`                           | `HackathonControlPanelOverallStatsComponent`       | Overall stats                 |
| `:hackathon_id/stats/emails`                    | `HackathonControlPanelEmailStatsComponent`         | Email stats                   |
| `:hackathon_id/score-dashboard`                 | `HackathonScoreDashboardComponent`                 | Scoring dashboard             |
| `:hackathon_id/entry-pass-scan`                 | `HackathonEntryPassScanComponent`                  | QR entry pass scanning        |
| `:hackathon_id/entry-pass-scan/checked-in-list` | `HackathonCheckedInListComponent`                  | Checked-in list               |

### Sub-features

- **CRUD** — basic form, contact details, dates; `updateHackathonStatus` (draft → open → completed → canceled).
- **Tracks & Prizes** — create/update/delete tracks (`createTrack`, `updateTrack`, `indexTracks`); prizes per track (`createTrackPrize`, `getPrizesByHackathon`).
- **Sponsors** — `createSponsor`, `updateSponsor`, `indexSponsors`, `deleteSponsor`; grouped by tier.
- **Judges & Speakers** — `createJudge`, `indexJudge`, `updateJudge`, `deleteJudge`; duplicate check.
- **Mentors & slots** — `HackathonControlPanelMentorsComponent`, `HackathonControlPanelMentorSlotsComponent`.
- **Registrations** — `HackathonControlPanelRegistrationsComponent` with data-form config.
- **Applications dashboard** — `HackathonControlPanelReviewComponent`; review, shortlist, reject; `hackathonSendTeamStatusEmailByFilter`.
- **Rounds** — `HackathonControlPanelRoundsComponent`; round-based evaluation; `OverallRoundSelectionUpdateEmail`.
- **Emails** — invite by email (`inviteUserByEmail`); winner announcement email (`WinnerAnnouncementEmail`).
- **Stats** — registrations, gender distribution, email stats; `HackathonControlPanelStatsComponent`.
- **Entry pass** — `HackathonEntryPassScanComponent`, `HackathonCheckedInListComponent`.
- **Problem statements** — `toggleAllowProblemStatementChange`, `indexProblemStatements`.

---

## Public

Routing: `public-hackathon.routing.ts`. Shell: `PublicHackathonHomepageComponent`. Resolver: `CommunityDetailsResolver` + `HackathonDetailsResolver`.

### Routes

| Path (under `hackathons/:hackathon_id`)                                          | Component                                  | Purpose                                                          |
| -------------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------- |
| `` (index)                                                                       | `PublicHackathonDetailsComponent`          | Landing page / about                                             |
| `schedule`                                                                       | `PublicHackathonScheduleComponent`         | Event schedule                                                   |
| `tracks`                                                                         | `PublicHackathonTracksComponent`           | Tracks & problem statements                                      |
| `judges`                                                                         | `PublicHackathonJudgesComponent`           | Judges list                                                      |
| `prizes`                                                                         | `PublicHackathonPrizesComponent`           | Prize details                                                    |
| `winners`                                                                        | `PublicHackathonWinnersComponent`          | Winners                                                          |
| `projects`                                                                       | `PublicHackathonProjectsComponent`         | Submitted projects                                               |
| `channels` (+ `:community_channel_id`, `join/:token`, `email-join/:email_token`) | `PublicHackathonChannelsComponent`         | Hackathon channels                                               |
| `user-dashboard`                                                                 | `PublicHackathonUserDashboardComponent`    | Participant dashboard (`AuthGuard + HackathonRegistrationGuard`) |
| `mentor-dashboard`                                                               | `PublicHackathonMentorDashboardComponent`  | Mentor dashboard (`AuthGuard`)                                   |
| `judge-dashboard`                                                                | `PublicHackathonMentorDashboardComponent`  | Judge dashboard (`AuthGuard`)                                    |
| `fill-form/:hackathon_response_group_id`                                         | `PublicHackathonFormComponent`             | Registration form (`AuthGuard`)                                  |
| `fill-form/:hackathon_response_group_id/submitted`                               | `PublicHackathonFormConfirmationComponent` | Form submitted confirmation                                      |

---

## Service — `HackathonService`

`updateHackathon`, `toggleAllowProblemStatementChange`, `showHackathon`, `createHackathonContactInfo`, `updateHackathonContactInfo`, `showHackathonContactInfo`, `updateHackathonDates`, `createSponsor`, `updateSponsor`, `indexSponsors`, `deleteSponsor`, `createTrack`, `updateTrack`, `indexTracks`, `indexProblemStatements`, `createTrackPrize`, `updateTrackPrize`, `getPrizesByTrack`, `getPrizesByHackathon`, `check_duplicate_judge`, `createJudge`, `updateJudge`, `deleteJudge`, `indexJudge`, `indexUserResponses`, `hackathonSendTeamStatusEmailByFilter`, `getHackathonCurrentRegistrationDetails`, `updateHackathonStatus`, `inviteUserByEmail`, `OverallRoundSelectionUpdateEmail`, `WinnerAnnouncementEmail`.

---

## Model — `IHackathon`

`id`, `name`, `slug`, `description`, `hackathon_theme`, `tagline`, `participate_types` (`EParticipateTypes`), `hackathon_location_type` (`EHackathonLocationType`), `status` (`EHackathonStatus`), `banner_image`, `start_date`, `end_date`, `application_start_date`, `application_end_date`, `timezone`, `location_id/name/address/map_link`, `number_of_participants`, `min/max_number_of_teammates`, counts: `updates_count`, `prizes_count`, `faqs_count`, `sponsors_count`, `tracks_count`, `judges_count`, `projects_count`, `winners_count?`, `hackathon_collaboration_communities_count?`, `interested_members_count?`, `allow_problem_statement_change?`, `tags?`, `community`, `community_group`, `total_prize_amount`.

```ts
enum EHackathonStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}
enum EParticipateTypes {
  TEAM = 'team',
  INDIVIDUAL = 'individual',
}
enum EHackathonLocationType {
  OFFLINE = 'offline',
  ONLINE = 'online',
  HYBRID = 'hybrid',
}
```

---

## Backend API routes (`API_ROUTES.HACKATHONS`)

`CREATE`, `UPDATE`, `SHOW`, `CREATE_CONTACT_INFO`, `UPDATE_CONTACT_INFO`, `SHOW_CONTACT_INFO`, `UPDATE_HACKATHON_DATE`, `CREATE_SPONSOR`, `INDEX_SPONSORS`, `CREATE_TRACK`, `UPDATE_TRACK`, `INDEX_TRACKS`, `INDEX_PRIZES`, `CREATE_JUDGE`, `INDEX_JUDGES`, `INDEX_PROBLEM_STATEMENTS`, `INDEX_USER_RESPONSES`, `INVITE_USER`, `OVERALL_ROUND_SELECTION_UPDATE_EMAIL`, `WINNER_ANNOUNCEMENT_EMAIL`, `UPDATE_STATUS`.

**Public (`HACKATHONS.PUBLIC`):** `INDEX`, `SHOW`, `INTERESTED_USERS`, `INDEX_WINNERS`, `INDEX_PROJECTS`, `IS_MEMBER_OF_PARENT`, `HACKATHONS`.

**Related:** `API_ROUTES.STATS.HACKATHONS.*` (gender, hackathon_team); `API_ROUTES.COMMUNITY_GROUPS.PUBLIC.HACKATHONS`.
