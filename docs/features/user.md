# User / Profile

The User feature covers authentication, public profile pages, profile editing, social interactions (follow/unfollow), content listings (labs, community builds, speaker sessions), and account settings.

- Profile page module: `apps/commudle-admin/src/app/feature-modules/user-profile/`
- Profile edit / settings: within `user-profile` or `users` components
- Service: `apps/commudle-admin/src/app/services/user.service.ts` (also `libs/shared/services/src/lib/user.service.ts`)
- Model: `libs/shared/models/src/lib/user.model.ts` (`IUser`, exported via `@commudle/shared-models`)
- API routes: `API_ROUTES.USERS` in `libs/shared/services/src/lib/api-routes.constant.ts`

---

## URL structure

| Side          | Base path      | Notes                      |
| ------------- | -------------- | -------------------------- |
| Public        | `/u/:username` | `UserProfileModule` (lazy) |
| Auth/settings | `/auth/...`    | Login / registration flows |

---

## Public profile

Shell: `UserProfileComponent`. Resolver: `UserProfileResolver` (fetches by `:username`).

### Routes (under `/u/:username`)

| Path               | Component                      | Purpose                          |
| ------------------ | ------------------------------ | -------------------------------- |
| `` (index)         | `UserProfileAboutComponent`    | About, bio, skills, social links |
| `builds`           | `UserCommunityBuildsComponent` | User's community builds          |
| `labs`             | `UserLabsComponent`            | User's labs                      |
| `badges`           | `UserBadgesComponent`          | Earned badges                    |
| `social-resources` | `UserSocialResourcesComponent` | Talks, articles, resources       |
| `posts`            | `UserPostsComponent`           | User posts/feed                  |

### Sub-features

- **Shell** — `UserProfileComponent`: avatar, name, username, designation, location, socials, follow/unfollow button, mutual connections preview, profile completion indicator.
- **About** — bio, skills (tags), experience level, domain, goals, links.
- **Builds / Labs** — paginated lists of published community builds and labs.
- **Social Resources** — speaker sessions, articles, talks.
- **Badges** — earned platform badges.
- **Follow system** — `toggleFollow`, `checkFollowee`, `followers`, `followees` (with counts).
- **Recap stats** — `RECAP_STATS` — yearly summary of contributions.

---

## Profile editing

Accessible via the top-nav avatar → settings or `/settings`.

### Sub-features

- **Profile form** — `UPDATE_PROFILE`: name, about_me, designation, location, gender, company_name, looking_for_work, hiring, personal_website, socials.
- **Tags / Skills** — `TAGS` (update skill tags).
- **Username** — `CHECK_USERNAME` + `SET_USERNAME`.
- **Banner image** — `PROFILE_BANNER_IMAGE`.
- **Employer / Employee roles** — `TOGGLE_EMPLOYER_ROLE`, `TOGGLE_EMPLOYEE_ROLE`.
- **Communication preferences** — `UPDATE_COMMUNICATION_PREFERENCES`.
- **Email unsubscribe groups** — `EMAIL_UNSUBSCRIBE_GROUPS`.
- **Deactivate account** — `DEACTIVATE_PROFILE`.
- **Profile completion** — `PROFILE_COMPLETION_STATUS` gauge.

---

## Service — `UserService`

`getProfile`, `getProfileDetails`, `updateProfile`, `checkUsername`, `setUsername`, `getMyRoles`, `getCommunities`, `getMyLabs`, `getMyCommunityBuilds`, `getLabs`, `getCommunityBuilds`, `getBadges`, `getSpeakerResources`, `getSpeakerSessionsDelivered`, `getSocialResources`, `toggleFollow`, `checkFollowee`, `updateTags`, `updateProfileBannerImage`, `getPosts`, `createPost`, `deletePost`, `getFollowers`, `getFollowees`, `getEmailUnsubscribeGroups`, `getMiniProfile`, `toggleEmployerRole`, `toggleEmployeeRole`, `updateCommunicationConsent`, `deactivateProfile`, `getEventsAttended`, `getProfileStats`, `getUserByEmail`, `getMyRegistrations`, `getRecapStats`, `getValidGoals`, `getProfileCompletionStatus`, `getSpeakerJudgeMentor`, `getParticipatedAndWon`, `getPublicProfileStats`.

---

## Model — `IUser`

`id`, `name`, `email`, `username`, `about_me`, `designation`, `company_name`, `location`, `gender`, `experience_level`, `user_domain`, `photo`, `profile_banner_image`, `avatar`, socials (`linkedin`, `github`, `twitter`, `dribbble`, `behance`, `medium`, `gitlab`, `facebook`, `youtube`, `instagram`, `personal_website`), `tags` (`ITag[]`), `badges` (`IBadge[]`), `is_expert`, `is_community_leader`, `is_employee`, `is_employer`, `looking_for_work?`, `hiring?`, `profile_completed`, `deactivated`, `blocked`, counts: `followers_count`, `followees_count`, `speaker_events_count`, `community_builds_count?`, `published_community_builds_count?`, `labs_count?`, `published_labs_count?`, `social_resources_count?`, `communities_count?`, `work_experience_months`, `goals`, `user_roles`, `user_roles_users?`, `has_social_resources`, `has_community_builds`, `has_labs`, `has_upcoming_talk`, `phone`, `phone_country_code`, `total_builds_votes?`, `total_labs_votes?`, `distance_from_current_user`, `user_mutuals { mutual_followees_preview, mutual_followees }`, `created_at`.

```ts
enum EExperienceLevel { high_school | undergrad | beyond_grad | getting_started | arrived | finding_expertise | seasoned | senior | expert }
enum EDomain { software_developemnt | product_management | cloud_and_devOps | ui_ux_design | data_science_ai | cybersecurity | testing | devRel_and_community | hardware_and_iot }
```

---

## Backend API routes (`API_ROUTES.USERS`)

`GET_PROFILE`, `PROFILE_DETAILS`, `UPDATE_PROFILE`, `CHECK_USERNAME`, `SET_USERNAME`, `GET_MY_ROLES`, `COMMUNITIES`, `MY_LABS`, `MY_COMMUNITY_BUILDS`, `LABS`, `COMMUNITY_BUILDS`, `BADGES`, `SPEAKER_RESOURCES`, `SPEAKER_SESSIONS_DELIVERED`, `SOCIAL_RESOURCES`, `TOGGLE_FOLLOW`, `CHECK_FOLLOWEE`, `TAGS`, `PROFILE_BANNER_IMAGE`, `POSTS.*` (INDEX/CREATE/DESTROY), `FOLLOWERS`, `FOLLOWEES`, `EMAIL_UNSUBSCRIBE_GROUPS`, `MINI_PROFILE`, `TOGGLE_EMPLOYER_ROLE`, `TOGGLE_EMPLOYEE_ROLE`, `UPDATE_COMMUNICATION_PREFERENCES`, `DEACTIVATE_PROFILE`, `EVENTS_ATTENDED`, `PROFILE_STATS`, `GET_USER_BY_EMAIL`, `MY_REGISTRATIONS`, `RECAP_STATS`, `VALID_GOALS`, `PROFILE_COMPLETION_STATUS`, `SPEAKER_JUDGE_MENTOR`, `PARTICIPATED_AND_WON`, `PUBLIC_PROFILE_STATS`.
