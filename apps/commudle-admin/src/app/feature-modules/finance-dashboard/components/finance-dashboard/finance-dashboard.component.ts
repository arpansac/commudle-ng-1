import { Component, OnDestroy, OnInit } from '@angular/core';
import { IPurchaseOrder } from '@commudle/shared-models';
import { FinanceDashboardService, SeoService, ToastrService } from '@commudle/shared-services';
import { faReceipt, faSearch, faSpinner, faPaperPlane, faCircleCheck, faEye } from '@fortawesome/free-solid-svg-icons';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'commudle-finance-dashboard',
  templateUrl: './finance-dashboard.component.html',
  styleUrls: ['./finance-dashboard.component.scss'],
  standalone: false,
})
export class FinanceDashboardComponent implements OnInit, OnDestroy {
  purchaseOrders: IPurchaseOrder[] = [];
  isLoading = true;

  page = 1;
  count = 20;
  total = 0;

  // Default the status filter to `paid` so the dashboard opens on completed
  // purchases (which is the only status invoice actions apply to anyway).
  status = 'paid';
  query = '';
  private query$ = new Subject<string>();

  /** UUIDs currently being emailed — used to show a per-row spinner. */
  sending = new Set<string>();
  /** UUIDs where a send just completed — used to show a ✓ tick briefly. */
  justSent = new Set<string>();
  /** UUIDs currently loading a preview — used to disable the preview button. */
  previewing = new Set<string>();

  readonly icons = {
    faReceipt,
    faSearch,
    faSpinner,
    faPaperPlane,
    faCircleCheck,
    faEye,
  };

  private destroy$ = new Subject<void>();

  constructor(
    private financeDashboardService: FinanceDashboardService,
    private toastrService: ToastrService,
    private seoService: SeoService,
  ) {}

  ngOnInit(): void {
    this.seoService.setTitle('Finance Dashboard | Commudle');
    this.seoService.noIndex(true);
    this.fetchPurchaseOrders();

    // Debounced search: only fire after the user stops typing for 400ms.
    this.query$.pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(() => {
      this.page = 1;
      this.fetchPurchaseOrders();
    });
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.destroy$.next();
    this.destroy$.complete();
  }

  onQueryChange(value: string): void {
    this.query = value;
    this.query$.next(value);
  }

  onStatusChange(value: string): void {
    this.status = value;
    this.page = 1;
    this.fetchPurchaseOrders();
  }

  goToPage(page: number): void {
    this.page = page;
    this.fetchPurchaseOrders();
  }

  /**
   * Fetch the invoice PDF as a Blob and open it in a new browser tab. Uses
   * HttpClient (not a plain <a target="_blank">) so the request carries auth
   * headers — the endpoint is FINANCE_ADMIN-only.
   */
  previewInvoice(po: IPurchaseOrder): void {
    if (!po.uuid || this.previewing.has(po.uuid) || po.status !== 'paid') return;

    this.previewing.add(po.uuid);
    this.financeDashboardService
      .previewInvoice(po.uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.previewing.delete(po.uuid);
          const url = URL.createObjectURL(blob);
          const opened = window.open(url, '_blank');
          if (!opened) {
            // Fallback if the popup is blocked — force a download instead.
            const a = document.createElement('a');
            a.href = url;
            a.download = `${po.invoice_number || 'invoice'}.pdf`;
            a.click();
          }
          // Release the object URL after a bit so the tab has time to load.
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        },
        error: (err) => {
          this.previewing.delete(po.uuid);
          this.toastrService.errorDialog(err?.error?.message || 'Failed to load the invoice preview.');
        },
      });
  }

  /** Queue an invoice email for this PO. Optimistic per-row UI feedback. */
  sendInvoice(po: IPurchaseOrder): void {
    if (!po.uuid || this.sending.has(po.uuid) || po.status !== 'paid') return;

    this.sending.add(po.uuid);
    this.financeDashboardService
      .sendInvoice(po.uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.sending.delete(po.uuid);
          this.justSent.add(po.uuid);
          this.toastrService.successDialog(`Invoice ${res.invoice_number || ''} sent to ${res.sent_to}`);
          // Clear the ✓ marker after a moment so the row returns to normal.
          setTimeout(() => this.justSent.delete(po.uuid), 3000);
        },
        error: (err) => {
          this.sending.delete(po.uuid);
          this.toastrService.errorDialog(err?.error?.message || 'Failed to send the invoice email.');
        },
      });
  }

  private fetchPurchaseOrders(): void {
    this.isLoading = true;
    this.financeDashboardService
      .getPurchaseOrders({ page: this.page, count: this.count, status: this.status, q: this.query })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.purchaseOrders = res.values;
          this.total = res.total;
          this.page = res.page;
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
  }
}
