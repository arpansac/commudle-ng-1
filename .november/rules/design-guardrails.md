# Styling Guardrails — Common Mistakes

This document lists patterns that get generated incorrectly for
this project, and the exact correction for each. When in doubt, check here
before writing any class name.

> **Both tensions resolved, verified against the actual
> `tailwind.preset.js`.** This config uses `theme.extend` for colors,
> fontSize, spacing, borderRadius, boxShadow, and lineHeight — `extend` > _adds to_ Tailwind's defaults rather than replacing them, and this has
> been confirmed for colors directly by the project owner. That means:
>
> **The full default Tailwind scale is genuinely accessible** — not just
> the named tokens below. Standard color families (`red-500`, `blue-500`,
> `gray-200`, etc.), the default font-size scale, default border-radius,
> default box-shadow, and default line-height all still work.
>
> **But the project's actual policy is preference, not prohibition:** use
> the named/semantic tokens defined in this file first — they're
> intentional design-system choices, not arbitrary restrictions. Fall
> back to the default Tailwind scale only for a genuine gap the named
> tokens don't cover, not as a first choice. Everything marked "invalid"
> or "forbidden" below should be read as "not the preferred choice, but
> not literally broken" rather than "will not work."
>
> Also confirmed directly against the preset file (this part was actually
> wrong in an earlier pass — corrected here): **`gray-50` and `blue-50`
> both exist** as explicit custom tokens. `primary-50` is the one that
> genuinely doesn't exist — it was never in this project's `primary`
> scale, which starts at `100`.

---

## 1. Font Size — Valid Tokens

This project defines a custom font scale in `tailwind.preset.js`. Valid
font size classes fall into three groups. Everything outside these groups
is forbidden.

### ✅ Group A — 8 Semantic Named Tokens

| Token                              | Size | Use For                                   |
| ---------------------------------- | ---- | ----------------------------------------- |
| `com-text-Public-Page-CTA-Heading` | 60px | Hero / CTA headings on public pages       |
| `com-text-Page-Heading`            | 36px | Page-level headings                       |
| `com-text-Page-Section-Header`     | 24px | Section headers                           |
| `com-text-Page-Subheading`         | 20px | Subheadings                               |
| `com-text-Card-Subheading`         | 18px | Card titles                               |
| `com-text-Paragraph-1`             | 16px | Body text                                 |
| `com-text-Paragraph-2`             | 14px | Button text, input labels, secondary body |
| `com-text-Caption`                 | 12px | Captions, helper text, fine print         |

### ✅ Group B — All Tailwind Default Scale Classes

All standard Tailwind text scale utilities are valid in this project —
`com-text-xs`, `com-text-sm`, `com-text-base`, `com-text-lg`,
`com-text-xl`, `com-text-2xl`, `com-text-3xl`, `com-text-4xl`, and any
other standard Tailwind text scale value.

### ✅ Group C — 2 Allowed Pixel-Named Values

Only these two pixel-named classes are defined in the preset:
`com-text-8px`, `com-text-10px`.

### ❌ Invalid — Forbidden

Numeric classes — `com-text-10`, `com-text-12`, `com-text-14`,
`com-text-16`, `com-text-20` — none valid under any circumstances.
Pixel-named classes other than `8px`/`10px` — `com-text-12px`,
`com-text-14px`, `com-text-16px` — not defined in the preset.

> **Reminder**: use a semantic token (Group A), a standard Tailwind
> scale class (Group B), or `com-text-8px` / `com-text-10px` (Group C).
> Only bare numeric classes and non-8px/10px pixel-named classes are
> forbidden.

---

## 2. Colors — Named Tokens Preferred, Default Scale as Fallback

This project defines a large set of named color tokens in
`tailwind.preset.js`, via `theme.extend.colors`. **Use these first** —
they're the intentional design-system palette, not an exhaustive
allowlist. Because the config uses `extend`, Tailwind's full default
color scale (`red-500`, `blue-500`, `gray-200`, etc.) is also genuinely
available underneath — reach for it only when a named token doesn't cover
a real need, not as a first choice.

### ✅ Named Tokens (Preferred — Use These First)

**Primary**: `primary-100` through `primary-900`

**Grays**: `gray-50`, `gray-100`, `gray-500`,
`gray-600`, `gray-700`, `gray-800`, `gray-900`, `gray-500-opacity-50`,
`gray-custom-1`, `tgray-500` _(always #6b7280, both modes)_

**Blues**: `Brilliant-Azure` (#2aa5ff), `Brandeis-Blue` (#0074ED, static),
`Blueberry`, `Very-Light-Blue`, `Ultramarine-Blue`, `Azure` (#0095ff,
static), `Azure-opacity-10`, `Blue-Jeans`, `Bleu-De-France`, `Blue`,
`Catalina-Blue`, `blue-50`, `New-Car`, `Blue-Lotus` (#635BFF, static),
`Alice-Blue`, `Alice-Blue-Dark` (#EBF5FF, static — very light, never
text), `Azureish-White` (#dae0ff, static — very light, never text),
`Lavender` (#E6F1FF, static — very light, never text)

**Greens**: `Caribbean-Green`, `Crayola-Green`, `Dark-Spring-Green`

**Reds / Warnings**: `Infra-Red`, `Deep-Carmine-Pink`, `Bittersweet`,
`Giants-Orange`, `American-Orange`

**Yellows**: `Chrome-Yellow`, `Blond`, `Blanched-Almond`, `Seashell`

**Purples**: `Blue-Violet`, `Spiro-Disco`

**Neutrals / Grays / Whites**: `Yankees-Blue` (theme-aware — light
#222b45 → dark #ffffff), `tYankees-Blue` (always #222b45, both modes —
see Section 9), `Bright-Gray` (light #e4e9f2 → dark #2c2c2c),
`Bright-Gray-Light` (#EAECF0, static — very light, never text),
`Bright-Gray-opacity-60` (static), `Bright-Gray-opacity-30`
(theme-aware), `Cadet-Grey` (#8F9BB3, static — mid-tone, secondary text
on light surfaces only), `Silver-Sand` (#c4c4c4, static — borders only,
never text), `Light-Silver` (#D0D5DD, static — borders only, never text),
`Ghost-White` (light #f7f9fc → dark #1e1e1e), `Auro-Metal-Saurus` (light
#667085 → dark #ffffff), `tAuro-Metal-Saurus` (#667085, static),
`AuroMetalSaurus` (#667085, static), `Spanish-Gray` (light #979797 →
dark #ffffff), `Sonic-Silver` (light #777777 → dark #ffffff), `Charcoal`
(light #344054 → dark #ffffff), `Black-Coral` (light #595867 → dark
#ffffff), `Quartz` (light #4b4b5c → dark #ffffff), `Raisin-Black` (light
#231f20 → dark #ffffff), `Dark-Jungle-Green` (light #101828 → dark
#ffffff), `Vampire-Black` (light #0a0a0a → dark #ffffff),
`Anti-Flash-White` (light #f2f2f2 → dark #1e1e1e), `Anti-Flash` (light
#edf1f7 → dark #121212), `tAnti-Flash` (#edf1f7, static — very light,
never text), `gunmetal` (light #2f2e41 → dark #ffffff), `slate-100`
(light #f1f5f9 → dark #121212)

**White / Black**: `white` (light #ffffff → dark #121212), `tWhite`
(always #ffffff, both modes — see Section 9), `white-opacity-40`,
`black` (light #000000 → dark #ffffff), `tblack` (always #000000)

**Brand / Misc**: `Metallic-Bronze`, `Tigers-Eye` (#DF913F, static),
`Chocolate-Traditional`, `tChocolate-Traditional` (#7D4402, static),
`Custom-Select-Background`

### ⚠️ Not Named Tokens — Work, but Not the First Choice

`com-text-gray-400`, `com-text-gray-300`, `com-bg-slate-200`,
`com-bg-zinc-100`, `com-bg-blue-500`, `com-bg-red-500`, `com-bg-green-500`
— none of these are defined as named tokens, but since this config uses
`extend`, Tailwind's own default scale still renders them. Use the named
alternative below unless there's a real reason the named palette doesn't
cover.

### ✅ Preferred Alternatives

`com-text-Cadet-Grey` (muted text, light surfaces), `com-text-Auro-Metal-Saurus`
(secondary text, both modes), `com-bg-Bright-Gray` (subtle bg),
`com-bg-primary-500` (brand), `com-text-Infra-Red` (error/danger),
`com-text-Caribbean-Green` (success)

> **Reminder**: check the named token list above first — it's the
> intentional design system, not a restriction. The default Tailwind
> scale still works underneath it (this config uses `extend`), so
> nothing here is actually broken if you reach for it — but prefer the
> named token when one exists for what you're building. Arbitrary values
> like `com-bg-[#ff0000]` are the one thing to actually avoid, since
> those bypass the design system's token system entirely rather than
> falling back to a still-curated default scale.

---

## 3. Spacing — Named Tokens for Specific Values

Standard Tailwind spacing (`p-4`, `m-6`, `gap-3`) with `com-` prefix works
for the default scale. This project also defines named tokens for
specific pixel values — use the named token when the value matches
exactly.

| Token                                     | Value                |
| ----------------------------------------- | -------------------- |
| `com-p-2px` / `com-m-2px` / `com-gap-2px` | 2px                  |
| `com-p-5px`                               | 5px                  |
| `com-p-6px`                               | 6px                  |
| `com-p-7px`                               | 7px                  |
| `com-p-9px`                               | 9px                  |
| `com-p-10px`                              | 10px                 |
| `com-p-14px`                              | 14px                 |
| `com-p-17px`                              | 17px                 |
| `com-p-20px`                              | 20px                 |
| `com-p-30px`                              | 30px                 |
| `com-p-39px`                              | 39px                 |
| `com-p-56px`                              | 56px                 |
| `com-p-68px`                              | 68px                 |
| `com-p-72px`                              | 72px                 |
| `com-p-76px`                              | 76px                 |
| `com-w-300px` / `com-h-300px`             | 300px                |
| `com-w-500px`                             | 500px                |
| `com-w-800px`                             | 800px                |
| `com-h-95vh`                              | 95vh                 |
| `com-h-90dvh`                             | 90dvh                |
| `com-w-50vw`                              | 50vw                 |
| `com-w-70vw`                              | 70vw                 |
| `com-w-80vw`                              | 80vw                 |
| `com-mt-navbar-desktop`                   | 68px (navbar offset) |

These tokens apply to any spacing utility: `p-`, `m-`, `w-`, `h-`, `gap-`,
`top-`, `left-`, etc.

---

## 4. Border Radius

Use the custom `10` token instead of arbitrary values: `com-rounded-10`
(10px). Never `com-rounded-[10px]`.

---

## 5. Box Shadow

Named tokens preferred: `com-shadow-Card` (0 5px 15px #dae0ff),
`com-shadow-Chat-box`. Default scale (`com-shadow-md`, `com-shadow-lg`)
still works via `extend` — use it only when neither named token fits.

---

## 6. Grid — Extended Column Spans

The grid extends to 24 columns: `com-grid-cols-24`, plus extra span
tokens — `com-col-span-16`, `-17`, `-18`, `-20`, `-22`.

---

## 7. Line Height

Named tokens (`com-leading-14px`, `com-leading-21px`, `com-leading-30px`)
are preferred. Default Tailwind scale (`com-leading-5`, `com-leading-7`)
still works underneath via `extend` — use it for a value the named tokens
don't cover, not as the first choice.

---

## 8. Quick Correction Reference

Everything below still renders — this config uses `extend`, so nothing
here is actually broken. "Prefer" means the named token is the intended
design-system choice; reach for the default scale only when the named
list genuinely doesn't cover what's needed.

| Pattern                                   | Status                                      | Preferred instead                                                                                       |
| ----------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `com-text-xs` through `com-text-4xl`      | ✅ Works                                    | Fine to use directly                                                                                    |
| `com-text-8px` / `com-text-10px`          | ✅ Named token                              | Use directly                                                                                            |
| `com-text-10`, `-12`, `-14`, `-16`, `-20` | ❌ Not a real class                         | Not a valid Tailwind pattern regardless of extend — use a semantic token or scale class                 |
| `com-text-12px`, `-14px`, `-16px`         | ❌ Not defined, not default Tailwind either | `com-text-Caption`/`Paragraph-2`/`Paragraph-1` or the scale equivalent                                  |
| `com-text-gray-400`                       | ⚠️ Works, not preferred                     | `com-text-Cadet-Grey` or `com-text-Auro-Metal-Saurus`                                                   |
| `com-text-gray-500`                       | ✅ Named token                              | Use directly                                                                                            |
| `com-text-gray-300`                       | ⚠️ Works, not preferred                     | `com-text-Cadet-Grey`                                                                                   |
| `com-bg-gray-100`                         | ✅ Named token                              | Use directly                                                                                            |
| `com-bg-gray-200`                         | ⚠️ Works, not preferred                     | `com-bg-Bright-Gray`                                                                                    |
| `com-text-red-500`                        | ⚠️ Works, not preferred                     | `com-text-Infra-Red` or `com-text-Deep-Carmine-Pink`                                                    |
| `com-text-green-500`                      | ⚠️ Works, not preferred                     | `com-text-Caribbean-Green` or `com-text-Crayola-Green`                                                  |
| `com-text-blue-500`                       | ⚠️ Works, not preferred                     | `com-text-primary-500` or `com-text-Brilliant-Azure`                                                    |
| `com-shadow-md`                           | ⚠️ Works, not preferred                     | `com-shadow-Card`                                                                                       |
| `com-rounded-[10px]`                      | ❌ Arbitrary value syntax                   | `com-rounded-10` — this one's a real problem, arbitrary-value syntax bypasses the token system entirely |

---

## 9. Dark Mode — How Theme Tokens Actually Work

This project uses a `[data-theme='light']` / `[data-theme='dark']` CSS
variable system in `styles.scss`. Every token marked _(theme-aware)_
resolves to a different hex value per theme.

### 9.1 The `t`-Prefix Tokens Are Intentionally Pinned

Tokens beginning with `t` (`tWhite`, `tYankees-Blue`, etc.) are
deliberately fixed — same hex in both modes, so certain surfaces or
labels never invert.

| Token                    | Value (both modes) | Meaning                                   |
| ------------------------ | ------------------ | ----------------------------------------- |
| `tWhite`                 | #ffffff            | Always white — surface never goes dark    |
| `tYankees-Blue`          | #222b45            | Always dark navy — text never turns white |
| `tblack`                 | #000000            | Always black                              |
| `tgray-500`              | #6b7280            | Always mid-gray                           |
| `tAuro-Metal-Saurus`     | #667085            | Always this gray                          |
| `tAnti-Flash`            | #edf1f7            | Always very light — never text            |
| `tChocolate-Traditional` | #7D4402            | Always this brown                         |

**Rule for pinned tokens**: if you use a pinned token for a background,
you must also use a pinned token for text — one side won't adapt to the
theme automatically.

### 9.2 Core Theme-Switching Tokens

**Background / surface** (light → dark): `white` #ffffff→#121212,
`Anti-Flash-White` #f2f2f2→#1e1e1e, `Ghost-White` #f7f9fc→#1e1e1e,
`gray-50` #f9fafb→#121212, `gray-100` #f3f4f6→#4b5563, `slate-100`
#f1f5f9→#121212, `Alice-Blue` #edf5ff→#121212, `Anti-Flash`
#edf1f7→#121212, `Bright-Gray` #e4e9f2→#2c2c2c, `Bright-Gray-opacity-30`
#f7f8fb→#1e1e1e, `blue-50` #eff6ff→#121212, `Custom-Select-Background`
#eef2f7→#1e1e1e.

**Text / foreground** (light → dark, all go to #ffffff white in dark
mode except `black`): `Yankees-Blue` #222b45, `gray-900` #111827,
`gray-800` #1f2937, `gray-700` #374151, `gray-600` #4b5563,
`Auro-Metal-Saurus` #667085, `Charcoal` #344054, `Black-Coral` #595867,
`Quartz` #4b4b5c, `gunmetal` #2f2e41, `Raisin-Black` #231f20,
`Vampire-Black` #0a0a0a, `Dark-Jungle-Green` #101828, `Sonic-Silver`
#777777, `Spanish-Gray` #979797, `black` #000000→#ffffff.

### 9.3 Static Colors — No Dark Variant

These never change regardless of theme, and misusing them is the single
biggest cause of invisible content in this project:

| Token                                    | Value   | Safe for text?               | Safe for background?       |
| ---------------------------------------- | ------- | ---------------------------- | -------------------------- |
| `Cadet-Grey`                             | #8F9BB3 | ✅ Light surfaces only       | ❌ Never standalone bg     |
| `Silver-Sand`                            | #c4c4c4 | ❌ Never                     | ⚠️ Borders/dividers only   |
| `Light-Silver`                           | #D0D5DD | ❌ Never                     | ⚠️ Borders/dividers only   |
| `Bright-Gray-Light`                      | #EAECF0 | ❌ Never                     | ⚠️ Subtle borders only     |
| `tAnti-Flash`                            | #edf1f7 | ❌ Never                     | ⚠️ Light-mode surface only |
| `Alice-Blue-Dark`                        | #EBF5FF | ❌ Never                     | ⚠️ Light-mode surface only |
| `Azureish-White`                         | #dae0ff | ❌ Never                     | ⚠️ Light-mode surface only |
| `Lavender`                               | #E6F1FF | ❌ Never                     | ⚠️ Light-mode surface only |
| `AuroMetalSaurus` / `tAuro-Metal-Saurus` | #667085 | ✅ Secondary text only       | ❌                         |
| `Brandeis-Blue`                          | #0074ED | ✅ White/light surfaces only | ❌                         |
| `Brilliant-Azure`                        | #2aa5ff | ✅ Dark surfaces only        | ❌                         |
| `Blue-Lotus`                             | #635BFF | ✅ White or dark surfaces    | ❌                         |

> **Reminder**: before using any static token as text, check what
> the background looks like in dark mode. If it goes dark/near-black and
> the text is also dark or very light, the result is invisible.

---

## 10. Dark Mode — Contrast Pairing Rules

### 10.1 The Golden Rule

Before writing `com-bg-X com-text-Y`, check both the light AND dark
values of X and Y. The pair must have strong contrast in **both** modes.

### 10.2 Approved Background → Text Pairings (Verified from `styles.scss`)

**Standard adaptive surfaces** — `com-bg-white`, `-Anti-Flash-White`,
`-Ghost-White`, `-gray-50`, `-slate-100`, `-Alice-Blue`, `-Anti-Flash`,
`-Bright-Gray`, `-Bright-Gray-opacity-30`: primary text
`com-text-Yankees-Blue`, secondary `com-text-Auro-Metal-Saurus`.
`com-bg-gray-100` (dark mode #4b5563): primary `com-text-Yankees-Blue`,
secondary `com-text-Charcoal`.

Why `Yankees-Blue` works everywhere above: #222b45 (dark navy) on light
surfaces, #ffffff on their near-black dark-mode values — high contrast
both ways. Same logic for `Auro-Metal-Saurus` as secondary.

**Pinned-white surfaces**: `com-bg-tWhite` (always #ffffff) — primary
text **must** be `com-text-tYankees-Blue` (not `Yankees-Blue`, which
becomes #ffffff in dark mode — white-on-white, invisible), secondary
`com-text-Cadet-Grey`.

**Inverted / dark surfaces** — `com-bg-Yankees-Blue`,
`-Dark-Jungle-Green`, `-Vampire-Black`, `-Raisin-Black`, `-gunmetal`,
`-Charcoal` (all →#ffffff in dark mode): text `com-text-white`.

**Brand surfaces**: `com-bg-primary-500` through `-900` → `com-text-white`.
`com-bg-primary-100` through `-300` → `com-text-primary-800` or
`com-text-Yankees-Blue`.

### 10.3 Forbidden Pairings — Produce Invisible Content

- `com-bg-tWhite com-text-Yankees-Blue` — `tWhite` always #ffffff,
  `Yankees-Blue` → #ffffff in dark. White on white. Fix:
  `com-text-tYankees-Blue`.
- `com-bg-Anti-Flash-White com-text-Bright-Gray` — both near-identical
  dark values (#1e1e1e vs #2c2c2c). Fix: `com-text-Yankees-Blue`.
- `com-bg-Ghost-White com-text-Silver-Sand` — static light gray on a
  light bg, near-zero contrast. Fix: `com-text-Cadet-Grey` or
  `com-text-Yankees-Blue`.
- `com-text-Light-Silver` as text, ever — too light on any light bg.
- `com-text-Bright-Gray-Light` as text, ever — it's a surface color.
- `com-bg-gray-50 com-text-Paragraph-1 com-text-Cadet-Grey` — gray-50
  goes near-black (#121212) in dark mode, Cadet-Grey is static mid-tone —
  barely readable. Fix: `com-text-Auro-Metal-Saurus`.
- `com-bg-slate-100 com-text-tAnti-Flash` — slate-100 → #121212,
  tAnti-Flash is static very-light. Fix: `com-text-Yankees-Blue`.
- `com-bg-Yankees-Blue com-text-black` — `black` → #ffffff in dark, but
  Yankees-Blue bg also → #ffffff in dark. Always verify both dark values
  together, not just one side.

### 10.4 Secondary and Muted Text — Contrast Hierarchy

| Role                 | Token                        | Light   | Dark             | Usable on dark bg?     |
| -------------------- | ---------------------------- | ------- | ---------------- | ---------------------- |
| Primary body         | `com-text-Yankees-Blue`      | #222b45 | #ffffff          | ✅                     |
| Secondary/supporting | `com-text-Auro-Metal-Saurus` | #667085 | #ffffff          | ✅                     |
| Muted/caption        | `com-text-Cadet-Grey`        | #8F9BB3 | #8F9BB3 (static) | ⚠️ Light surfaces only |
| Disabled/placeholder | `com-text-gray-500`          | #6b7280 | #ffffff          | ✅                     |
| On dark/inverted bg  | `com-text-white`             | #ffffff | #121212          | ✅ (it's the bg)       |
| On pinned-white      | `com-text-tYankees-Blue`     | #222b45 | #222b45 (pinned) | ❌                     |

> **Reminder**: `Cadet-Grey` is static at #8F9BB3, only sufficient
> contrast on light surfaces. On any surface that goes dark in dark mode
> (`com-bg-white`, `-gray-50`, `-Ghost-White`, etc.), use
> `com-text-Auro-Metal-Saurus` instead — it adapts to white in dark mode.

### 10.5 Border and Divider Tokens in Dark Mode

| Use case          | Token                     | Light            | Dark                          |
| ----------------- | ------------------------- | ---------------- | ----------------------------- |
| Standard dividers | `com-divide-Bright-Gray`  | #e4e9f2          | #2c2c2c                       |
| Card borders      | `com-border-Bright-Gray`  | #e4e9f2          | #2c2c2c                       |
| Input borders     | `com-border-Light-Silver` | #D0D5DD (static) | Only on always-light surfaces |
| Focus ring        | `com-ring-primary-500`    | Brand blue       | Brand blue                    |

Never use `Silver-Sand`, `Light-Silver`, or `Bright-Gray-Light` as
borders on adaptive surfaces — static, will become invisible or harsh
depending on the surface's dark value.

---

## 11. Dark Mode — Decision Checklist

Run through before writing any `com-bg-*`, `com-text-*`, `com-border-*`,
or `com-divide-*` class:

1. Is this token theme-aware or static? (Static tokens: Section 9.3.) If
   static, check its hex — dark enough on light bg? Light enough on dark
   bg?
2. What does the background resolve to in dark mode? (Section 9.2.)
   Near-black, mid-dark, or still light?
3. What does the text resolve to in dark mode? Does it contrast clearly?
4. Using a pinned token (`tWhite`, `tblack`, `tYankees-Blue`)? Pinned
   background needs pinned (or inherently contrasting) text.
5. Using `Cadet-Grey` as secondary text? Only safe on surfaces that stay
   light in dark mode — use `Auro-Metal-Saurus` for adaptive surfaces.
6. Using any very-light static color as text? `Silver-Sand`,
   `Light-Silver`, `Bright-Gray-Light`, `tAnti-Flash`, `Alice-Blue-Dark`,
   `Lavender`, `Azureish-White` — never text, under any circumstances.

---

## 12. Dark Mode — Full Component Examples

**Correct — standard card, both modes safe:**

```html
<div class="com-bg-white com-rounded-10 com-shadow-Card com-p-6">
  <h3 class="com-text-Card-Subheading com-font-semibold com-text-Yankees-Blue">Card Title</h3>
  <p class="com-text-Paragraph-2 com-text-Auro-Metal-Saurus">Supporting description</p>
  <hr class="com-border-Bright-Gray com-my-4" />
  <span class="com-text-Caption com-text-Cadet-Grey">Updated 2 days ago</span>
</div>
```

**Correct — pinned-white surface:**

```html
<span class="com-bg-tWhite com-rounded-full com-px-4 com-py-2">
  <span class="com-text-Paragraph-2 com-text-tYankees-Blue">Active</span>
</span>
```

**Correct — inverted dark section:**

```html
<section class="com-bg-Yankees-Blue com-p-8 com-rounded-10">
  <h2 class="com-text-Page-Heading com-text-white">Hero Heading</h2>
  <p class="com-text-Paragraph-1 com-text-white com-opacity-80">Subtext here</p>
</section>
```

**Incorrect — invisible in dark mode:**

```html
<div class="com-bg-tWhite com-text-Yankees-Blue">INVISIBLE IN DARK</div>
<div class="com-bg-Ghost-White com-text-Silver-Sand">POOR CONTRAST IN DARK</div>
<p class="com-bg-gray-50 com-text-Paragraph-1 com-text-Cadet-Grey">HARD TO READ IN DARK</p>
```

---

## 13. Dark Mode — Surface Hierarchy Reference

| UI Layer               | Token                     | Light   | Dark             | Recommended text         |
| ---------------------- | ------------------------- | ------- | ---------------- | ------------------------ |
| App/page background    | `com-bg-white`            | #ffffff | #121212          | `com-text-Yankees-Blue`  |
| Primary card surface   | `com-bg-Anti-Flash-White` | #f2f2f2 | #1e1e1e          | `com-text-Yankees-Blue`  |
| Secondary card surface | `com-bg-Ghost-White`      | #f7f9fc | #1e1e1e          | `com-text-Yankees-Blue`  |
| Section fill           | `com-bg-gray-50`          | #f9fafb | #121212          | `com-text-Yankees-Blue`  |
| Input/form field       | `com-bg-gray-100`         | #f3f4f6 | #4b5563          | `com-text-Yankees-Blue`  |
| Hover/subtle highlight | `com-bg-Bright-Gray`      | #e4e9f2 | #2c2c2c          | `com-text-Yankees-Blue`  |
| Inverted/hero          | `com-bg-Yankees-Blue`     | #222b45 | #ffffff          | `com-text-white`         |
| Always-white surface   | `com-bg-tWhite`           | #ffffff | #ffffff (pinned) | `com-text-tYankees-Blue` |

When two adjacent elements use surfaces that become very similar in dark
mode (e.g. `white`→#121212 and `Anti-Flash-White`→#1e1e1e), add a
`com-border-Bright-Gray` border between them for visible separation.
