import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, DataTableColumn, DataTableRow, DataTableConfig } from './data-table.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'commudle-data-table-example',
  standalone: true,
  imports: [CommonModule, DataTableComponent, FontAwesomeModule],
  template: `
    <!-- Usage Example -->
    <div class="data-table-container" style="height: 70vh;">
      <commudle-data-table
        [columns]="columns"
        [rows]="rows"
        [config]="config"
        [isLoading]="isLoading"
        (rowExpand)="onRowExpand($event)"
        (columnResize)="onColumnResize($event)"
      >
        <!-- Expanded content slot -->
        <div slot="expanded-content">
          <p>This is expanded row content</p>
        </div>
      </commudle-data-table>
    </div>

    <!-- Custom header template -->
    <ng-template #customHeaderTemplate let-column="column">
      <div class="com-flex com-gap-3 com-items-center">
        <p>{{ column.title }}</p>
        <fa-icon [icon]="faFilter"></fa-icon>
      </div>
    </ng-template>

    <!-- Custom cell template -->
    <ng-template #customCellTemplate let-row="row" let-column="column" let-value="value">
      <div class="row-cell">
        <strong>{{ value }}</strong>
      </div>
    </ng-template>
  `,
})
export class DataTableExampleComponent {
  @ViewChild('customHeaderTemplate') customHeaderTemplate!: TemplateRef<unknown>;
  @ViewChild('customCellTemplate') customCellTemplate!: TemplateRef<unknown>;

  faFilter = faFilter;
  isLoading = false;

  columns: DataTableColumn[] = [
    {
      key: 'userDetails',
      title: 'User Details',
      width: '360px',
      frozen: true,
      resizable: true,
      filterable: true,
    },
    {
      key: 'insights',
      title: 'Insights',
      width: '480px',
      resizable: true,
      filterable: true,
    },
    {
      key: 'trackSlots',
      title: 'Track Slots',
      width: '350px',
      resizable: true,
    },
    {
      key: 'payment',
      title: 'Payment Details',
      width: '300px',
      resizable: true,
    },
    {
      key: 'question1',
      title: 'Question 1',
      width: '200px',
      resizable: true,
      filterable: true,
    },
  ];

  rows: DataTableRow[] = [
    {
      id: 1,
      userDetails: 'John Doe (john@example.com)',
      insights: 'High engagement',
      trackSlots: 'Track A - 10:00 AM',
      payment: 'Paid - $50',
      question1: 'Sample answer 1',
    },
    {
      id: 2,
      userDetails: 'Jane Smith (jane@example.com)',
      insights: 'Medium engagement',
      trackSlots: 'Track B - 2:00 PM',
      payment: 'Pending - $50',
      question1: 'Sample answer 2',
    },
  ];

  config: DataTableConfig = {
    expandableRows: true,
    resizableColumns: true,
    frozenColumns: true,
    emptyMessage: 'No responses found',
    loadingMessage: 'Loading responses...',
  };

  onRowExpand(row: DataTableRow) {
    console.log('Row expanded:', row);
  }

  onColumnResize(event: { column: string; width: number }) {
    console.log('Column resized:', event);
  }
}
