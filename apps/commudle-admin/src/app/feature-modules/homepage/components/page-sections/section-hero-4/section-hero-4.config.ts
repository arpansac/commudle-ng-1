/**
 * Preset gradient color themes for the animated mesh visual.
 * Each theme maps to three harmonious CSS hex colors used as gradient stops.
 * Can be overridden per-competitor using `gradientOverride`.
 */
export type Hero4GradientTheme = 'blue' | 'purple' | 'orange' | 'teal' | 'rose';

/**
 * Custom gradient color override — takes precedence over `gradientTheme`.
 * All three values must be valid CSS color strings (hex recommended).
 */
export interface IHero4GradientOverride {
  /** Primary gradient stop — dominant ribbon color */
  colorA: string;
  /** Secondary gradient stop — accent/complement color */
  colorB: string;
  /** Tertiary gradient stop — transition/highlight color */
  colorC: string;
}

/**
 * Config for `commudle-section-hero-4` — the comparison page hero.
 *
 * This section is designed to be reused across multiple competitor comparison
 * pages. Swap `eyebrow`, `heading`, `subtext`, `cta`, `screenshot`, and
 * `gradientTheme` (or `gradientOverride`) per competitor.
 *
 * Sample config:
 *
 * ```json
 * {
 *   "type": "commudle-section-hero-4",
 *   "config": {
 *     "eyebrow": "#1 Meetup Alternative",
 *     "heading": "Everything Meetup does — and everything it doesn't.",
 *     "subtext": "Commudle gives tech communities a purpose-built home for events, talks, hackathons, and member growth. Compare and decide.",
 *     "cta": { "label": "Try Commudle free", "routerLink": "/register" },
 *     "ctaMicroCopy": ["Free to get started.", "No credit card required."],
 *     "screenshot": { "src": "/assets/screenshots/commudle-dashboard.png", "alt": "Commudle community dashboard" },
 *     "gradientTheme": "blue"
 *   }
 * }
 * ```
 */
export interface IHero4Config {
  /** Eyebrow label — fully custom string e.g. "#1 Meetup Alternative" */
  eyebrow: string;
  /** Main heading — HTML markup supported for inline emphasis */
  heading: string;
  /** Supporting subtitle paragraph — plain text */
  subtext: string;
  /** Primary CTA button */
  cta: { label: string; routerLink: string };
  /** 1–2 micro-copy lines shown below the CTA button */
  ctaMicroCopy?: string[];
  /** Optional product screenshot rendered inside the laptop frame */
  screenshot?: { src: string; alt: string };
  /** Gradient color theme preset — defaults to 'blue' if omitted */
  gradientTheme?: Hero4GradientTheme;
  /** Custom gradient colors — overrides gradientTheme when provided */
  gradientOverride?: IHero4GradientOverride;
}
