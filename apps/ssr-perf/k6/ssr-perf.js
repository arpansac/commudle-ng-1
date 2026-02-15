import { check, fail, group } from 'k6';
import http from 'k6/http';
import { Rate, Trend } from 'k6/metrics';

import config from './config.js';

/* global __VU, __ITER */

// k6's open() is only available in the init stage (global scope).
// Template file: apps/ssr-perf/k6/report.template.html
const REPORT_TEMPLATE = open('./report.template.html');

function toInt(value, fallback) {
  const n = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeBaseUrl(baseUrl) {
  // Ensure no trailing slash to avoid accidental double slashes when joining.
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function joinUrl(baseUrl, path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${p}`;
}

const DEFAULT_UA =
  // Googlebot Smartphone UA (commonly used for crawl simulations; UA can be spoofed).
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const cfg = config;

const BASE_URL = (cfg.baseUrl || '').trim();
if (!BASE_URL) {
  fail('Missing baseUrl. Set it in apps/ssr-perf/k6/config.js');
}

const USER_AGENT = (cfg.userAgent || DEFAULT_UA).trim();

const VUS = Number.isFinite(cfg.vus) ? cfg.vus : 1;
const DURATION = (cfg.duration || '30s').trim();
const TIMEOUT_MS = Number.isFinite(cfg.timeoutMs) ? cfg.timeoutMs : 15000;

const BUDGET_TTFB_P95_MS = toInt(cfg?.budgets?.ttfbP95Ms, 0);
const BUDGET_DURATION_P95_MS = toInt(cfg?.budgets?.durationP95Ms, 0);

const baseUrlNormalized = normalizeBaseUrl(BASE_URL);
const paths = Array.isArray(cfg.paths) ? cfg.paths : [];
if (paths.length === 0) {
  fail('No paths configured. Add paths in apps/ssr-perf/k6/config.js');
}

const thresholds = {
  // Always fail on request-level failures (DNS/TCP/HTTP errors reflected by k6).
  http_req_failed: ['rate<0.01'],
};

if (BUDGET_TTFB_P95_MS > 0) {
  thresholds.http_req_waiting = [`p(95)<${BUDGET_TTFB_P95_MS}`];
}

if (BUDGET_DURATION_P95_MS > 0) {
  thresholds.http_req_duration = [`p(95)<${BUDGET_DURATION_P95_MS}`];
}

export const options = {
  vus: VUS,
  duration: DURATION,
  thresholds,
  summaryTrendStats: ['count', 'avg', 'min', 'med', 'max', 'p(90)', 'p(95)'],
};

// Per-page metrics (tagged by { page: '/some-path' })
// NOTE: k6 summary export does not include per-tag percentile breakdowns.
// To get per-URL percentiles in `summary.json`, we create distinct metric names per path.

function simpleHash(input) {
  // Small deterministic hash for metric name suffixes.
  let h = 5381;
  const s = String(input);
  for (let i = 0; i < s.length; i += 1) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  // Convert to unsigned and base36.
  return (h >>> 0).toString(36);
}

function metricIdForPath(path) {
  const raw = String(path || '/');
  const trimmed = raw === '/' ? 'root' : raw.replace(/^\//, '');
  const slug = trimmed
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .toLowerCase();

  const base = slug.length > 0 ? slug : 'root';
  // Keep names reasonably short and collision-resistant.
  const shortBase = base.length > 32 ? base.slice(0, 32) : base;
  return `${shortBase}_${simpleHash(raw)}`;
}

const perPage = {};
for (const path of paths) {
  const id = metricIdForPath(path);
  const durationName = `page_duration_${id}`;
  const ttfbName = `page_ttfb_${id}`;
  const rate5xxName = `page_5xx_rate_${id}`;
  const rateErrorBodyName = `page_error_body_rate_${id}`;
  perPage[String(path)] = {
    durationName,
    ttfbName,
    rate5xxName,
    rateErrorBodyName,
    duration: new Trend(durationName, true),
    ttfb: new Trend(ttfbName, true),
    rate5xx: new Rate(rate5xxName),
    rateErrorBody: new Rate(rateErrorBodyName),
    metricId: id,
  };
}

const SSR_ERROR_BODY_RE =
  /(Internal Server Error|ReferenceError:|TypeError:|SyntaxError:|UnhandledPromiseRejection|Cannot read (properties|property) of|Cannot set (properties|property) of|Error:\s|\n\s*at\s)/;

function safeNumber(n) {
  return Number.isFinite(n) ? n : null;
}

function findGroup(summaryData, groupName) {
  const groups = summaryData?.root_group?.groups;
  if (!Array.isArray(groups)) return null;
  return groups.find((g) => g && g.name === groupName) || null;
}

function normalizeChecks(group) {
  // In summary export, group.checks is an array of { name, passes, fails, ... }
  const checksArr = group?.checks;
  if (!Array.isArray(checksArr)) return {};
  const out = {};
  for (const c of checksArr) {
    if (c?.name) out[c.name] = c;
  }
  return out;
}

function extractPageRows(summaryData) {
  const rows = [];

  for (const page of paths) {
    const pageKey = String(page);
    const m = perPage[pageKey];

    const d = summaryData.metrics?.[m?.durationName]?.values;
    const t = summaryData.metrics?.[m?.ttfbName]?.values;

    const s5xx = summaryData.metrics?.[m?.rate5xxName]?.values;
    const serr = summaryData.metrics?.[m?.rateErrorBodyName]?.values;

    const groupName = `GET ${pageKey}`;
    const group = findGroup(summaryData, groupName);
    const checks = normalizeChecks(group);

    rows.push({
      page,
      checks,
      duration: {
        count: safeNumber(d?.count) ?? null,
        min: safeNumber(d?.min),
        med: safeNumber(d?.med),
        p90: safeNumber(d?.['p(90)']),
        p95: safeNumber(d?.['p(95)']),
        max: safeNumber(d?.max),
        avg: safeNumber(d?.avg),
      },
      ttfb: {
        count: safeNumber(t?.count) ?? null,
        min: safeNumber(t?.min),
        med: safeNumber(t?.med),
        p90: safeNumber(t?.['p(90)']),
        p95: safeNumber(t?.['p(95)']),
        max: safeNumber(t?.max),
        avg: safeNumber(t?.avg),
      },
      rates: {
        rate5xx: safeNumber(s5xx?.rate),
        rateErrorBody: safeNumber(serr?.rate),
      },
    });
  }

  return rows;
}

function fmtMs(n) {
  if (!Number.isFinite(n)) return '—';
  if (n < 1000) return `${n.toFixed(0)} ms`;
  return `${(n / 1000).toFixed(2)} s`;
}

function fmtPct(rate) {
  if (!Number.isFinite(rate)) return '—';
  return `${(rate * 100).toFixed(2)}%`;
}

function replaceAllCompat(input, search, replacement) {
  // Goja (k6 JS engine) support for String.prototype.replaceAll varies by version.
  // split/join is simple and reliable.
  return String(input).split(search).join(replacement);
}

function renderHtmlReport(summaryData) {
  const rows = extractPageRows(summaryData);
  const generatedAt = new Date().toISOString();

  const rowHtml = rows
    .map((r) => {
      const no5xx = r.checks?.['no 5xx'];
      const nonEmpty = r.checks?.['non-empty body'];
      const looksHtml = r.checks?.['looks like html (content-type)'];
      const noStack = r.checks?.['no obvious SSR stack trace in body'];

      const checksSummary = [
        no5xx ? `no5xx: ${no5xx.passes}/${no5xx.passes + no5xx.fails}` : null,
        nonEmpty ? `body: ${nonEmpty.passes}/${nonEmpty.passes + nonEmpty.fails}` : null,
        looksHtml ? `html: ${looksHtml.passes}/${looksHtml.passes + looksHtml.fails}` : null,
        noStack ? `stack: ${noStack.passes}/${noStack.passes + noStack.fails}` : null,
      ]
        .filter(Boolean)
        .join(' · ');

      return `
        <tr class="border-t border-slate-200/70 odd:bg-white even:bg-slate-50/40 hover:bg-slate-100/70 dark:border-slate-800/70 dark:odd:bg-slate-900 dark:even:bg-slate-950/40 dark:hover:bg-slate-800/40">
          <td class="py-2 pr-4 font-mono text-sm">${r.page}</td>
          <td class="py-2 pr-4 text-sm text-slate-700 dark:text-slate-200">${checksSummary || '—'}</td>
          <td class="py-2 pr-4 text-sm">${fmtMs(r.ttfb.p95)}</td>
          <td class="py-2 pr-4 text-sm">${fmtMs(r.duration.p95)}</td>
          <td class="py-2 pr-4 text-sm">${fmtMs(r.duration.max)}</td>
          <td class="py-2 pr-4 text-sm">${fmtPct(r.rates.rate5xx)}</td>
          <td class="py-2 pr-4 text-sm">${fmtPct(r.rates.rateErrorBody)}</td>
        </tr>
      `;
    })
    .join('\n');

  const budgets = cfg?.budgets || {};
  const budgetsLine = `TTFB p95 < ${budgets.ttfbP95Ms || 0} ms, Duration p95 < ${
    budgets.durationP95Ms || 0
  } ms (0 disables)`;

  let html = REPORT_TEMPLATE;
  html = replaceAllCompat(html, '{{GENERATED_AT}}', generatedAt);
  html = replaceAllCompat(html, '{{BASE_URL}}', BASE_URL);
  html = replaceAllCompat(html, '{{VUS}}', String(VUS));
  html = replaceAllCompat(html, '{{DURATION}}', DURATION);
  html = replaceAllCompat(html, '{{TIMEOUT_MS}}', String(TIMEOUT_MS));
  html = replaceAllCompat(html, '{{BUDGETS_LINE}}', budgetsLine);
  html = replaceAllCompat(html, '{{ROWS}}', rowHtml);
  return html;
}

export function handleSummary(data) {
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    vus: VUS,
    duration: DURATION,
    timeoutMs: TIMEOUT_MS,
    budgets: cfg?.budgets || {},
    pages: extractPageRows(data),
    totals: {
      http_req_duration: data.metrics.http_req_duration?.values || null,
      http_req_waiting: data.metrics.http_req_waiting?.values || null,
      http_req_failed: data.metrics.http_req_failed?.values || null,
      http_reqs: data.metrics.http_reqs?.values || null,
    },
  };

  return {
    'apps/ssr-perf/out/summary.json': JSON.stringify(data, null, 2),
    'apps/ssr-perf/out/report.json': JSON.stringify(report, null, 2),
    'apps/ssr-perf/out/report.html': renderHtmlReport(data),
  };
}

export default function () {
  // One URL per iteration (round-robin) so each path gets many samples.
  // This gives meaningful per-URL percentiles without requiring huge durations.
  const idx = (Number(__ITER) + Math.max(0, Number(__VU) - 1)) % paths.length;
  const path = paths[idx];

  group(`GET ${path}`, () => {
    const url = joinUrl(baseUrlNormalized, String(path));

    const res = http.get(url, {
      timeout: `${TIMEOUT_MS}ms`,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      tags: {
        page: String(path),
      },
      redirects: 10,
    });

    // Record per-page timings (ms)
    const pageKey = String(path);
    const m = perPage[pageKey];
    if (m) {
      m.ttfb.add(res.timings.waiting);
      m.duration.add(res.timings.duration);

      const is5xx = res.status >= 500;
      m.rate5xx.add(is5xx);

      const bodyLooksLikeError = SSR_ERROR_BODY_RE.test(res.body || '');
      m.rateErrorBody.add(bodyLooksLikeError);
    }

    check(res, {
      'no 5xx': (r) => r.status < 500,
      'non-empty body': (r) => (r.body || '').length > 0,
      'looks like html (content-type)': (r) => {
        const ct = (r.headers['Content-Type'] || r.headers['content-type'] || '').toString();
        // Allow missing content-type (some proxies strip it), but prefer html-ish.
        return ct === '' || ct.includes('text/html') || ct.includes('application/xhtml');
      },
      'no obvious SSR stack trace in body': (r) => !SSR_ERROR_BODY_RE.test(r.body || ''),
    });
  });
}
