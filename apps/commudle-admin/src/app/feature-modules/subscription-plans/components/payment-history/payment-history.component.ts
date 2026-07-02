import { Component, OnDestroy, OnInit } from '@angular/core';
import { IPurchaseOrder } from '@commudle/shared-models';
import { AuthService, UserSubscriptionService } from '@commudle/shared-services';
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

  private destroy$ = new Subject<void>();

  constructor(private userSubscriptionService: UserSubscriptionService, private authService: AuthService) {}

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
