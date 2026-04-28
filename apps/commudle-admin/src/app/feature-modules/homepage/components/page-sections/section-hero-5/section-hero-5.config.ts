/**
 * Config for `commudle-section-hero-5` — dark centered full-width hero.
 *
 * This variant uses an always-dark background with an animated dot-grid mesh
 * and a two-line large heading where each line can carry a distinct color.
 * Intended for high-impact landing pages and product CTAs.
 *
 * Sample config:
 *
 * ```json
 * {
 *   "type": "commudle-section-hero-5",
 *   "config": {
 *     "headingLine1": "Build thriving communities.",
 *     "headingLine2": "Together.",
 *     "line2ColorClass": "com-text-Caribbean-Green",
 *     "subtext": "Commudle gives tech communities a purpose-built home — events, talks, hackathons, and everything in between.",
 *     "primaryCta": { "label": "Get started free", "routerLink": "/register" },
 *     "secondaryCta": { "label": "See how it works", "routerLink": "/features" }
 *   }
 * }
 * ```
 */
export interface IHero5Config {
  /** First heading line — HTML markup supported */
  headingLine1: string;
  /**
   * Second heading line — HTML markup supported.
   * Rendered in the accent color specified by `line2ColorClass`.
   */
  headingLine2: string;
  /**
   * Tailwind color class applied to the second heading line.
   * Must be a valid project color token class (e.g. `com-text-Caribbean-Green`).
   * Defaults to `com-text-Caribbean-Green` when omitted.
   */
  line2ColorClass?: string;
  /** Supporting subtitle — plain text */
  subtext: string;
  /** Primary (filled) CTA button */
  primaryCta: { label: string; routerLink: string };
  /** Secondary (outline) CTA button — optional */
  secondaryCta?: { label: string; routerLink: string };
}
