import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPieChart } from '@fortawesome/free-solid-svg-icons';

export interface DataTableColumn {
  key: string;
  title: string;
  width?: string;
  frozen?: boolean;
  resizable?: boolean;
  filterable?: boolean;
  noPadding?: boolean;
  headerTemplate?: TemplateRef<unknown>;
  cellTemplate?: TemplateRef<unknown>;
}

export interface DataTableRow {
  id: string | number;
  [key: string]: unknown;
}

export interface DataTableConfig {
  expandableRows?: boolean;
  resizableColumns?: boolean;
  frozenColumns?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  noCellPadding?: boolean;
  cellBorders?: 'right' | 'bottom' | 'both' | 'none';
}

@Component({
  selector: 'commudle-data-table',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent implements OnInit, OnDestroy {
  @Input() columns: DataTableColumn[] = [];
  @Input() rows: DataTableRow[] = [];
  @Input() config: DataTableConfig = {};
  @Input() isLoading = false;

  @Output() rowExpand = new EventEmitter<DataTableRow>();
  // Optional output for external components that want to track resize events
  @Output() columnResize = new EventEmitter<{ column: string; width: number }>();

  // Icons
  icons = {
    faPieChart,
  };

  // State
  expandedRows = new Set<string | number>();
  isResizing = false;
  resizingColumn = '';

  // Default config
  defaultConfig: DataTableConfig = {
    expandableRows: false,
    resizableColumns: true,
    frozenColumns: true,
    emptyMessage: 'No entries found',
    loadingMessage: 'Loading...',
    noCellPadding: false,
    cellBorders: 'none',
  };

  ngOnInit() {
    this.config = { ...this.defaultConfig, ...this.config };
  }

  toggleExpandRow(row: DataTableRow) {
    if (this.expandedRows.has(row.id)) {
      this.expandedRows.delete(row.id);
    } else {
      this.expandedRows.add(row.id);
    }
    this.rowExpand.emit(row);
  }

  isRowExpanded(rowId: string | number): boolean {
    return this.expandedRows.has(rowId);
  }

  startResize(event: MouseEvent, columnKey: string) {
    if (!this.config.resizableColumns) return;

    event.preventDefault();
    event.stopPropagation();

    this.isResizing = true;
    this.resizingColumn = columnKey;

    const startX = event.clientX;
    const column = event.target as HTMLElement;
    const th = column.closest('th') as HTMLElement;
    const startWidth = th.offsetWidth;

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(100, startWidth + deltaX); // Minimum width of 100px

      this.updateColumnWidth(columnKey, newWidth);
      this.columnResize.emit({ column: columnKey, width: newWidth });
    };

    const onMouseUp = () => {
      this.isResizing = false;
      this.resizingColumn = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  private updateColumnWidth(columnKey: string, width: number) {
    // Update header width
    const headerElement = document.querySelector(`th[data-column="${columnKey}"]`) as HTMLElement;
    if (headerElement) {
      headerElement.style.width = `${width}px`;
      headerElement.style.minWidth = `${width}px`;
      headerElement.style.maxWidth = `${width}px`;
    }

    // Update all corresponding cell widths
    const cellElements = document.querySelectorAll(`td[data-column="${columnKey}"]`) as NodeListOf<HTMLElement>;
    cellElements.forEach((cell) => {
      cell.style.width = `${width}px`;
      cell.style.minWidth = `${width}px`;
      cell.style.maxWidth = `${width}px`;
    });

    // Update the column definition
    const column = this.columns.find((col) => col.key === columnKey);
    if (column) {
      column.width = `${width}px`;
    }
  }

  getColumnCount(): number {
    return this.columns.length;
  }

  getCellValue(row: DataTableRow, column: DataTableColumn): unknown {
    return row[column.key] || '';
  }

  ngOnDestroy() {
    // Clean up any active resize listeners
    if (this.isResizing) {
      this.isResizing = false;
      this.resizingColumn = '';
      // Note: Event listeners are automatically cleaned up when the component is destroyed
      // but we reset the state to be safe
    }
  }
}
