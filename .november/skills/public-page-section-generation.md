# Public Page Section Generation Skill

Base skill for generating any public page section component. Applies to
every section type; layer the matching type-specific skill on top when
one exists (e.g. `hero-section-generation.md` for hero sections).

> **Note on this file's history:** the original spec this was built from
> repeatedly referenced `element-library.md` (`§1`, `§2`, `§4`, `§20`) as
> the source for tokens and patterns. That file was confirmed never to
> have existed — a fabricated reference from whichever tool originally
> generated the spec, not a real dependency. Every reference has been
> removed; `design-guardrails.md` and `styling-guidelines.md` in
> `.november/rules/` are the real, verified sources for everything it
> claimed to cover.

---

## Mandatory Reading Before Starting

Read these before writing a single line:

1. `.november/rules/styling-guidelines.md` — `com-` prefix, colour tokens, spacing rules
2. `.november/rules/angular-development.md` — component structure, lifecycle, observables
3. `.november/rules/design-guardrails.md` — font tokens, colour corrections, dark mode

---

## Naming Convention (Permanent — Never Deviate)

| Thing            | Pattern                              | Example                     |
| ---------------- | ------------------------------------ | --------------------------- |
| Folder           | `section-[type]-[number]`            | `section-hero-1`            |
| Selector         | `commudle-section-[type]-[number]`   | `commudle-section-hero-1`   |
| Class name       | `Section[Type][Number]Component`     | `SectionHero1Component`     |
| Registry key     | `[TYPE]_[NUMBER]`                    | `HERO_1`                    |
| Registry value   | `'commudle-section-[type]-[number]'` | `'commudle-section-hero-1'` |
| Config interface | `I[Type][Number]Config`              | `IHero1Config`              |

---

## Files to Create Per Section

**Canonical location:**

```
apps/commudle-admin/src/app/app-shared-components/page-sections/section-[type]-[number]/
├── section-[type]-[number].component.ts
├── section-[type]-[number].component.html
├── section-[type]-[number].component.scss
└── section-[type]-[number].config.ts   ← typed config interface
```

Create all files manually. Do not use `nx generate`.

The registry lives at:
`apps/commudle-admin/src/app/app-shared-components/page-sections/section.registry.ts`

---

## Step 1 — Config File (`section-[type]-[number].config.ts`)

Every section defines its own typed config interface. No `any`.

The config interface contains **only content fields** — text, URLs,
labels, arrays of items. It never contains layout, colour, spacing, or
alignment fields — those are hardcoded in the component.

```typescript
// Example for section-hero-1
export interface IHero1Config {
  badge?: string;
  badgeAnimatedDot?: boolean;
  heading: string;
  headingAccent?: string;
  subtext: string;
  primaryCta: { label: string; routerLink: string };
  secondaryCta?: { label: string; routerLink: string };
  stats?: { value: string; label: string }[];
}
```

---

## Step 2 — Component Class

```typescript
import { Component, Input, OnInit, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { I[Type][Number]Config } from './section-[type]-[number].config';

@Component({
  selector: 'commudle-section-[type]-[number]',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './section-[type]-[number].component.html',
  styleUrls: ['./section-[type]-[number].component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Section[Type][Number]Component implements OnInit, OnDestroy {
  @Input({ required: true }) config!: I[Type][Number]Config;

  private destroy$ = new Subject<void>();

  constructor(private el: ElementRef) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

`standalone: true` here is fixed, not a default to ask about — this is
the one confirmed exception to the general "ask every time" component
rule, per `angular-development.md`.

**Additional imports per section need:**

- `NbButtonModule` from `@commudle/theme` — if section has buttons
- `FontAwesomeModule` from `@fortawesome/angular-fontawesome` — if section has icons
- `NbAccordionModule` from `@commudle/theme` — if section has FAQ
- `animate`, `stagger`, `inView` from `motion` — if section has animations

---

## Step 3 — Register in `section.registry.ts`

After creating the component, add to `section.registry.ts`:

```typescript
// Import at top
import { Section[Type][Number]Component } from './section-[type]-[number]/section-[type]-[number].component';

// Add to SECTION_TYPES
[TYPE]_[NUMBER]: 'commudle-section-[type]-[number]',

// Add to SECTION_COMPONENT_MAP
[SECTION_TYPES.[TYPE]_[NUMBER]]: Section[Type][Number]Component,
```

---

## Step 4 — Styling Rules (Apply to Every Section Without Exception)

### Backgrounds

Pick exactly one background token based on section role — see
`design-guardrails.md` Section 13, Surface Hierarchy Reference. Never
invent a background colour.

### Text

Check `design-guardrails.md` Section 10, Contrast Pairing Rules, for the
correct text token for the chosen background. Never pick text colour
independently of background.

### Spacing

All sections use this padding, no exceptions:

```scss
:host {
  display: block;
}
.section-inner {
  @apply com-py-16 com-px-4 md:com-py-20 md:com-px-8 lg:com-py-24;
  @apply com-max-w-7xl com-mx-auto;
}
```

### `base-layout` Min-Height Override (Mandatory When Using `base-layout container`)

The global `.base-layout` class applies `min-h-screen` (100vh), which
inflates any section wrapping its content in
`<div class="base-layout container">` to full viewport height regardless
of content.

Every section using `base-layout container` **must** add this scoped
override immediately after `:host`:

```scss
// Prevents base-layout from inflating the section to full viewport height.
// Angular's emulated encapsulation makes this rule more specific than the
// global .base-layout rule, so it wins without !important.
.base-layout {
  min-height: 0;
}
```

Safe — only resets min-height inside this component's scope. Global
layout (full-page routes) unaffected.

---

## Mobile Responsiveness (Mandatory — Verify at 375px Before Every PR)

Every section must work at 375px viewport width. These rules apply
without exception.

**R1 — Prevent horizontal overflow.** Outermost element always carries
`com-overflow-x-hidden`:

```html
<section class="com-bg-white com-overflow-x-hidden"></section>
```

**R2 — Horizontal gutter on the container.** `base-layout container` (or
inner content wrapper) always carries responsive horizontal padding:

```html
<div class="base-layout container com-px-4 md:com-px-6"></div>
```

**R3 — Two-column grids must start at 1 column.** Always single-column
first, break to multi-column at `md:`:

```html
<div class="com-grid com-grid-cols-1 md:com-grid-cols-2 com-gap-6"></div>
```

**R4 — Decorative visuals with fixed pixel dimensions must hide on
mobile.** Anything absolutely-positioned or fixed-pixel that would
overflow or obscure text below `md`:

```html
<div class="hero-visual com-hidden md:com-block" aria-hidden="true"></div>
```

**R5 — Fixed-size SCSS containers must use `@screen md` for desktop
dimensions.** Mobile-safe value first, override at `md:`:

```scss
.hero-visual {
  height: 240px; // mobile
  @screen md {
    height: 420px;
  } // desktop
}
```

**R6 — Hard min-height on layout rows must be gated behind `@screen
md`:**

```scss
.hero-layout {
  @screen md {
    min-height: 520px;
  }
}
```

**R7 — Large heading tokens must use a responsive scale.**
`com-text-Public-Page-CTA-Heading` (60px) is too large for mobile:

```scss
.hero-heading {
  @apply com-text-4xl md:com-text-5xl lg:com-text-Public-Page-CTA-Heading;
}
```

**R8 — Background glow/mesh elements must use viewport-relative
sizing.** Never hard-code `width: 860px`:

```scss
// ❌ wrong
.hero-glow {
  width: 860px;
  height: 440px;
}

// ✅ correct
.hero-glow {
  width: 90vw;
  max-width: 860px;
  height: 46vw;
  max-height: 440px;
}
```

---

### Font Tokens

**Resolved, corrected from the original spec:** both the 8 semantic
tokens below and standard Tailwind scale classes (`com-text-xs` through
`com-text-2xl`, etc.) are valid. The original spec's "only these 8, scale
forbidden" claim was wrong — confirmed against `design-guardrails.md`
Section 1.

- Headings: `com-text-Page-Section-Header` or `com-text-Page-Heading`
- Subheadings: `com-text-Page-Subheading` or `com-text-Card-Subheading`
- Body: `com-text-Paragraph-1`
- Labels / secondary: `com-text-Paragraph-2`
- Captions / eyebrows: `com-text-Caption`

Standard Tailwind scale classes (`com-text-xs`, `com-text-sm`,
`com-text-base`, `com-text-lg`, `com-text-xl`, `com-text-2xl`) are also
valid — use whichever fits, semantic token or scale class. Bare numeric
classes without `com-text-` semantics (`com-text-14`, `com-text-16`) are
still invalid — that part of the original prohibition stands, see
`design-guardrails.md` Section 8's Quick Correction Reference.

### Colours

**Resolved, verified against `tailwind.preset.js`.** Named tokens are
preferred (see `design-guardrails.md` for the full list), but the default
Tailwind palette (`gray-400`, `red-500`, `blue-500`, etc.) is genuinely
available too — this config extends rather than replaces Tailwind's
defaults. Use it for a real gap the named tokens don't cover, not as a
first choice. The one confirmed non-existent color is `primary-50` — the
custom `primary` scale starts at `100`; `gray-50` and `blue-50`, by
contrast, are both real named tokens.

### `com-` Prefix

Every Tailwind class needs the `com-` prefix. No exceptions.

### No Inline Styles

Never. Component SCSS file only.

---

## Step 5 — Scroll Reveal (Apply to Every Section)

```typescript
import { inView, animate } from 'motion';

ngAfterViewInit(): void {
  inView(this.el.nativeElement, () => {
    animate(this.el.nativeElement,
      { opacity: [0, 1], y: [24, 0] },
      { duration: 0.5, easing: 'ease-out' }
    );
  }, { amount: 0.15 });
}
```

Add `AfterViewInit` to `implements` when adding this.

---

## Step 6 — Section Header Pattern

Every section with a heading uses this exact structure:

```html
<div class="section-header">
  <p class="section-header__eyebrow">{{ config.eyebrow }}</p>
  <h2 class="section-header__heading">{{ config.heading }}</h2>
  <p class="section-header__sub">{{ config.subtext }}</p>
</div>
```

```scss
.section-header {
  @apply com-mb-12;
  &__eyebrow {
    @apply com-text-Caption com-font-semibold com-text-primary-600;
    @apply com-uppercase com-tracking-widest com-mb-4 com-block;
  }
  &__heading {
    @apply com-text-Page-Section-Header com-font-medium com-text-Yankees-Blue com-mb-4;
  }
  &__sub {
    @apply com-text-Paragraph-1 com-text-Auro-Metal-Saurus com-max-w-xl;
  }
}
```

For centred variant add `com-text-center` to `.section-header` and
`com-mx-auto` to `__sub`. For dark background, replace text tokens per
`design-guardrails.md` Section 10.

---

## Step 7 — Buttons

Always Nebular. Never custom. Import `NbButtonModule`.

```html
<button nbButton status="primary" size="large" shape="semi-round" [routerLink]="config.primaryCta.routerLink">
  {{ config.primaryCta.label }}
</button>
```

CTA pair always wrapped:

```html
<div class="cta-buttons">...</div>
```

```scss
.cta-buttons {
  @apply com-flex com-gap-4 com-flex-wrap;
  button {
    @apply sm:com-w-auto com-w-full;
  }
}
```

---

## Step 8 — Icons

Only if the section uses icons. Import `FontAwesomeModule`.

```typescript
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers, faCode } from '@fortawesome/free-solid-svg-icons';

readonly icons = { faUsers, faCode };
```

Never import the full library. Never assign icons as individual
properties. If the config drives which icon to show (e.g. an icon name
string coming from the page's content data), map it through a lookup
object rather than a chain of conditionals:

```typescript
const ICON_MAP: Record<string, IconDefinition> = { users: faUsers, code: faCode };
// then: this.icons[config.iconName]
```

---

## Animation Engine Decision Rules

The choice of animation method must be made automatically, not asked
about.

**Use CSS when:** simple hover effects (lift, glow), simple transitions
(opacity, transform), no sequencing needed.

**Use Angular Animations when:** simple enter/leave transitions, toggle
visibility states, no complex sequencing.

**Use GSAP when:** staggered animations (lists, grids), timeline-based
sequences, continuous motion (floating, swinging, looping), scroll-based
or interactive motion, multiple elements needing coordination.

**Default preference order:** CSS → Angular Animations → GSAP (only when
necessary).

**Never:** GSAP for simple hover effects, Angular animations for complex
sequences, mixing multiple animation engines in one section unless
required.

---

## Pre-Submit Checklist

- [ ] Config interface in separate `.config.ts` file — no `any`
- [ ] `@Input({ required: true }) config` uses the typed config interface
- [ ] `standalone: true`
- [ ] `ChangeDetectionStrategy.OnPush`
- [ ] `implements OnInit, OnDestroy` (add `AfterViewInit` if using animations)
- [ ] `private destroy$ = new Subject<void>()` declared
- [ ] `ngOnDestroy` calls both `destroy$.next()` and `destroy$.complete()`
- [ ] Scroll reveal applied in `ngAfterViewInit`
- [ ] Background and text tokens checked against `design-guardrails.md`
- [ ] Section spacing applied: `com-py-16 com-px-4 md:com-py-20 md:com-px-8 lg:com-py-24`
- [ ] Max width: `com-max-w-7xl com-mx-auto` on inner container
- [ ] Font size and colour tokens checked against `design-guardrails.md`
- [ ] Every Tailwind class has `com-` prefix
- [ ] No inline styles
- [ ] Nebular buttons used — never custom
- [ ] Icons in `readonly icons = {}` — never individual properties
- [ ] Registered in `section.registry.ts` — both `SECTION_TYPES` and `SECTION_COMPONENT_MAP`
- [ ] Selector matches registry value exactly
- [ ] Verified at 375px viewport width

---

## How to Use This Skill

For every new section: determine the naming (`section-[type]-[number]`),
gather the config shape and a design brief (layout, visual elements, what
makes this variant distinct), apply this skill plus any matching
type-specific skill, generate, then register in `section.registry.ts`.
