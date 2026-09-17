import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NbCheckboxModule, NbIconModule, NbInputModule } from '@commudle/theme';
import { CommudleButtonModule } from '@commudle/commudle-theme';
import { ICertificateBatch, ICertificateVariable } from '@commudle/shared-models';
import { CertificateVariableService } from '@commudle/shared-services';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { Subject, takeUntil } from 'rxjs';
import { DataTableColumn, DataTableComponent, DataTableConfig, DataTableRow } from '../../../../app-shared-components/data-table/data-table.component';

@Component({
  selector: 'commudle-certificate-variables-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CommudleButtonModule,
    NbInputModule,
    NbCheckboxModule,
    NbIconModule,
    FontAwesomeModule,
    SharedComponentsModule,
    DataTableComponent,
  ],
  templateUrl: './certificate-variables-panel.component.html',
  styleUrls: ['./certificate-variables-panel.component.scss'],
})
export class CertificateVariablesPanelComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() batch: ICertificateBatch;
  @Output() variablesChanged = new EventEmitter<void>();

  @ViewChild('labelCell') labelCellTemplate: TemplateRef<unknown>;
  @ViewChild('defaultValueCell') defaultValueCellTemplate: TemplateRef<unknown>;
  @ViewChild('keepCell') keepCellTemplate: TemplateRef<unknown>;
  @ViewChild('deleteCell') deleteCellTemplate: TemplateRef<unknown>;

  variables: ICertificateVariable[] = [];
  isLoading = true;
  showAddForm = false;
  addForm: FormGroup;
  icons = { faPlus, faTrash };

  tableColumns: DataTableColumn[] = [];
  tableRows: DataTableRow[] = [];
  tableConfig: DataTableConfig = { emptyMessage: 'No variables yet.' };

  private viewInitialized = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private certificateVariableService: CertificateVariableService,
    private toastLogService: LibToastLogService,
  ) {
    this.addForm = this.fb.group({
      label: ['', Validators.required],
      default_value: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.batch && this.batch) {
      this.fetchVariables();
    }
  }

  ngAfterViewInit() {
    this.viewInitialized = true;
    this.buildTableColumns();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildTableColumns() {
    if (!this.viewInitialized) {
      return;
    }
    this.tableColumns = [
      { key: 'label', title: 'Label', cellTemplate: this.labelCellTemplate },
      { key: 'default_value', title: 'Default Value', cellTemplate: this.defaultValueCellTemplate },
      { key: 'keep', title: 'Keep', cellTemplate: this.keepCellTemplate },
      { key: 'delete', title: '', cellTemplate: this.deleteCellTemplate },
    ];
  }

  buildTableRows() {
    this.tableRows = this.variables.map((variable) => ({ id: variable.id, variable }));
  }

  fetchVariables() {
    this.isLoading = true;
    this.certificateVariableService
      .indexCertificateVariables(this.batch.uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.variables = res.certificate_variables;
        this.isLoading = false;
        this.buildTableColumns();
        this.buildTableRows();
      });
  }

  toggleKeep(variable: ICertificateVariable, keep: boolean) {
    this.certificateVariableService
      .updateCertificateVariable(this.batch.uuid, variable.id, { keep })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          variable.keep = updated.keep;
          this.variablesChanged.emit();
        },
        error: () => {
          this.toastLogService.errorDialog('Could not update the variable');
          variable.keep = !keep;
        },
      });
  }

  saveDefaultValue(variable: ICertificateVariable, value: string) {
    if (value === variable.default_value) {
      return;
    }
    this.certificateVariableService
      .updateCertificateVariable(this.batch.uuid, variable.id, { default_value: value })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          variable.default_value = updated.default_value;
          variable.default_set = updated.default_set;
        },
        error: () => {
          this.toastLogService.errorDialog('Could not update the default value');
        },
      });
  }

  saveLabel(variable: ICertificateVariable, label: string) {
    if (!label || label === variable.label) {
      return;
    }
    this.certificateVariableService
      .updateCertificateVariable(this.batch.uuid, variable.id, { label })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          variable.label = updated.label;
          this.variablesChanged.emit();
        },
        error: () => {
          this.toastLogService.errorDialog('Could not update the label');
        },
      });
  }

  deleteVariable(variable: ICertificateVariable) {
    if (!confirm(`Remove the "${variable.label}" variable? This cannot be undone.`)) {
      return;
    }
    this.certificateVariableService
      .deleteCertificateVariable(this.batch.uuid, variable.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.variables = this.variables.filter((v) => v.id !== variable.id);
          this.buildTableRows();
          this.toastLogService.successDialog('Variable removed');
          this.variablesChanged.emit();
        },
        error: () => {
          this.toastLogService.errorDialog('Could not remove the variable');
        },
      });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.addForm.reset();
    }
  }

  addVariable() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    this.certificateVariableService
      .createCertificateVariable(this.batch.uuid, this.addForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (variable) => {
          this.variables = [...this.variables, variable];
          this.buildTableRows();
          this.addForm.reset();
          this.showAddForm = false;
          this.variablesChanged.emit();
        },
        error: () => {
          this.toastLogService.errorDialog('Could not add the variable');
        },
      });
  }
}
