# CSS and Styling Guidelines

## 1. No Inline Styles — Ever

- Never use inline styles in HTML templates.
- Always use dedicated SCSS files via `styleUrls`.

```typescript
// ✅ Correct
@Component({
  selector: 'commudle-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
```

```html
<!-- ❌ WRONG — never do this -->
<div style="color: red;">Content</div>
```

## 2. Tailwind Class Naming

### `com-` Prefix — Always

- Every base Tailwind class needs the `com-` prefix.
- Pseudo-class prefixes come before `com-`, not after:
  `hover:com-`, `focus:com-`, `active:com-`, `disabled:com-`,
  `group-hover:com-`, `sm:com-`, `md:com-`, `lg:com-`.

```scss
// ✅ CORRECT
.example-class {
  @apply com-flex com-items-center com-gap-4;
  @apply hover:com-bg-primary-100 focus:com-ring-2;
  @apply active:com-scale-95 disabled:com-opacity-50;
}

// ❌ WRONG — missing com- prefix
.example-class {
  @apply flex items-center gap-4;
}

// ❌ WRONG — incorrect prefix order
.example-class {
  @apply com-hover:bg-primary-100;
}
```

## 3. Color Usage

> **Resolved, verified against the actual `tailwind.preset.js`.** This
> config uses `theme.extend.colors`, which adds to Tailwind's defaults
> rather than replacing them — so the full standard Tailwind palette
> really is available, confirmed directly. `gray-50` and `blue-50` both
> exist as named tokens too (an earlier pass here incorrectly said
> otherwise — corrected). The one color that genuinely doesn't exist is
> `primary-50` — the custom `primary` scale starts at `100`. Net effect:
> this section's original claims were largely right. The actual project
> policy, layered on top: prefer the named/semantic tokens below when one
> fits — they're the intentional design system — and treat the standard
> Tailwind palette as a valid fallback for genuine gaps, not a first
> choice.

- Only colors defined in `tailwind.preset.js`, or Tailwind's own
  defaults (still active via `extend`) — check the preset before writing
  any CSS/SCSS, and prefer a named token when one exists.
- Never arbitrary values (`com-bg-[#ff0000]`) — this bypasses the token
  system entirely, unlike falling back to the default scale.
- Never Nebular theme variables for color — Tailwind utilities only.

Available families:
- Primary: `primary-100` through `primary-900` — `primary-50` is the one
  real gap, never use it.
- Gray: `gray-50` through `gray-900`, all valid.
- Named: `Yankees-Blue`, `Bright-Gray`, `Infra-Red`, `Cadet-Grey`, and
  many more — see `design-guardrails.md` for the full list.
- Semantic: `success`, `warning`, `danger`, `info`.
- Standard Tailwind palette also available: gray, red, yellow, green,
  blue, indigo, purple, pink, orange — valid, but prefer the named
  tokens above when one covers the need.

```scss
// ✅ CORRECT
.button {
  @apply com-bg-primary-500 com-text-white;
  @apply hover:com-bg-primary-600;
  @apply com-border-Bright-Gray;
}

// ❌ WRONG
.button {
  @apply com-bg-[#ff0000] com-text-[#ffffff];
}
```

## File Organization

```
src/styles/
├── _variables.scss
├── _mixins.scss
├── _base.scss
├── _typography.scss
├── _utilities.scss
└── main.scss

components/
└── component-name/
    └── component-name.component.scss
```

## CSS Property Order

1. Positioning — `position`, `top`, `right`, `bottom`, `left`, `z-index`
2. Box model — `display`, `width`, `height`, `margin`, `padding`
3. Typography — `font-family`, `font-size`, `line-height`, `color`
4. Visual — `background`, `border`, `box-shadow`
5. Animation — `transition`, `animation`

## Responsive Design — Mobile-First

Start with mobile styles, add breakpoints upward:

```scss
.component {
  @apply com-p-4 com-text-sm;               // mobile (default)
  @apply sm:com-p-6 sm:com-text-base;        // tablet and up
  @apply lg:com-p-8 lg:com-text-lg;          // desktop and up
}
```

Breakpoints: `sm:` 576px+, `md:` 768px+, `lg:` 992px+, `xl:` 1200px+,
`2xl:` 1400px+.

## Component Styling Patterns

```scss
:host {
  display: block;

  &.is-loading {
    @apply com-opacity-50;
  }

  &.is-disabled {
    @apply com-pointer-events-none com-opacity-50;
  }
}

.component-wrapper {
  @apply com-p-4 com-bg-white com-rounded-lg;
}
```

### State Classes

```scss
.interactive-element {
  @apply com-transition-all com-duration-200;
  @apply hover:com-scale-105 hover:com-shadow-lg;
  @apply focus:com-outline-none focus:com-ring-2 focus:com-ring-primary-500;
  @apply active:com-scale-95;
  @apply disabled:com-opacity-50 disabled:com-cursor-not-allowed;
}
```

## Nesting Rules

- Always nest related child classes under their parent.
- Never write standalone classes that belong to a parent component.
- `@apply` in SCSS files only — never Tailwind classes directly in HTML.
- Maximum 3 levels deep.

```scss
// ✅ CORRECT
.parent-container {
  @apply com-flex com-flex-col;

  .child-element {
    @apply com-p-4 com-border;

    .nested-child {
      @apply com-text-sm com-text-gray-600;
      // ❌ don't go deeper than this
    }
  }
}
```

## Class Naming

- kebab-case always: `.header-content`, `.form-group`.
- Never BEM double underscore (`__`) — `.community-controls-container`,
  not `.community-controls__container`.
- Never BEM double hyphen (`--`) — `.button-primary-active`, not
  `.button--primary`.

## Performance

- Animate `transform` and `opacity` only — avoid `width`, `height`,
  `top`, `left`, which trigger layout recalculation.
- Avoid universal selectors (`*`), minimize descendant selectors, prefer
  class selectors, avoid deep nesting.

## Accessibility

```scss
.button {
  @apply focus:com-outline-none focus:com-ring-2 focus:com-ring-primary-500 focus:com-ring-offset-2;

  // Remove focus ring for mouse users
  &:focus:not(:focus-visible) {
    @apply com-ring-0;
  }
}

@media (prefers-contrast: high) {
  .component {
    @apply com-border-2;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Code Review Checklist

- [ ] No inline styles
- [ ] Every Tailwind class has `com-` prefix
- [ ] Pseudo-classes in correct order (`hover:com-`, not `com-hover:`)
- [ ] Only preset colors — no arbitrary values
- [ ] Mobile-first responsive design
- [ ] Nesting max 3 levels
- [ ] Accessibility considered
- [ ] Consistent with existing styles

## Remember

1. Never inline styles.
2. Always `com-` prefix.
3. Only preset colors from `tailwind.preset.js`.
4. Mobile-first.
5. Nesting max 3 levels.
6. Accessibility in every style.
7. Optimize for performance.