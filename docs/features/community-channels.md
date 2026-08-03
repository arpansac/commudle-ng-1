# Community Channels

Community Channels are real-time text channels inside a community or hackathon. Members can chat, post messages, pin content, and manage members. The same module powers channels inside both communities and hackathons.

- Module: `apps/commudle-admin/src/app/feature-modules/community-channels/`
- Service: `apps/commudle-admin/src/app/feature-modules/community-channels/services/community-channels.service.ts`
- Shared service: `libs/shared/services/src/lib/community-channels.service.ts`
- Model: `libs/shared/models/src/lib/community-channel.model.ts` (`ICommunityChannel`, exported via `@commudle/shared-models`)
- API routes: `API_ROUTES.COMMUNITY_CHANNELS` in `libs/shared/services/src/lib/api-routes.constant.ts`

Channels belong to a parent (`parent_type: EDbModels` — `Kommunity` or `Hackathon`). Real-time messaging is handled via **AnyCable** WebSocket subscriptions in `CommunityChannelDiscussionChannel`.

---

## URL structure

| Context             | Path pattern                                                                                        | Notes                    |
| ------------------- | --------------------------------------------------------------------------------------------------- | ------------------------ |
| Community admin     | `/admin/communities/:community_id/channels/:community_channel_id`                                   | Admin control panel tab  |
| Community public    | `/communities/:community_id/channels/:community_channel_id`                                         | Public channel view      |
| Hackathon admin     | `/admin/communities/:community_id/hackathon-dashboard/:hackathon_id/channels/:community_channel_id` | Inside hackathon CP      |
| Hackathon public    | `/communities/:community_id/hackathons/:hackathon_id/channels/:community_channel_id`                | Public hackathon channel |
| Join by token       | `.../channels/join/:token`                                                                          |                          |
| Join by email token | `.../channels/email-join/:email_token`                                                              |                          |

---

## Sub-features

- **Channel CRUD** — `CREATE`, `UPDATE`, `DELETE`; logo upload/delete (`DELETE_LOGO`); archive/unarchive.
- **Categories & groups** — channels can have a `group_name` for grouping; `GET_CATEGORIES`, `SHOW_CATEGORY`, `INDEX_FORUMS` (forum-type channels).
- **Real-time messaging** — `DISCUSSION_MESSAGES` (load history), `DISCUSSION_MESSAGES_SCROLL` (paginated scroll); live updates via AnyCable `CommunityChannelDiscussionChannel`.
- **Message pinning** — `PINNING_MESSAGES.PIN`, `.UNPIN`, `.PINNED_MESSAGES`; `pin_message`, `unpin_message`.
- **Member management** — `MEMBERS.INDEX`, `.INVITE` (invite by email), `.JOIN_BY_TOKEN`, `.TOGGLE_ADMIN`, `.REMOVE`, `.EXIT_CHANNEL`.
- **Join flows** — join by token (`JOIN_TOKEN`, `RESET_JOIN_TOKEN`), join by email token; `JOIN_CHANNEL` (direct join).
- **Channel admins** — `GET_CHANNEL_ADMINS`.
- **Taggable users** — `TAGGABLE_USERS` (@ mention suggestions).
- **Default channel** — `GET_DEFAULT_CHANNEL` returns the community's default channel for a user.
- **Email blast** — `SEND_MESSAGE_BY_EMAIL_TO_ALL_MEMBERS`.
- **User channel communities** — `USER_CHANNEL_COMMUNITIES` returns communities the current user has channels in.
- **Private / read-only** — `is_private`, `is_readonly` flags on `ICommunityChannel`.
- **Display types** — `display_type` controls rendering mode (channel vs forum vs Q&A).

---

## Service — `CommunityChannelsService`

`getChannels`, `getUserChannelCommunities`, `getChannelCategories`, `showCategory`, `createChannel`, `getChannel`, `getChannelByToken`, `updateChannel`, `deleteChannel`, `archiveChannel`, `unarchiveChannel`, `getJoinToken`, `resetJoinToken`, `getChannelAdmins`, `getDefaultChannel`, `joinChannel`, `getDiscussionMessages`, `getDiscussionMessagesPaginated`, `sendMessageByEmailToAllMembers`, `pinMessage`, `unpinMessage`, `getPinnedMessages`, `getMembers`, `inviteMember`, `joinByToken`, `toggleAdmin`, `removeMembership`, `exitChannel`, `indexForums`.

---

## Model — `ICommunityChannel`

`id`, `slug`, `name`, `description`, `group_name`, `display_type`, `join_token`, `is_private`, `is_readonly`, `default`, `logo`, `member_count`, `members_count`, `messages_count?`, `messages_count_in_three_months?`, `discussion_id`, `parent_type` (`EDbModels`), `parent` (`ICommunity | IHackathon`), `kommunity_id`, `kommunity? { id, name }`, `user` (`IUser` — creator), `my_roles`, `latest_message?` (`IUserMessage`), `created_at`.

```ts
enum EDiscussionType {
  CHANNEL = 'channel',
  FORUM = 'forum',
}
```

---

## Backend API routes (`API_ROUTES.COMMUNITY_CHANNELS`)

`INDEX`, `INDEX_FORUMS`, `SHOW_CATEGORY`, `CREATE`, `SHOW`, `UPDATE`, `DELETE`, `JOIN_TOKEN`, `RESET_JOIN_TOKEN`, `TAGGABLE_USERS`, `DELETE_LOGO`, `JOIN_CHANNEL`, `DISCUSSION_MESSAGES`, `DISCUSSION_MESSAGES_SCROLL`, `SEND_MESSAGE_BY_EMAIL_TO_ALL_MEMBERS`, `GET_DEFAULT_CHANNEL`, `GET_CATEGORIES`, `GET_CHANNEL_ADMINS`, `USER_CHANNEL_COMMUNITIES`, `SHOW_BY_TOKEN`, `PINNING_MESSAGES.PIN/UNPIN/PINNED_MESSAGES`, `MEMBERS.*` (INDEX/INVITE/JOIN_BY_TOKEN/TOGGLE_ADMIN/REMOVE/EXIT_CHANNEL).

**Related:** `API_ROUTES.COMMUNITY_GROUPS.COMMUNITY_CHANNELS`; `API_ROUTES.COMMUNITY_GROUPS.PUBLIC.COMMUNITY_CHANNELS`; `API_ROUTES.DISCUSSIONS.*` (real-time message management).
