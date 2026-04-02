# Development Guidelines

## Code Quality Standards

### File Organization
- **One component/service/pipe per file**: Each file contains a single Angular artifact
- **Descriptive file naming**: Use kebab-case for file names matching the class name
  - Components: `component-name.component.ts`
  - Services: `service-name.service.ts`
  - Pipes: `pipe-name.pipe.ts`
  - Models: `model-name.model.ts`
- **Colocation**: Keep related files together (component, template, styles, spec)

### Code Formatting
- **Indentation**: 2 spaces (no tabs)
- **Line length**: Aim for 120 characters maximum
- **Semicolons**: Required at end of statements
- **Quotes**: Single quotes for strings
- **Trailing commas**: Used in multi-line objects and arrays

### Naming Conventions

#### TypeScript Classes and Interfaces
- **Classes**: PascalCase with descriptive suffixes
  - Components: `FillDataFormPaidComponent`
  - Services: `DataFormEntitiesService`
  - Pipes: `SafeHtmlPipe`
- **Interfaces**: PascalCase with `I` prefix
  - `IPositionStats`, `IScrollerDistance`, `IDataFormEntity`
  - `ICurrentUser`, `IEvent`, `ICommunity`
- **Enums**: PascalCase with `E` prefix
  - `EDbModels`, `EBuildType`

#### Variables and Functions
- **Variables**: camelCase with descriptive names
  - `dataFormEntity`, `currentUser`, `eventTicketOrders`
  - Boolean variables: prefix with `is`, `has`, `should`, `can`
    - `isFormDirty`, `hasRefundPolicy`, `shouldFireScrollEvent`, `canBeApplied`
- **Functions**: camelCase with verb prefixes
  - `getDataFormEntity()`, `fetchPaidTicketingData()`, `updateUserDetails()`
  - `createTicketOrder()`, `submitForm()`, `calculateTaxAmount()`
- **Constants**: UPPER_SNAKE_CASE or camelCase for complex objects
  - `countries_details`, `API_ROUTES`

#### CSS/SCSS Classes
- **Always use kebab-case**: `.fill-data-form-paid`, `.payment-dialog`
- **Never use BEM notation**: Avoid `__` and `--` separators
- **Component-scoped**: Prefix with component name
- **Nested hierarchy**: Always nest child classes under parent

### TypeScript Standards

#### Type Safety
- **Explicit typing**: Always declare types for function parameters and return values
```typescript
export function shouldFireScrollEvent(
  container: IPositionStats, 
  distance: IScrollerDistance, 
  scrollingDown: boolean
): boolean {
  // implementation
}
```

- **Interface usage**: Define interfaces for all data structures
```typescript
interface IPositionStats {
  height: number;
  scrolled: number;
  totalToScroll: number;
  isWindow: boolean;
}
```

- **Avoid `any`**: Use specific types or `unknown` when type is truly dynamic
- **Optional properties**: Use `?` for optional interface properties
- **Union types**: Use for variables that can have multiple types

#### Modern TypeScript Features
- **Arrow functions**: Preferred for callbacks and short functions
```typescript
this.forms.forEach((form) => {
  if (form.invalid) {
    form.markAllAsTouched();
  }
});
```

- **Destructuring**: Extract properties from objects
```typescript
const { axis, container, isWindow } = resolver;
const { offsetHeightKey, clientHeightKey } = extractHeightPropKeys(axis);
```

- **Spread operator**: For object and array manipulation
```typescript
return { ...resolver, container };
```

- **Template literals**: For string interpolation
```typescript
this.seoService.setTitle(`${this.dataFormEntity.name} | ${this.event.name}`);
```

- **Optional chaining**: Safe property access
```typescript
this.consentAnimationContainer?.nativeElement
```

- **Nullish coalescing**: Default values
```typescript
contact: this.currentUser.phone ? this.currentUser.phone : ''
```

## Angular-Specific Patterns

### Component Structure

#### Component Metadata
```typescript
@Component({
  selector: 'commudle-fill-data-form-paid',
  templateUrl: './fill-data-form-paid.component.html',
  styleUrls: ['./fill-data-form-paid.component.scss'],
  standalone: false  // Explicitly set for module-based components
})
```

#### Lifecycle Hooks Order
1. `ngOnInit()`: Initialization logic
2. `ngAfterViewInit()`: After view initialization
3. `ngOnDestroy()`: Cleanup logic

#### Component Class Organization
```typescript
export class ComponentName implements OnInit, OnDestroy, AfterViewInit {
  // 1. Input/Output decorators
  @Input() existingResponses;
  @Output() formSubmitted = new EventEmitter();
  
  // 2. ViewChild/ViewChildren decorators
  @ViewChild('paymentDialog', { static: true }) paymentDialog: TemplateRef<any>;
  @ViewChild(DataFormFillComponent) dataFormFillComponent: DataFormFillComponent;
  
  // 3. Public properties
  dataFormEntity: IDataFormEntity;
  currentUser: ICurrentUser;
  
  // 4. Private properties
  private destroy$ = new Subject<void>();
  
  // 5. Constructor with dependency injection
  constructor(
    private activatedRoute: ActivatedRoute,
    private dataFormEntitiesService: DataFormEntitiesService,
    // ... other services
  ) {}
  
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

### Dependency Injection

#### Service Injection
- **Constructor injection**: All dependencies injected via constructor
- **Private by default**: Services are typically private unless accessed in template
```typescript
constructor(
  private activatedRoute: ActivatedRoute,
  private router: Router,
  private seoService: SeoService,
  private toastLogService: LibToastLogService,
) {}
```

### RxJS and Observables

#### Subscription Management
- **Subject for cleanup**: Use `Subject` with `takeUntil` for automatic unsubscription
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

- **Subscription array**: Alternative pattern for managing subscriptions
```typescript
subscriptions: Subscription[] = [];

ngOnInit() {
  this.subscriptions.push(
    this.activatedRoute.params.subscribe((params) => {
      // handle params
    })
  );
}

ngOnDestroy() {
  this.subscriptions.forEach((subscription) => subscription.unsubscribe());
}
```

#### Observable Operators
- **takeUntil**: Automatic unsubscription
- **finalize**: Cleanup after observable completes
- **map**: Transform data
- **filter**: Filter data streams
- **switchMap**: Switch to new observable

### Forms

#### Reactive Forms Pattern
```typescript
// Form group creation
forms: FormGroup[] = [];

addNewUser() {
  const newForm = this.fb.group({
    additional_users: this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_country_code: ['', Validators.required],
      phone_number: ['', Validators.required],
    }),
  });
  this.forms.push(newForm);
}

// Form validation
submitForm() {
  let allFormsValid = true;
  this.forms.forEach((form) => {
    if (form.invalid) {
      form.markAllAsTouched();
      allFormsValid = false;
    }
  });
  
  if (!allFormsValid) {
    this.toastLogService.warningDialog('Please fill in all required fields');
    return;
  }
  // proceed with submission
}
```

### Pipes

#### Pipe Implementation
```typescript
@Pipe({
  name: 'safeHtml',
  standalone: false
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}
  
  transform(html: string): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(html);
  }
}
```

- **Pure pipes**: Default, only re-evaluate when input changes
- **Impure pipes**: Set `pure: false` for pipes that need to run on every change detection
- **Standalone flag**: Explicitly set to `false` for module-based pipes

## Import Organization

### Import Order
```typescript
// 1. Angular core imports
import { Component, OnDestroy, OnInit, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// 2. Third-party libraries
import { NbDialogRef, NbDialogService } from '@commudle/theme';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { faRotateRight, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

// 3. Application services
import { DataFormEntitiesService } from 'apps/commudle-admin/src/app/services/data-form-entities.service';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';

// 4. Application models
import { IDataFormEntity } from 'apps/shared-models/data_form_entity.model';
import { ICurrentUser } from 'apps/shared-models/current_user.model';

// 5. Application components
import { DataFormFillComponent } from 'apps/shared-components/data-form-fill/data-form-fill.component';
```

### Import Conventions
- **Barrel exports**: Use `@commudle/shared-services` and `@commudle/shared-models`
- **Nebular imports**: Always from `@commudle/theme`, never from `@nebular/theme`
- **Path aliases**: Use configured path aliases from `tsconfig.base.json`
- **Relative imports**: Avoid deep relative paths, use aliases instead

## Utility Functions

### Pure Functions
- **Stateless**: Functions don't modify external state
- **Predictable**: Same input always produces same output
- **Exported**: Utility functions are exported for reusability
```typescript
export function shouldFireScrollEvent(
  container: IPositionStats, 
  distance: IScrollerDistance, 
  scrollingDown: boolean
): boolean {
  let remaining: number;
  let containerBreakpoint: number;
  
  if (container.totalToScroll <= 0) {
    return false;
  }
  
  // calculation logic
  return remaining <= containerBreakpoint;
}
```

### Function Composition
- **Small, focused functions**: Each function does one thing well
- **Composable**: Functions can be combined to create complex behavior
```typescript
export function getScrollStats(
  lastScrollPosition: number, 
  container: IPositionStats, 
  distance: IScrollerDistance
) {
  const scrollDown = isScrollingDownwards(lastScrollPosition, container);
  return {
    fire: shouldFireScrollEvent(container, distance, scrollDown),
    scrollDown,
  };
}
```

## Error Handling

### Service-Level Error Handling
```typescript
this.dataFormEntitiesService.getDataFormEntity(dataFormEntityId).subscribe(
  (data) => {
    this.dataFormEntity = data;
  },
  (error) => {
    this.errorHandler.handleError(404, 'You cannot fill this form');
  }
);
```

### User Feedback
- **Toast notifications**: Use `LibToastLogService` for user feedback
```typescript
this.toastLogService.successDialog('Your Payment Was Received Successfully', 3000);
this.toastLogService.warningDialog('Please fill in all required fields');
```

- **Dialog modals**: Use `NbDialogService` for important messages
```typescript
this.dialogService.open(this.paymentErrorDialog, {
  closeOnBackdropClick: false,
});
```

- **Dialog close button**: **ALWAYS** add a close (×) button in `nb-card-header` for every dialog/popup. Use flex layout with `justify-between` to push the close button to the right.
```html
<nb-card-header class="com-flex com-justify-between com-items-center">
  <span>Dialog Title</span>
  <button ghost nbButton size="small" (click)="ref.close()" shape="round">
    <nb-icon icon="close"></nb-icon>
  </button>
</nb-card-header>
```

## Testing Configuration

### Jest Configuration
```typescript
export default {
  displayName: 'project-name',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/project-name',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
```

## Performance Optimization

### Lazy Loading
- **Dynamic imports**: Use for heavy libraries
```typescript
ngAfterViewInit(): void {
  import('lottie-web').then((l) => {
    l.default.loadAnimation({
      container: this.consentAnimationContainer?.nativeElement,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: 'https://lottie.host/81ecf9b7-b435-487c-b2d5-1386e690df6f/AQjcda3Dkr.json',
    });
  });
}
```

### Change Detection
- **OnPush strategy**: Consider for performance-critical components
- **Immutable data**: Prefer immutable updates for better change detection

## SEO and Meta Tags

### SEO Service Usage
```typescript
// Set page title
this.seoService.setTitle(`${this.dataFormEntity.name} | ${this.event.name}`);

// Set meta tags
this.seoService.setTags(
  `${this.dataFormEntity.name}`,
  `Fill the form for ${this.dataFormEntity.name}`,
  'https://commudle.com/assets/images/commudle-logo192.png'
);

// Set specific tag
this.seoService.setTag('og:image', this.event.header_image_path);
```

## Third-Party Integrations

### Payment Integration Pattern
```typescript
// Stripe
this.stripeService.confirmPayment({
  elements: this.paymentElement.elements,
  redirect: 'if_required',
}).subscribe((result) => {
  if (result.error) {
    // handle error
  } else {
    // handle success
  }
});

// Razorpay
const options = {
  key: environment.razorpay_key,
  order_id: order.rzp_order_id,
  handler: (response: any) => {
    // handle success
  },
  modal: {
    ondismiss: () => {
      // handle dismissal
    },
  },
};
const rzp1 = new Razorpay(options);
rzp1.open();
```

## Code Comments

### When to Comment
- **Complex logic**: Explain non-obvious algorithms
- **Business rules**: Document business logic and constraints
- **Workarounds**: Explain temporary solutions
- **TODOs**: Mark incomplete or future work

### When NOT to Comment
- **Self-explanatory code**: Good naming makes comments unnecessary
- **Obvious operations**: Don't comment what the code clearly does

### Comment Style
```typescript
// Single-line comments for brief explanations

/**
 * Multi-line comments for function documentation
 * @param container - The position statistics
 * @param distance - The scroller distance configuration
 * @returns Whether the scroll event should fire
 */
```

## Constants and Configuration

### Icon Constants
```typescript
faIcon = {
  faRotateRight,
  faCircleCheck,
  faTriangleExclamation,
  faUndo,
  faCircleXmark,
};
```

### Configuration Objects
```typescript
elementsOptions: StripeElementsOptions = {
  locale: 'auto',
};
```

## State Management

### Component State
- **Public properties**: For template binding
- **Private properties**: For internal component logic
- **Subject/BehaviorSubject**: For reactive state management

### State Updates
- **Immutable updates**: Create new objects rather than mutating
- **Reactive patterns**: Use observables for state changes
- **Form state**: Use Angular Reactive Forms for form state

## Routing

### Route Parameters
```typescript
this.activatedRoute.params.subscribe((params) => {
  this.getDataFormEntity(params.data_form_entity_id);
});
```

### Query Parameters
```typescript
this.activatedRoute.queryParams.subscribe((data) => {
  if (data.next) {
    this.redirectRoute = [decodeURIComponent(data.next)];
  }
});
```

### Programmatic Navigation
```typescript
this.router.navigate(['/fill-form', this.dataFormEntity.id, 'submitted'], {
  queryParams: { eto_uuid: this.eventTicketOrders[0].uuid },
});
```

## Best Practices Summary

1. **Type everything**: Use TypeScript's type system fully
2. **Unsubscribe observables**: Always clean up subscriptions
3. **Pure functions**: Prefer stateless, predictable functions
4. **Small components**: Keep components focused and manageable
5. **Service layer**: Business logic belongs in services
6. **Error handling**: Always handle errors gracefully
7. **User feedback**: Provide clear feedback for all actions
8. **Performance**: Lazy load heavy dependencies
9. **SEO**: Set appropriate meta tags for all pages
10. **Testing**: Write tests for critical functionality
11. **Code organization**: Follow consistent file and class structure
12. **Import management**: Use barrel exports and path aliases
13. **Naming conventions**: Follow established patterns consistently
14. **Documentation**: Comment complex logic and business rules
15. **Accessibility**: Ensure components are accessible
