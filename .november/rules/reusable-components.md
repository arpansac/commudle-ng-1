# Reusable Component Development Guidelines

When creating reusable components in this Angular project, follow these
principles to ensure components are truly reusable, maintainable, and
self-contained.

> **Resolved.** `angular-development.md`'s general rule is: ask every
> time, default to `standalone: true` if the person has no preference.
> That default happens to match what this file's "Standalone Components"
> principle below states — so in practice, a reusable component with no
> stated preference lands on `standalone: true` either way. The
> difference that still matters: this file's wording reads as settled/
> non-negotiable, while the actual rule is ask-first-then-default — still
> ask, even for reusable components, don't skip straight to `true`
> because this file says so.

## Core Principles

### 1. Self-Contained Functionality

- All logic should be internal: components handle their own state, events,
  and behavior without requiring external implementation.
- No external dependencies for core features — resize, sort, filter should
  work out-of-the-box.
- Minimal parent component involvement — parent provides data and
  configuration, not logic.

### 2. Standalone Components

- Use Angular standalone components: `standalone: true` in the decorator.
- Explicit imports — import all required modules directly in the
  component.
- No module dependencies — the component works without being declared in
  a module.

### 3. Configuration Over Implementation

- Configuration objects for customization.
- Sensible defaults for all configuration.
- Optional features, opt-in via configuration flags.

### 4. Template Flexibility

- Support custom templates via `TemplateRef`.
- Content projection via `ng-content` with slots.
- Always provide default templates as fallback.

## Component Structure Template

```typescript
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ComponentConfig {
  feature1?: boolean;
  feature2?: boolean;
}

@Component({
  selector: 'app-reusable-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
})
export class ReusableComponent implements OnInit, OnDestroy {
  @Input() data: any[] = [];
  @Input() config: ComponentConfig = {};
  @Input() customTemplate?: TemplateRef<unknown>;

  @Output() actionPerformed = new EventEmitter<any>();

  private defaultConfig: ComponentConfig = {
    feature1: true,
    feature2: false,
  };

  ngOnInit() {
    this.config = { ...this.defaultConfig, ...this.config };
  }

  private handleInternalLogic() {
    // All logic here, not in parent
  }

  ngOnDestroy() {
    // Cleanup
  }
}
```

## Best Practices

### DO ✅

1. Handle all internal logic:

   ```typescript
   startResize(event: MouseEvent) {
     this.updateColumnWidth();
     this.emit({ optional: 'tracking' });
   }
   ```

2. Provide configuration interfaces:

   ```typescript
   export interface TableConfig {
     resizable?: boolean;
     sortable?: boolean;
     filterable?: boolean;
   }
   ```

3. Use sensible defaults:

   ```typescript
   defaultConfig = {
     resizable: true,
     sortable: true,
     filterable: false,
   };
   ```

4. Support custom templates:

   ```typescript
   @Input() headerTemplate?: TemplateRef<unknown>;
   @Input() cellTemplate?: TemplateRef<unknown>;
   ```

5. Make outputs optional:

   ```typescript
   @Output() columnResize = new EventEmitter<{column: string, width: number}>();
   ```

### DON'T ❌

1. Don't require external implementation:

   ```typescript
   // Bad — parent must implement resize logic
   @Output() resizeStart = new EventEmitter<MouseEvent>();
   @Output() resizeMove = new EventEmitter<MouseEvent>();
   @Output() resizeEnd = new EventEmitter<void>();
   ```

2. Don't expose internal state unnecessarily:

   ```typescript
   // Bad
   @Input() isResizing: boolean;
   @Input() currentColumn: string;
   ```

3. Don't require the parent to manage component state:

   ```typescript
   // Bad — parent must track expanded rows
   @Input() expandedRows: Set<number>;
   ```

4. Don't create tight coupling:

   ```typescript
   // Bad — component depends on parent's methods
   @Input() onResize: (column: string, width: number) => void;
   ```

## Component Location

- Shared components: `apps/commudle-admin/src/app/app-shared-components/`.
- Feature-specific: keep in the feature module if not reusable.
- Library components: consider `libs/` if used across multiple apps.

## Documentation Requirements

Every reusable component must include:

1. `README.md` — description, features, usage examples (basic + advanced),
   API reference (inputs/outputs/interfaces), configuration options,
   browser support.
2. Example component — basic usage, advanced usage with custom templates,
   all configuration options.
3. TypeScript interfaces for configuration objects, data models, event
   payloads.

## Testing Reusability

Before considering a component "reusable," verify:

- [ ] Works without any external logic implementation
- [ ] Works with default configuration
- [ ] All features work out-of-the-box
- [ ] Parent provides only data and config
- [ ] No tight coupling to specific use cases
- [ ] Cleans up resources on destroy
- [ ] Documented with examples

## Example: Data Table Component

✅ Good:

```html
<app-data-table [columns]="columns" [rows]="rows" [config]="{ resizable: true, sortable: true }"> </app-data-table>
```

❌ Bad:

```html
<app-data-table
  [columns]="columns"
  [rows]="rows"
  (resizeStart)="handleResizeStart($event)"
  (resizeMove)="handleResizeMove($event)"
  (resizeEnd)="handleResizeEnd()"
>
</app-data-table>
```

## Migration Strategy

When refactoring an existing component to be reusable:

1. Identify external dependencies — find all logic in parent components.
2. Move logic to the component — internalize all feature logic.
3. Create a configuration interface — replace inputs with a config object.
4. Make outputs optional — for tracking only.
5. Add default values — the component works without configuration.
6. Update documentation — README and examples.
7. Test independently — verify it works in isolation.

## Review Checklist

- [ ] Component is standalone
- [ ] All logic is self-contained
- [ ] Configuration has sensible defaults
- [ ] Outputs are optional
- [ ] Custom templates supported
- [ ] Proper cleanup in `ngOnDestroy`
- [ ] `README.md` included
- [ ] Example component included
- [ ] TypeScript interfaces exported
- [ ] No tight coupling to specific use cases
- [ ] Works without external implementation

---

**Remember**: a truly reusable component should work perfectly with just
data and configuration inputs. If a parent component needs to implement
logic for the component to work, it's not truly reusable.
