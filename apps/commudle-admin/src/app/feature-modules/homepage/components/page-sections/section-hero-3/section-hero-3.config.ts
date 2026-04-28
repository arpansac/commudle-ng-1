export interface IHero3Config {
  /** Main headline text */
  heading: string;
  /** Supporting subtitle paragraph */
  subtext: string;
  /** Primary (filled) CTA button */
  primaryCta: { label: string; routerLink: string };
  /** Secondary (outline) CTA button — optional */
  secondaryCta?: { label: string; routerLink: string };
  /** Stat items shown below the hero — optional */
  stats?: { value: string; label: string }[];
}
