import { Component, OnDestroy, OnInit } from '@angular/core';
import { IPurchaseOrder } from '@commudle/shared-models';
import { AuthService, PurchaseOrderService, ToastrService, UserSubscriptionService } from '@commudle/shared-services';
import { Subject, takeUntil, filter } from 'rxjs';

@Component({
  selector: 'commudle-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss'],
  standalone: false,
})
export class PaymentHistoryComponent implements OnInit, OnDestroy {
  orders: IPurchaseOrder[] = [];
  isLoading = true;
  page = 1;
  count = 10;
  total = 0;

  /** UUIDs currently being emailed — used to disable the button per row. */
  sending = new Set<string>();
  /** UUIDs where a send just completed — used to show a ✓ tick briefly. */
  justSent = new Set<string>();

  private destroy$ = new Subject<void>();

  constructor(
    private userSubscriptionService: UserSubscriptionService,
    private authService: AuthService,
    private purchaseOrderService: PurchaseOrderService,
    private toastrService: ToastrService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUserVerified$
      .pipe(
        filter((v) => v !== null),
        takeUntil(this.destroy$),
      )
      .subscribe((verified) => {
        if (verified) this.fetchHistory();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToPage(page: number): void {
    this.page = page;
    this.fetchHistory();
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      paid: 'status-paid',
      unpaid: 'status-unpaid',
      partial_refund: 'status-refund',
      full_refund: 'status-refund',
    };
    return map[status] || '';
  }

  /**
   * Enqueue the invoice email for this PO. Owner-only endpoint — the backend
   * uses the buyer's saved contact email (or user email) as the recipient.
   */
  sendInvoice(order: IPurchaseOrder): void {
    if (!order.uuid || this.sending.has(order.uuid) || order.status !== 'paid') return;

    this.sending.add(order.uuid);
    this.purchaseOrderService
      .sendInvoice(order.uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.sending.delete(order.uuid);
          this.justSent.add(order.uuid);
          this.toastrService.successDialog(`Invoice ${res.invoice_number || ''} sent to ${res.sent_to}`);
          // Clear the ✓ marker after a moment so the row returns to normal.
          setTimeout(() => this.justSent.delete(order.uuid), 3000);
        },
        error: (err) => {
          this.sending.delete(order.uuid);
          this.toastrService.errorDialog(err?.error?.message || 'Failed to send the invoice email.');
        },
      });
  }

  private fetchHistory(): void {
    this.isLoading = true;
    this.userSubscriptionService
      .getPaymentHistory(this.page, this.count)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.orders = res.values;
          this.total = res.total;
          this.page = res.page;
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
  }
}
