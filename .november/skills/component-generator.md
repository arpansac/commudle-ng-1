# Skill: Angular Component Generator

Use this skill whenever generating an Angular component. This is the
general-purpose skill — for public page sections specifically, this skill
still applies, layered under `section-generation.md`, which takes
precedence on anything it more specifically covers.

---

## Step 1 — Determine Component Type Before Writing Any Code

- **Reusable shared component?** → Goes in
  `apps/commudle-admin/src/app/app-shared-components/` or `libs/`.
- **Feature-specific component?** → Goes in
  `apps/commudle-admin/src/app/feature-modules/<feature>/components/<component-name>/`.

Never use Nx or Angular CLI to generate reusable components — create all
four files manually:

```
<component-name>/
├── <component-name>.component.ts
├── <component-name>.component.html
├── <component-name>.component.scss
└── <component-name>.component.spec.ts
```

For feature-specific components, the CLI is fine:

```bash
npx nx g @nx/angular:component <name>
```

After generating, always verify the output includes `OnInit`,
`OnDestroy`, and `destroy$` — add manually if missing.

---

## Step 2 — Scaffold the TypeScript File

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'commudle-<feature-name>',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './<component-name>.component.html',
  styleUrls: ['./<component-name>.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class <ComponentName>Component implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

Note the `standalone: true` shown here matches `angular-development.md`'s
actual rule: ask the person which they want for general component work,
and default to `standalone: true` if they have no preference. Ask first
regardless — this template is what to fill in once the answer (or the
default) is settled, not a shortcut around asking.

### Mandatory Checklist Before Moving to the Template

- [ ] Selector uses `commudle-` prefix
- [ ] `implements OnInit, OnDestroy` declared on the class
- [ ] `private destroy$ = new Subject<void>()` declared
- [ ] `ngOnDestroy` calls both `destroy$.next()` AND `destroy$.complete()`
- [ ] `ChangeDetectionStrategy.OnPush` imported and applied
- [ ] No `any` type used anywhere

### Every `.subscribe()` Must Be Piped

```typescript
// ✅ Always
this.service
  .getData()
  .pipe(takeUntil(this.destroy$))
  .subscribe((data) => {
    this.data = data;
  });

// ❌ Never — memory leak
this.service.getData().subscribe((data) => {
  this.data = data;
});
```

---

## Step 3 — Adding Buttons

Always Nebular. Never custom button components or styles.

```typescript
import { NbButtonModule } from '@commudle/theme';
```

```html
<button nbButton status="primary" size="large" shape="semi-round">Primary</button>
<button nbButton status="info" outline>Secondary</button>
<button nbButton ghost size="small">Ghost</button>
```

`status`: `primary`, `info`, `success`, `warning`, `danger`, `basic`.
`size`: `tiny`, `small`, `medium`, `large`, `giant`.

---

## Step 4 — Adding Icons

```typescript
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCopy, faCheck } from '@fortawesome/free-solid-svg-icons';

export class MyComponent {
  readonly icons = { faCopy, faCheck }; // Always group in readonly icons = {}
}
```

```html
<fa-icon [icon]="icons.faCopy" />
```

Never import the full library (`import { fas }`). Never assign icons as
individual properties (`copyIcon = faCopy`). Never use FontAwesome
without adding `FontAwesomeModule` to `imports`.

---

## Step 5 — Scaffold the Template

Before writing any HTML, check whether a Tailwind UI Block pattern covers
the use case — see `tailwind-ui-blocks.md`. Use it as structural guidance,
write all code from scratch, never copy raw Tailwind UI source.

**Priority order:**

1. Tailwind UI block patterns — layout and structure
2. Nebular (`@commudle/theme`) — all interactive elements
3. Custom SCSS — only when neither above applies

### Common Pattern Starters

**Card:**

```html
<div class="com-rounded-10 com-shadow-Card com-bg-white com-p-6px">
  <div class="com-flex com-items-center com-gap-4">
    <div class="com-flex-1 com-min-w-0">
      <p class="com-text-Card-Subheading com-font-semibold com-text-Yankees-Blue com-truncate"></p>
      <p class="com-text-Paragraph-2 com-text-Cadet-Grey com-truncate"></p>
    </div>
  </div>
</div>
```

**Stacked list:**

```html
<ul class="com-divide-y com-divide-Bright-Gray">
  <li class="com-flex com-items-center com-gap-4 com-py-4">
    <div class="com-flex-1 com-min-w-0">
      <p class="com-text-Paragraph-1 com-text-Yankees-Blue com-truncate"></p>
      <p class="com-text-Paragraph-2 com-text-Cadet-Grey com-truncate"></p>
    </div>
  </li>
</ul>
```

**Empty state:**

```html
<div class="com-text-center com-py-12">
  <h3 class="com-text-Card-Subheading com-font-semibold com-text-Yankees-Blue">No results</h3>
  <p class="com-text-Paragraph-2 com-text-Cadet-Grey com-mt-2px">Supporting message</p>
  <button nbButton status="primary" size="medium" shape="semi-round">Action</button>
</div>
```

---

## Step 6 — Apply Styling Rules

See `styling-guidelines.md` and `design-guardrails.md` in `.november/rules/`
for the full detail — summary here:

- `com-` prefix on every Tailwind class, zero exceptions.
- Pseudo-class prefix goes on the utility, not before it:
  `hover:com-bg-primary-500`, never `com-hover:bg-primary-500`.
- Font size: both the 8 semantic tokens (`com-text-Page-Heading` etc.)
  and standard Tailwind scale classes (`com-text-sm`, `com-text-lg`, etc.)
  are valid — confirmed, see `design-guardrails.md`.
- Colors: named tokens preferred (see `design-guardrails.md`), full
  default Tailwind palette also genuinely available as a fallback for
  real gaps — confirmed, this config uses `extend`. Only `primary-50` is
  a real gap; `gray-50` and `blue-50` both exist.
- No inline styles, ever.
- Responsive design: Tailwind breakpoints only, never `@media` queries
  for layout.
- SCSS nesting: max 3 levels.

---

## Step 7 — Reusable Component Checklist

If this component will be shared across features, verify before
finishing:

- [ ] All logic is self-contained — parent provides only data and config
- [ ] Config interface exported with sensible defaults
- [ ] `@Input()` for data and config, `@Output()` only for optional
      tracking events
- [ ] Custom templates supported via `TemplateRef` and `ng-content`
- [ ] No tight coupling to a specific parent component
- [ ] `README.md` added to the component folder with usage examples

See `reusable-components.md` for the full detail.

---

## Final Pre-Submit Checklist

- [ ] Selector uses `commudle-` prefix
- [ ] Standalone vs. NgModule confirmed with the person, not assumed
- [ ] `implements OnInit, OnDestroy` on class
- [ ] `private destroy$ = new Subject<void>()` declared
- [ ] Every `.subscribe()` piped through `takeUntil(this.destroy$)`
- [ ] `ngOnDestroy` calls both `destroy$.next()` and `destroy$.complete()`
- [ ] `OnPush` change detection applied
- [ ] No `any` type
- [ ] No inline styles
- [ ] All Tailwind classes use `com-` prefix
- [ ] Font size and color tokens checked against `design-guardrails.md`
- [ ] Dark mode bg+text pairing verified
- [ ] Nebular buttons used — no custom button components
- [ ] FontAwesome icons grouped in `readonly icons = {}`
- [ ] No `console.log` statements
- [ ] No custom navigation or headers created
- [ ] Max 3 levels of SCSS nesting
