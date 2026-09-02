# Angular Development Standards

## Standalone vs. NgModule — Ask Every Time, Default to Standalone

Before generating any new component, ask which the person wants —
standalone or NgModule-based. This repo has components of both kinds, and
the right choice depends on context you don't have automatically. If the
person has no preference or doesn't specify, default to
`standalone: true` — don't leave it unresolved or guess `false`.

The one fixed exception: public page section-generator components are
governed by their own spec (`public-page-section-generation.md`, in
`.november/skills/`) and are always `standalone: true` regardless of this
rule — not a case where the default applies, it's simply not asked about
there.

## Technology Stack

- **Angular**: 19.2.9
- **TypeScript**: ~5.8.0
- **RxJS**: ~7.8.0
- **Nx**: 21.6.2
- **Nebular**: primary UI library (Eva Design System) — always via
  `@commudle/theme`, see `imports.md`
- **Tailwind CSS**: ^3.0.2 — see `styling-guidelines.md`
- **FontAwesome**: ^1.0.0

## Component Structure

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'commudle-component-name',
  standalone: true, // or false — ask first, see above
  imports: [CommonModule],
  templateUrl: './component-name.component.html',
  styleUrls: ['./component-name.component.scss'],
})
export class ComponentNameComponent implements OnInit, OnDestroy {
  constructor() {}

  ngOnInit() {
    // Initialization logic
  }

  ngOnDestroy() {
    // Cleanup — always unsubscribe from observables
  }
}
```

## Naming Conventions

### Files

- Component: `kebab-case.component.ts`
- Service: `kebab-case.service.ts`
- Model/Interface: `kebab-case.model.ts`
- Module: `kebab-case.module.ts`

### Classes

- Component: `PascalCase` + `Component` suffix
- Service: `PascalCase` + `Service` suffix
- Interface: `I` + `PascalCase`

### Selectors

- Format: `commudle-[feature-name]`
- Examples: `commudle-user-profile`, `commudle-hackathon-form`

## Directory Structure

```
feature-modules/
  └── [feature-name]/
      ├── components/
      │   └── [component-name]/
      │       ├── [component-name].component.ts
      │       ├── [component-name].component.html
      │       ├── [component-name].component.scss
      │       └── [component-name].component.spec.ts
      ├── services/
      │   └── [service-name].service.ts
      ├── models/
      │   └── [model-name].model.ts
      └── [feature-name].module.ts
```

## Change Detection

- Use `OnPush` when possible — not mandatory for general components, but
  worth defaulting to unless there's a reason not to.

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

## Observable Management

- Always unsubscribe in `ngOnDestroy`. Two accepted patterns — pick
  whichever fits the situation:

```typescript
// Option A — takeUntil, for multiple subscriptions
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {});
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// Option B — async pipe in template, for a single stream
data$ = this.service.getData();
```

- Never nest subscriptions — use `switchMap`/`combineLatest` instead.
- Never subscribe inside a service — only components subscribe; services
  return `Observable<T>`.

## Lifecycle Hooks

- Keep constructor logic minimal — dependency injection only.
- Initialize in `ngOnInit`, clean up in `ngOnDestroy`.

## Component Communication

- `@Input()` for parent-to-child, typed, always.
- `@Output()` with `EventEmitter` for child-to-parent.
- Services for sibling communication.
- Keep components loosely coupled.

## Code Generation

```bash
npx nx g @nx/angular:component <component-name>
npx nx g @nx/angular:service <service-name>
npx nx g @nx/angular:interface <interface-name>
```

## Development Workflow

```bash
# Dev server
npx nx run commudle-admin:serve   # http://localhost:4200/

# Production build
npx nx reset
npx nx run commudle-admin:release

# Tests
npx nx test commudle-admin

# Lint
npx nx lint commudle-admin
```

## Error Handling

```typescript
this.http
  .get(url)
  .pipe(
    takeUntil(this.destroy$),
    catchError((error) => {
      console.error('Error:', error);
      return throwError(() => error);
    }),
  )
  .subscribe();
```

## Accessibility

- Proper ARIA labels, semantic HTML, keyboard navigation.
- Visible focus indicators.
- Don't implement focus trapping manually — use Nebular dialog or an
  established overlay pattern.

## SSR Safety

Guard any browser-only API:

```typescript
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

constructor(@Inject(PLATFORM_ID) private platformId: object) {}

ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    // window, document, localStorage access here only
  }
}
```

## Code Quality Checklist

- [ ] Single responsibility per component
- [ ] Standalone vs. NgModule — confirmed with the person, not assumed
- [ ] Proper lifecycle hooks
- [ ] `OnPush` where it makes sense
- [ ] All observables unsubscribed
- [ ] No `any` type
- [ ] No `console.log` in production code
- [ ] Errors handled
- [ ] Naming conventions followed
