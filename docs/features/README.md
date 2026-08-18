# Feature Documentation

Developer documentation for Commudle's main features. Each file covers both the **admin** and **public** sides: URL structure, routes, sub-features, services, models, and backend API routes.

## Features

| Feature            | Doc                                              | Summary                                                                                                                                                                |
| ------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Events             | [events.md](./events.md)                         | Create, configure, and run online/offline events; registrations, agenda, sponsors, speakers, entry/exit passes, streaming, and the public event page.                  |
| Community          | [community.md](./community.md)                   | Community (backend: Kommunity) admin control panel and public profile — events, members, team/roles, channels, forums, payments, newsletters, custom pages, and stats. |
| Community Group    | [community-group.md](./community-group.md)       | Umbrella organization (mounted at `/orgs`) grouping multiple communities — member communities, events, leaders, channels/forums, custom pages, and public activity.    |
| Hackathon          | [hackathon.md](./hackathon.md)                   | Full hackathon lifecycle — create, configure, applications, rounds, judging, tracks, prizes, sponsors, mentors, and public participation pages.                        |
| User / Profile     | [user.md](./user.md)                             | Public profile pages, profile editing, follow system, content listings (labs, builds, speaker sessions), badges, and account settings.                                 |
| Community Channels | [community-channels.md](./community-channels.md) | Real-time text channels inside communities and hackathons — messaging, member management, join flows, pinning, and AnyCable WebSocket integration.                     |
| Forums             | [forums.md](./forums.md)                         | Community discussion boards built on top of channels — categories, topic threads, message replies, and deep linking.                                                   |
