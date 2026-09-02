# Skill: Hero Section Generation

Type-specific skill, layered on top of `public-page-section-generation.md` (the base
skill — always apply that one first, this one adds hero-specific detail).
Consulted by the `public-page-section-generator` agent whenever the
determined section type is "hero."

---

## Purpose

Generate hero section variants:

- `section-hero-1` (existing)
- `section-hero-2`, `section-hero-3`, etc. (new, as requested)

Each variant must be structurally consistent with the others, differ only
in layout or interaction, and remain minimal and reusable.

## Core Principle — Variants, Not Configurable Heroes

Do not make one configurable hero component. Create new variants instead.
Example naming: `hero_1` → static, `hero_2` → visual + animation, `hero_3`
→ centered.

---

## Hero-Specific Options

The agent's own general question flow (intent, reuse check, content,
reference) applies as normal — see `public-page-section-generator.md`.
These are the additional, hero-specific choices to gather once type is
confirmed as hero:

### Layout — Choose One

- Two-column (text left, visual right)
- Centered (text only)
- Visual-heavy (visual dominant)

### Visual Requirement

- None
- Floating shapes
- Illustration
- Globe
- Card (ID-card style)
- Custom (ask what, specifically)

### Interaction Pattern

**Entry:** none / fade-in / slide-up / stagger
**Hover:** none / lift / tilt / glow
**Motion:** none / floating / pulse
**Advanced:** none / parallax / draggable / follow-cursor

Also ask: subtle or noticeable?

---

## Layout Rules

All hero sections must use:

- Section spacing: `com-py-12 md:com-py-16`
- Container: `base-layout container`
- Two-column layout: Tailwind grid

### `base-layout` Min-Height — Critical, Apply to Every Hero

The global `.base-layout` class applies `min-h-screen` (100vh). Every
hero section must add this scoped override, immediately after
`:host { display: block; }`:

```scss
.base-layout {
  min-height: 0;
}
```

Angular's emulated encapsulation scopes this to the component only.
Omitting it is a bug — the section will render full viewport height
regardless of content. (Same rule as `public-page-section-generation.md`'s general
version — restated here because it's the single most common mistake
specifically in hero sections.)

---

## Mobile Responsiveness — Mandatory for Every Hero Variant

Verify at 375px before completion, in addition to everything
`public-page-section-generation.md` already requires:

- **Overflow**: outermost element always `com-overflow-x-hidden`
- **Horizontal gutter**: `base-layout container` always
  `com-px-4 md:com-px-6`
- **Two-column grid**: always `com-grid-cols-1 md:com-grid-cols-2` —
  never start multi-column
- **Decorative right-column visuals** (blobs, orbital rings, gradient
  meshes, laptop frames): if the visual has absolutely-positioned or
  fixed-pixel elements that would overflow or obscure text below `md`,
  add `com-hidden md:com-block` to the visual wrapper. If it scales
  gracefully instead, gate large pixel dimensions behind `@screen md` in
  SCSS.
- **min-height on layout rows**: always inside `@screen md { ... }`,
  never unconditional
- **`com-text-Public-Page-CTA-Heading` (60px)**: too large for mobile —
  always responsive scale:
  ```scss
  @apply com-text-4xl md:com-text-5xl lg:com-text-Public-Page-CTA-Heading;
  ```
- **Background glow/mesh elements**: `vw` units with `max-width`/
  `max-height` caps — never raw pixel values like `860px`
- **Chips/tooltips with negative offsets** (e.g. `right: -48px`): add
  `com-hidden md:com-block` to prevent horizontal bleed on mobile

---

## Typography

- Title: `com-text-Page-Heading`
- Subtitle: `com-text-Paragraph-1`

(The font-size and color tensions mentioned here in earlier drafts are
both resolved now — see `design-guardrails.md`. Named tokens like these
two are preferred; the default Tailwind scale works too, confirmed
against the real `tailwind.preset.js`, as a fallback for genuine gaps.)

---

## CTA Rules

Must use Nebular button (`nbButton`). No custom button logic.

---

## Visual Rules

If a visual is used: must be isolated in its own container, must not
affect layout structure, must be replaceable later without touching
unrelated markup.

---

## Constraints

Do not: add variant flags to a config (create a new variant instead —
see Core Principle), expose design choices as config options, use inline
styles, introduce new color/font tokens beyond what's already approved,
use an external UI library.

---

## Animation Rules

Use the decision rules from `public-page-section-generation.md` (CSS → Angular
Animations → GSAP, in that preference order). Don't ask the person which
library to use — the type of interaction determines it. Don't reach for
GSAP unnecessarily.

---

## Output Requirements

Once all hero-specific choices are gathered (on top of what
`public-page-section-generator.md`'s own flow already collected):

1. Standalone Angular component
2. TS file with config interface
3. HTML template
4. SCSS file
5. Interaction implementation (CSS/Angular/GSAP, per the decision rules)
6. Clean, production-ready code

---

## Goal

Hero sections that are consistent, reusable, predictable, aligned with
the rest of the design system, and performant.
