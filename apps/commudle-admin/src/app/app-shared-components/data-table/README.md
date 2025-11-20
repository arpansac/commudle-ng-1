# Reusable Data Table Component

A focused, reusable data table component that provides the core table functionality with frozen columns, resizable columns, and custom templates.

## Features

- ✅ Standalone Angular component
- ✅ Frozen/sticky columns
- ✅ Resizable columns
- ✅ Custom header and cell templates
- ✅ Expandable rows
- ✅ Loading and empty states
- ✅ Mobile responsive
- ✅ TypeScript support
- ✅ Minimal and focused (just the table, no card wrapper)

## Usage

### Basic Usage

```typescript
import { DataTableComponent, DataTableColumn, DataTableRow, DataTableConfig } from './data-table.component';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [DataTableComponent],
  template: `
    <div class="data-table-container" style="height: 70vh;">
      <commudle-data-table
        [columns]="columns"
        [rows]="rows"
        [config]="config"
        [isLoading]="isLoading"
        (rowExpand)="onRowExpand($event)"
      >
      </commudle-data-table>
    </div>
  `,
})
export class MyComponent {
  columns: DataTableColumn[] = [
    {
      key: 'name',
      title: 'Name',
      width: '200px',
      frozen: true,
      resizable: true,
      filterable: true,
    },
    {
      key: 'email',
      title: 'Email',
      width: '250px',
      resizable: true,
    },
  ];

  rows: DataTableRow[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ];

  config: DataTableConfig = {
    expandableRows: true,
    resizableColumns: true,
    frozenColumns: true,
  };

  isLoading = false;
}
```

### Advanced Usage with Custom Templates

```html
<div class="data-table-container" style="height: 70vh;">
  <commudle-data-table
    [columns]="columns"
    [rows]="rows"
    [config]="config"
    [isLoading]="isLoading"
    (rowExpand)="onRowExpand($event)"
  >
    <!-- Expanded row content -->
    <div slot="expanded-content">
      <app-user-details [user]="selectedUser"></app-user-details>
    </div>
  </commudle-data-table>
</div>

<!-- Custom header template -->
<ng-template #customHeaderTemplate let-column="column">
  <div class="com-flex com-gap-3 com-items-center">
    <p>{{ column.title }}</p>
    <fa-icon [icon]="faFilter" (click)="openFilter(column)"></fa-icon>
  </div>
</ng-template>

<!-- Custom cell template -->
<ng-template #customCellTemplate let-row="row" let-column="column" let-value="value">
  <div class="row-cell">
    <app-user-details-cell [userResponse]="row" [community]="community" [event]="event"></app-user-details-cell>
  </div>
</ng-template>
```

```typescript
export class MyComponent {
  @ViewChild('customHeaderTemplate') customHeaderTemplate!: TemplateRef<unknown>;
  @ViewChild('customCellTemplate') customCellTemplate!: TemplateRef<unknown>;

  ngAfterViewInit() {
    // Assign custom templates to columns
    this.columns[0].headerTemplate = this.customHeaderTemplate;
    this.columns[0].cellTemplate = this.customCellTemplate;
  }
}
```

## API Reference

### Inputs

| Property    | Type                | Default | Description         |
| ----------- | ------------------- | ------- | ------------------- |
| `columns`   | `DataTableColumn[]` | `[]`    | Column definitions  |
| `rows`      | `DataTableRow[]`    | `[]`    | Data rows           |
| `config`    | `DataTableConfig`   | `{}`    | Table configuration |
| `isLoading` | `boolean`           | `false` | Loading state       |

### Outputs

| Event          | Type                              | Description                                                      |
| -------------- | --------------------------------- | ---------------------------------------------------------------- |
| `rowExpand`    | `DataTableRow`                    | Emitted when row is expanded                                     |
| `columnResize` | `{column: string, width: number}` | Optional: Emitted when column is resized (for external tracking) |

### Interfaces

#### DataTableColumn

```typescript
interface DataTableColumn {
  key: string; // Unique column identifier
  title: string; // Column header text
  width?: string; // Column width (e.g., '200px')
  frozen?: boolean; // Whether column is frozen/sticky
  resizable?: boolean; // Whether column is resizable
  filterable?: boolean; // Whether column shows filter icon
  headerTemplate?: TemplateRef<unknown>; // Custom header template
  cellTemplate?: TemplateRef<unknown>; // Custom cell template
}
```

#### DataTableRow

```typescript
interface DataTableRow {
  id: string | number; // Unique row identifier
  [key: string]: unknown; // Dynamic properties matching column keys
}
```

#### DataTableConfig

```typescript
interface DataTableConfig {
  expandableRows?: boolean; // Enable row expansion
  resizableColumns?: boolean; // Enable column resizing
  frozenColumns?: boolean; // Enable frozen columns
  emptyMessage?: string; // Custom empty state message
  loadingMessage?: string; // Custom loading message
}
```

## Content Projection

The component supports content projection for expanded row content:

```html
<commudle-data-table [columns]="columns" [rows]="rows">
  <div slot="expanded-content">
    <!-- Content to show when row is expanded -->
    <p>Expanded row details go here</p>
  </div>
</commudle-data-table>
```

## Styling

The component uses Tailwind CSS classes with the `com-` prefix. The table structure follows the same styling as the original:

- `.custom-table-wrapper` - Main table container
- `.custom-data-table` - Table element
- `.table-header` - Header section
- `.table-body` - Body section
- `.frozen-column` - Frozen/sticky columns
- `.resizable-column` - Resizable columns

## Integration with Existing Code

To replace the existing table in `event-form-responses.component.html`, simply replace the table section:

```html
<!-- Replace this section -->
<div class="custom-table-wrapper">
  <table class="custom-data-table">
    <!-- ... existing table content ... -->
  </table>
</div>

<!-- With this -->
<commudle-data-table
  [columns]="tableColumns"
  [rows]="rows"
  [config]="tableConfig"
  [isLoading]="isLoading"
  (rowExpand)="toggleExpandRow($event)"
>
  <!-- Expanded content -->
  <div slot="expanded-content">
    <!-- Your existing expanded row content -->
  </div>
</commudle-data-table>
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
