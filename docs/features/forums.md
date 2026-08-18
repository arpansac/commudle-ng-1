# Forums

Forums are community discussion boards — structured conversations organized into categories and topics. They are implemented on top of the **Community Channels** infrastructure (channels with `display_type: 'forum'`) and use the same AnyCable real-time messaging backend.

- Module: `apps/commudle-admin/src/app/feature-modules/forums/`
- Service: uses `CommunityChannelsService` + `DiscussionsService`
- Model: `ICommunityChannel` (`display_type: 'forum'`) + `IUserMessage` for posts/replies
- API routes: `API_ROUTES.COMMUNITY_CHANNELS.INDEX_FORUMS`, `API_ROUTES.DISCUSSIONS.*`

Forums are lazy-loaded inside both community and hackathon routing:

```
{ path: 'forums', loadChildren: () => ForumsModule }
```

---

## URL structure

| Context                | Path                                               | Notes                         |
| ---------------------- | -------------------------------------------------- | ----------------------------- |
| Community admin/public | `/communities/:community_id/forums/...`            | Lazy-loaded `ForumsModule`    |
| Hackathon admin/public | `.../hackathon-dashboard/:hackathon_id/forums/...` | Same module, hackathon parent |

---

## Routes (within `ForumsModule`)

Routing: `forums.routing.ts`. Shell: `ForumsDashboardComponent`.

| Path (within `forums/`)                         | Component                   | Purpose                                                              |
| ----------------------------------------------- | --------------------------- | -------------------------------------------------------------------- |
| `` (index)                                      | `ForumsCategoriesComponent` | All forum categories                                                 |
| `:category_slug`                                | `ForumsByCategoryComponent` | Topics in a category                                                 |
| `:category_slug/:topic_slug`                    | `ForumDiscussionComponent`  | Topic thread view (resolved by `ForumDiscussionResolver`)            |
| `:category_slug/:topic_slug/:user_message_slug` | `ForumMessagesComponent`    | Individual message / replies (resolved by `ForumDiscussionResolver`) |

---

## Sub-features

- **Categories** — `ForumsCategoriesComponent`: lists forum channels grouped by category (`group_name`). Uses `API_ROUTES.COMMUNITY_CHANNELS.INDEX_FORUMS` + `GET_CATEGORIES`.
- **Topics by category** — `ForumsByCategoryComponent`: topics (channels) within a selected category. Uses `SHOW_CATEGORY`.
- **Discussion thread** — `ForumDiscussionComponent`: real-time paginated message thread. Resolved via `ForumDiscussionResolver` which fetches the discussion by channel/topic slug. Uses `DISCUSSION_MESSAGES` + `DISCUSSION_MESSAGES_SCROLL`.
- **Message view** — `ForumMessagesComponent`: shows a specific message and its replies. Anchor linking for deep links.
- **Posting / replies** — new forum posts and replies go through the AnyCable `CommunityChannelDiscussionChannel` WebSocket. REST fallback: `API_ROUTES.DISCUSSIONS.PUBLIC_FORUM_MESSAGES`.
- **Pinning** — `PINNING_MESSAGES.PIN/UNPIN/PINNED_MESSAGES` (moderator action).
- **Access control** — private forum channels respect `is_private`; `my_roles` on `ICommunityChannel` controls create/moderate permissions.

---

## How Forums relate to Channels

Forums are channels with `display_type: EDiscussionType.FORUM`. The backend returns them via:

- `INDEX_FORUMS` — returns only forum-type channels for a community/hackathon
- `SHOW_CATEGORY` — returns channels within a specific category slug
- `GET_CATEGORIES` — returns distinct category names for grouping in the UI

Creating a new forum category = creating a new channel with `display_type: 'forum'` and a `group_name`.

---

## API routes used

| Key                                                           | Endpoint                                                  | Purpose                     |
| ------------------------------------------------------------- | --------------------------------------------------------- | --------------------------- |
| `COMMUNITY_CHANNELS.INDEX_FORUMS`                             | `api/v2/community_channels/index_forums`                  | List all forum channels     |
| `COMMUNITY_CHANNELS.GET_CATEGORIES`                           | `api/v2/community_channels/get_categories`                | Forum category names        |
| `COMMUNITY_CHANNELS.SHOW_CATEGORY`                            | `api/v2/community_channels/show_category`                 | Channels in a category      |
| `COMMUNITY_CHANNELS.DISCUSSION_MESSAGES`                      | `api/v2/community_channels/discussion_messages`           | Load message history        |
| `COMMUNITY_CHANNELS.DISCUSSION_MESSAGES_SCROLL`               | `api/v2/community_channels/discussion_messages_paginated` | Paginated scroll load       |
| `COMMUNITY_CHANNELS.PINNING_MESSAGES.*`                       | `api/v2/community_channels/pin_message` etc.              | Pin/unpin messages          |
| `DISCUSSIONS.PUBLIC_FORUM_MESSAGES`                           | `api/v2/discussions/public_forum_messages`                | Public forum messages       |
| `DISCUSSIONS.PUBLIC_GET_OR_CREATE_FOR_COMMUNITY_CHANNEL_CHAT` | `api/v2/discussions/...`                                  | Get/create forum discussion |

**Related:** `API_ROUTES.COMMUNITY_CHANNELS.*` (channels doc); `API_ROUTES.USER_MESSAGES.*` (message details/replies).
