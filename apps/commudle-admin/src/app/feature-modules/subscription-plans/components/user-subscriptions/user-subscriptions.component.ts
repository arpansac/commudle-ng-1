import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IUserSubscription } from '@commudle/shared-models';
import { AuthService, UserSubscriptionService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { CreateCommunityFormComponent } from 'apps/commudle-admin/src/app/app-shared-components/create-community-form/create-community-form.component';
import { CreateCommunityGroupFormComponent } from 'apps/commudle-admin/src/app/app-shared-components/create-community-group-form/create-community-group-form.component';
import { Subject, takeUntil, filter } from 'rxjs';

@Component({
  selector: 'commudle-user-subscriptions',
  templateUrl: './user-subscriptions.component.html',
  styleUrls: ['./user-subscriptions.component.scss'],
  standalone: false,
})
export class UserSubscriptionsComponent implements OnInit, OnDestroy {
  subscriptions: IUserSubscription[] = [];
  isLoggedIn = false;
  isLoading = true;
  page = 1;
  count = 5;
  total = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private userSubscriptionService: UserSubscriptionService,
    private authService: AuthService,
    private router: Router,
    private dialogService: NbDialogService,
  ) {}

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

  activeSubscriptions(): IUserSubscription[] {
    return this.subscriptions.filter((s) => s.status === 'active');
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

  getDaysLeft(subscription: IUserSubscription): number {
    if (!subscription.ends_at) return 0;
    const diffTime = new Date(subscription.ends_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  getQuotaPercent(used: number, max: number | null): number {
    if (!max) return 0;
    return Math.min(100, Math.round((used / max) * 100));
  }

  getProgressClass(used: number, max: number | null): string {
    const pct = this.getQuotaPercent(used, max);
    if (pct >= 100) return 'fill-full';
    if (pct >= 60) return 'fill-high';
    if (pct >= 40) return 'fill-mid';
    return 'fill-low';
  }

  getQuotaClass(used: number, max: number | null): string {
    const pct = this.getQuotaPercent(used, max);
    if (pct >= 100) return 'quota-red';
    if (pct >= 60) return 'quota-amber';
    return 'quota-green';
  }

  getRemaining(used: number, max: number | null): number {
    if (!max) return 0;
    return Math.max(0, max - used);
  }

  getRemainingText(used: number, max: number | null): string {
    if (!max) return 'unlimited';
    const remaining = this.getRemaining(used, max);
    return `${remaining} remaining`;
  }

  canCreateKommunity(subscription: IUserSubscription): boolean {
    if (subscription.status !== 'active') return false;
    const max = subscription.product_price?.max_kommunities;
    if (!max) return true;
    return subscription.kommunities_count < max;
  }

  canCreateCommunityGroup(subscription: IUserSubscription): boolean {
    if (subscription.status !== 'active') return false;
    if (!subscription.product_price?.can_create_community_group) return false;
    const max = subscription.product_price?.max_community_groups;
    if (!max) return true;
    return subscription.community_groups_count < max;
  }

  createCommunity(subscription: IUserSubscription | null): void {
    const eligible = this.activeSubscriptions().filter((s) => this.canCreateKommunity(s));
    if (eligible.length === 0) return;
    const target = subscription ?? (eligible.length === 1 ? eligible[0] : null);
    if (!target) {
      // TODO: show plan picker when multiple eligible
      return;
    }
    this.dialogService.open(CreateCommunityFormComponent, {
      context: { subscriptionId: target.id },
      closeOnBackdropClick: false,
    });
  }

  createOrganization(subscription: IUserSubscription | null): void {
    const eligible = this.activeSubscriptions().filter((s) => s.product_price?.can_create_community_group);
    if (eligible.length === 0) return;
    const target = subscription ?? (eligible.length === 1 ? eligible[0] : null);
    if (!target) return;
    this.dialogService.open(CreateCommunityGroupFormComponent, {
      context: { subscriptionId: target.id },
      closeOnBackdropClick: false,
    });
  }

  renewPlan(subscription: IUserSubscription): void {
    this.router.navigate(['/pricing'], {
      queryParams: { plan_id: subscription.product_price_id },
    });
  }

  viewBillingHistory(subscription: IUserSubscription): void {
    this.router.navigate(['/subscriptions/payment-history'], {
      queryParams: { subscription_id: subscription.id },
    });
  }

  cancelPlan(subscription: IUserSubscription): void {
    // TODO: show confirmation dialog then call cancel API
    console.log('Cancel plan:', subscription.id);
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
