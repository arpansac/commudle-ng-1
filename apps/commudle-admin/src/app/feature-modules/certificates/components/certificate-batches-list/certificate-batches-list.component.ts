import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NbBadgeModule, NbDialogService } from '@commudle/theme';
import { CommudleButtonModule, CommudleCardModule } from '@commudle/commudle-theme';
import { ECertificateBatchStatus, ICertificateBatch, ICommunity } from '@commudle/shared-models';
import { CertificateBatchService } from '@commudle/shared-services';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { DataTableColumn, DataTableComponent, DataTableConfig, DataTableRow } from '../../../../app-shared-components/data-table/data-table.component';
import { CertificateBatchCreateDialogComponent } from '../certificate-batch-create-dialog/certificate-batch-create-dialog.component';

@Component({
  selector: 'commudle-certificate-batches-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CommudleButtonModule,
    CommudleCardModule,
    NbBadgeModule,
    FontAwesomeModule,
    SharedComponentsModule,
    DataTableComponent,
  ],
  templateUrl: './certificate-batches-list.component.html',
  styleUrls: ['./certificate-batches-list.component.scss'],
})
export class CertificateBatchesListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('nameCell') nameCellTemplate: TemplateRef<unknown>;
  @ViewChild('statusCell') statusCellTemplate: TemplateRef<unknown>;

  community: ICommunity;
  batches: ICertificateBatch[] = [];
  isLoading = true;
  page = 1;
  count = 10;
  total = 0;
  moment = moment;
  ECertificateBatchStatus = ECertificateBatchStatus;
  icons = {
    faPlus,
  };

  tableColumns: DataTableColumn[] = [];
  tableRows: DataTableRow[] = [];
  tableConfig: DataTableConfig = { emptyMessage: 'No certificate batches yet.' };

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private certificateBatchService: CertificateBatchService,
    private dialogService: NbDialogService,
  ) {}

  ngOnInit() {
    this.route.parent.parent.data.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.community = data.community;
      this.fetchBatches();
    });
  }

  ngAfterViewInit() {
    this.buildTableColumns();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildTableColumns() {
    this.tableColumns = [
      { key: 'name', title: 'Name', cellTemplate: this.nameCellTemplate },
      { key: 'status', title: 'Status', cellTemplate: this.statusCellTemplate },
      { key: 'recipients_count', title: 'Recipients' },
      { key: 'sent_count', title: 'Sent' },
      { key: 'created', title: 'Created' },
    ];
  }

  fetchBatches() {
    this.isLoading = true;
    this.tableConfig = { ...this.tableConfig, loadingMessage: 'Loading batches...' };
    this.certificateBatchService
      .indexCertificateBatches(this.community.id, this.page, this.count)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.batches = res.certificate_batches;
        this.page = res.page;
        this.total = res.total;
        this.isLoading = false;
        this.tableRows = this.batches.map((batch) => ({
          id: batch.uuid,
          uuid: batch.uuid,
          name: batch.name,
          status: batch.status,
          recipients_count: batch.recipients_count,
          sent_count: batch.sent_count,
          created: this.moment(batch.created_at).format('DD MMM YYYY'),
        }));
      });
  }

  onPageChange(page: number) {
    this.page = page;
    this.fetchBatches();
  }

  statusLabel(status: ECertificateBatchStatus): string {
    return status ?? 'unknown';
  }

  openCreateDialog() {
    this.dialogService
      .open(CertificateBatchCreateDialogComponent, {
        context: { communityId: this.community.id },
      })
      .onClose.pipe(takeUntil(this.destroy$))
      .subscribe((batch: ICertificateBatch) => {
        if (batch) {
          this.router.navigate([batch.uuid], { relativeTo: this.route });
        }
      });
  }
}
