# Development Guidelines

## File Organization

- One component/service/pipe per file.
- Descriptive, kebab-case file names matching the class name:
  - Components: `component-name.component.ts`
  - Services: `service-name.service.ts`
  - Pipes: `pipe-name.pipe.ts`
  - Models: `model-name.model.ts`
- Colocate related files: component, template, styles, spec together.

## Code Formatting

- 2-space indentation, no tabs.
- Aim for 120 characters per line max.
- Semicolons required.
- Single quotes for strings.
- Trailing commas in multi-line objects and arrays.

## Naming Conventions

### TypeScript Classes and Interfaces

- Classes: PascalCase with descriptive suffixes — `FillDataFormPaidComponent`, `DataFormEntitiesService`, `SafeHtmlPipe`.
- Interfaces: PascalCase with `I` prefix — `IPositionStats`, `IScrollerDistance`, `IDataFormEntity`.
- Enums: PascalCase with `E` prefix — `EDbModels`, `EBuildType`.

### Variables and Functions

- Variables: camelCase, descriptive. Boolean variables prefixed `is`, `has`, `should`, `can` — `isFormDirty`, `hasRefundPolicy`, `shouldFireScrollEvent`.
- Functions: camelCase with verb prefixes — `getDataFormEntity()`, `fetchPaidTicketingData()`, `updateUserDetails()`.
- Constants: `UPPER_SNAKE_CASE`, or camelCase for complex objects.

### CSS/SCSS Classes

- Always kebab-case: `.fill-data-form-paid`, `.payment-dialog`.
- Never BEM (`__`, `--`).
- Component-scoped, prefixed with the component name.
- Nested hierarchy — always nest child classes under their parent. See
  `styling-guidelines.md` for the full styling rules.

## TypeScript Standards

- Explicit typing on function parameters and return values, always.
- Define interfaces for all data structures.
- Avoid `any` — use a specific type, or `unknown` when the type is
  genuinely dynamic.
- Use `?` for optional interface properties.
- Prefer arrow functions for callbacks and short functions, destructuring,
  spread, template literals, optional chaining, nullish coalescing.

## Component Class Organization

Order class members consistently:

```typescript
export class ComponentName implements OnInit, OnDestroy, AfterViewInit {
  // 1. Input/Output decorators
  @Input() existingResponses;
  @Output() formSubmitted = new EventEmitter();

  // 2. ViewChild/ViewChildren decorators
  @ViewChild('paymentDialog', { static: true }) paymentDialog: TemplateRef<any>;

  // 3. Public properties
  dataFormEntity: IDataFormEntity;

  // 4. Private properties
  private destroy$ = new Subject<void>();

  // 5. Constructor with dependency injection
  constructor(private activatedRoute: ActivatedRoute, private dataFormEntitiesService: DataFormEntitiesService) {}

  // 6. Lifecycle hooks
  ngOnInit() {}
  ngAfterViewInit() {}
  ngOnDestroy() {}

  // 7. Public methods
  submitForm() {}

  // 8. Private methods
  private setupCurrentUser() {}
}
```

## RxJS and Observables

Subject-based cleanup, same pattern as `angular-development.md`'s Option A:

```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.authWatchService.currentUser$
    .pipe(takeUntil(this.destroy$))
    .subscribe((data) => {
      this.currentUser = data;
    });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

## Forms

Reactive forms pattern:

```typescript
forms: FormGroup[] = [];

addNewUser() {
  const newForm = this.fb.group({
    additional_users: this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    }),
  });
  this.forms.push(newForm);
}
```

## User Feedback & Error Handling

- Toast notifications: use `LibToastLogService`.
- Dialog modals: use `NbDialogService`.
- **Every dialog/popup must have a close (×) button** in `nb-card-header`:

```html
<nb-card-header class="com-flex com-justify-between com-items-center">
  <span>Dialog Title</span>
  <button ghost nbButton size="small" (click)="ref.close()" shape="round">
    <nb-icon icon="close"></nb-icon>
  </button>
</nb-card-header>
```

## Performance Optimization

- Dynamic imports for heavy libraries:

```typescript
ngAfterViewInit(): void {
  import('lottie-web').then((l) => {
    l.default.loadAnimation({
      container: this.consentAnimationContainer?.nativeElement,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: 'https://lottie.host/animation.json',
    });
  });
}
```

- `OnPush` for performance-critical components; prefer immutable data
  updates for better change detection.

## Best Practices Summary

1. Type everything.
2. Unsubscribe observables, always.
3. Prefer pure, stateless, predictable functions.
4. Keep components small and focused.
5. Business logic belongs in services, not components.
6. Handle errors gracefully, always.
7. Give clear user feedback for every action.
8. Lazy-load heavy dependencies.
9. Set SEO tags on every routed page — see `seo-meta-tags.md`.
10. Consistent file and class structure.
11. Barrel exports and path aliases — see `imports.md`.
12. Naming conventions, followed consistently.
