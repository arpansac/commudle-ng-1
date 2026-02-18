// Central config for SSR perf checks.
// This file is loaded by k6 directly (no env/args required).

export default {
  // Production base URL to test.
  baseUrl: 'https://www.commudle.com',

  // Pages to test (keep these to SSR routes you care about).
  paths: ['/', '/events', '/builds', '/communities', '/users/arpansac'],

  // Googlebot Smartphone UA (UA can be spoofed; this is just for bot-like behavior).
  userAgent:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',

  // Load profile
  vus: 7,
  duration: '2m',
  timeoutMs: 25000,

  // Optional perf budgets (p95 in ms). Set to 0 to disable.
  budgets: {
    ttfbP95Ms: 0,
    durationP95Ms: 0,
  },
};
