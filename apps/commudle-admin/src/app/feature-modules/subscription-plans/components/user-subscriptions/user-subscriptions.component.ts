import { Component, OnDestroy, OnInit } from '@angular/core';
import { IUserSubscription, IPaginationCount } from '@commudle/shared-models';
import { AuthService, UserSubscriptionService } from '@commudle/shared-services';
import { Subject, takeUntil, filter, switchMap, of } from 'rxjs';

@Component({
  selector: 'commudle-user-subscriptions',
  templateUrl: './user-subscriptions.component.html',
  styleUrls: ['./user-subscriptions.component.scss'],
  standalone: false,
})
export class UserSubscriptionsComponent implements OnInit, OnDestroy {
  subscriptions: IUserSubscription[] = [];
  isLoading = true;
  isLoggedIn = false;
  page = 1;
  count = 5;
  total = 0;

  private destroy$ = new Subject<void>();

  constructor(private userSubscriptionService: UserSubscriptionService, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUserVerified$
      .pipe(
        filter((verified) => verified !== null),
        takeUntil(this.destroy$),
      )
      .subscribe((verified) => {
        this.isLoggedIn = verified;
        if (verified) {
          this.fetchSubscriptions();
        } else {
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToPage(page: number): void {
    this.page = page;
    this.fetchSubscriptions();
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      active: 'status-active',
      cancelled: 'status-cancelled',
      expired: 'status-expired',
      payment_failed: 'status-failed',
      pending: 'status-pending',
    };
    return map[status] || '';
  }

  getQuotaPercent(used: number, max: number | null): number {
    if (!max) return 0;
    return Math.min(100, Math.round((used / max) * 100));
  }

  private fetchSubscriptions(): void {
    this.isLoading = true;
    this.userSubscriptionService
      .getMySubscriptions(this.page, this.count)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.subscriptions = res.values;
          this.total = res.total;
          this.page = res.page;
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
  }
}
