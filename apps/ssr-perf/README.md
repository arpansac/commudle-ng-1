# ssr-perf (k6 via Docker)

This Nx project runs a simple SSR performance + error sanity check against **production** pages using **k6** in Docker.

What it checks:

- Basic timings (TTFB via k6 `http_req_waiting`, total duration via `http_req_duration`)
- SSR error signals (fail on 5xx, empty body, and common stack-trace patterns in HTML)
- Per-URL (per path) p95 metrics via custom k6 metrics (exported to `report.json`/`report.html`)

## Configure

Edit `apps/ssr-perf/k6/config.js`:

- `baseUrl` (production)
- `paths` (list of pages)
- optional: `userAgent`, `vus`, `duration`, `timeoutMs`, `budgets`

Default load profile is set for more meaningful per-URL percentiles:

- `vus: 7`
- `duration: 2m`

## Run

- Basic run:
  - `npx nx run ssr-perf:run`

Notes:

- If you don’t have a global `nx` binary, use `npx nx ...` (recommended).
- Docker is required (we run `grafana/k6`).

Outputs:

- `apps/ssr-perf/out/summary.json` (full k6 summary export)
- `apps/ssr-perf/out/report.json` (curated per-URL metrics + check pass/fail counts)
- `apps/ssr-perf/out/report.html` (pretty report, Tailwind via CDN)

## Budgets (optional)

Budgets are enforced by the same `run` command.

- Set `budgets.ttfbP95Ms` and/or `budgets.durationP95Ms` in `apps/ssr-perf/k6/config.js`.
- Run:
  - `npx nx run ssr-perf:run`

How budgets work:

- When `ttfbP95Ms > 0`, k6 enforces `http_req_waiting p(95) < ttfbP95Ms`.
- When `durationP95Ms > 0`, k6 enforces `http_req_duration p(95) < durationP95Ms`.
- Using `0` disables that budget.

## Viewing the report

- Run `npx nx run ssr-perf:run` first (this generates the report files).
- Open `apps/ssr-perf/out/report.html` in a browser.
- If you want to tweak the layout, edit the template (placeholders like `{{BASE_URL}}` are expected here):
  - `apps/ssr-perf/k6/report.template.html`

## Interpreting per-URL metrics

In `report.html`/`report.json`, each path includes:

- **TTFB p95**: time until the server starts responding. High values often point to SSR/render work or upstream calls.
- **Duration p95**: end-to-end time (includes redirects and transfer).
- **5xx rate**: hard failures (SSR/server errors).
- **Error-body rate**: responses that look like they contain stack traces / server error text.

Sampling model (important):

- The test hits **one URL per iteration** (round-robin across `paths`).
- This ensures each URL gets many samples during a 2–5 minute run.
- In `report.json`, `duration.count` / `ttfb.count` is the sample count for that URL (higher is better for percentile stability).

Notes:

- We can’t directly read Node/SSR server logs in production from this test. Instead, we infer SSR failures from response codes and common stack-trace patterns in the HTML response.
- If you later add a server header (e.g. `Server-Timing: ssr;dur=...`) or an internal health endpoint, we can make the “Node SSR error” signal much more reliable.
