import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NbButtonModule, NbCardModule, NbBadgeModule, NbDialogService } from '@commudle/theme';
import { ECertificateBatchStatus, ICertificateBatch, ICommunity } from '@commudle/shared-models';
import { CertificateBatchService } from '@commudle/shared-services';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import * as moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { CertificateBatchCreateDialogComponent } from '../certificate-batch-create-dialog/certificate-batch-create-dialog.component';

@Component({
  selector: 'commudle-certificate-batches-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NbButtonModule,
    NbCardModule,
    NbBadgeModule,
    FontAwesomeModule,
    SharedComponentsModule,
  ],
  templateUrl: './certificate-batches-list.component.html',
  styleUrls: ['./certificate-batches-list.component.scss'],
})
export class CertificateBatchesListComponent implements OnInit, OnDestroy {
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchBatches() {
    this.isLoading = true;
    this.certificateBatchService
      .indexCertificateBatches(this.community.id, this.page, this.count)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.batches = res.certificate_batches;
        this.page = res.page;
        this.total = res.total;
        this.isLoading = false;
      });
  }

  onPageChange(page: number) {
    this.page = page;
    this.fetchBatches();
  }

  statusLabel(status: ECertificateBatchStatus): string {
    return ECertificateBatchStatus[status]?.toLowerCase() ?? 'unknown';
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
