---
inclusion: always
---

# Cross-Project Integration (Frontend ↔ Backend)

Commudle is built as two sibling projects that must stay in sync. When a feature
touches data, it almost always spans both.

## The Two Projects

| Project         | Role                    | Stack                    | Path                                                |
| --------------- | ----------------------- | ------------------------ | --------------------------------------------------- |
| **commudle-ng** | Frontend (this project) | Angular 19 (Nx monorepo) | `/Users/arshdeepsingh/Desktop/commudle/commudle-ng` |
| **gdgapp**      | Backend API             | Ruby on Rails            | `/Users/arshdeepsingh/Desktop/commudle/gdgapp`      |

The frontend consumes the backend's RESTful JSON API (v2) at `commudle.com`.

## When a Feature Spans Both Projects

A typical full-stack feature flows backend → frontend:

### Backend (gdgapp) — do this first

1. **Migration** — generate via `bundle exec rails generate migration ...` (never hand-write)
2. **Model** — add fields, validations, associations; update schema annotation comment
3. **Controller** — add/modify action in `app/controllers/api/v2/*_api_controller.rb`, permit params, set permissions
4. **Serializer** — expose new fields in `app/serializers/v2/...`
5. **Route** — register in `config/routes/api_v2.rb`

### Frontend (commudle-ng) — do this after

6. **API route constant** — add to `libs/shared/services/src/lib/api-routes.constant.ts` under `API_ROUTES`
7. **Model interface** — update the matching `IModel` in `libs/shared/models` or `apps/shared-models`
8. **Service** — add the HTTP method in the relevant `*.service.ts`
9. **Component** — wire up the UI

## The API Contract Is the Link

The two projects connect through the HTTP contract. Keep these mirrored:

| Frontend                                               | Backend                                                           |
| ------------------------------------------------------ | ----------------------------------------------------------------- |
| `API_ROUTES.HACKATHONS.UPDATE` → `'api/v2/hackathons'` | `config/routes/api_v2.rb` → `put '', to: 'hackathons_api#update'` |
| `IHackathon` interface field                           | Serializer `attributes` list                                      |
| Service method params                                  | Controller permitted params                                       |

When you change a backend serializer attribute, update the frontend interface.
When you add a backend route, add the matching `API_ROUTES` constant.

## Field Naming

- Backend (Rails) uses `snake_case` for columns and JSON keys.
- Frontend interfaces mirror the **same `snake_case` keys** (e.g. `allow_problem_statement_change`), not camelCase, because they map directly to the JSON response.

## Rules

- Always update the backend serializer AND the frontend interface together — a field exposed in one but not the other is a silent bug.
- A new backend route needs a matching `API_ROUTES` constant before the frontend service can use it.
- Follow each project's own conventions (this project's other steering files for Angular; gdgapp's `.amazonq/rules/` for Rails).
- Respect the focused-changes rule: only touch what the task requires in each project.
