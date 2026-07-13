import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IUserSubscription } from '@commudle/shared-models';
import { AuthService, ToastrService, UserSubscriptionService } from '@commudle/shared-services';
import { NbDialogRef, NbDialogService } from '@commudle/theme';
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
  isCancelling = false;
  cancelTarget: IUserSubscription | null = null;

  @ViewChild('cancelDialog') cancelDialog: TemplateRef<unknown>;

  private destroy$ = new Subject<void>();

  constructor(
    private userSubscriptionService: UserSubscriptionService,
    private authService: AuthService,
    private router: Router,
    private dialogService: NbDialogService,
    private toastrService: ToastrService,
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
    return pct >= 100 ? 'fill-full' : 'fill-partial';
  }

  /** Colour for the "used / max" count text — green when full, primary when there's room. */
  countColorClass(used: number, max: number | null | undefined): string {
    return this.getQuotaPercent(used, max) >= 100 ? 'count-full' : 'count-partial';
  }

  /** A subscription has empty slots when it's active and can still create a community or org. */
  hasEmptySlots(subscription: IUserSubscription): boolean {
    return (
      subscription.status === 'active' &&
      (this.canCreateKommunity(subscription) || this.canCreateCommunityGroup(subscription))
    );
  }

  /* ── Capacity summary (top card) ── */

  /** Total number of active paid plans. */
  get capacityTotal(): number {
    return this.activeSubscriptions().length;
  }

  /** Active plans that have no communities or organizations created yet. */
  get capacityUnused(): number {
    return this.activeSubscriptions().filter(
      (s) => (s.kommunities_count || 0) === 0 && (s.community_groups_count || 0) === 0,
    ).length;
  }

  /** Total communities live across all active plans. */
  get totalCommunitiesLive(): number {
    return this.activeSubscriptions().reduce((sum, s) => sum + (s.kommunities_count || 0), 0);
  }

  /** Name of the first plan that has a live community/org — used as the flagship in the subtext. */
  get flagshipName(): string {
    for (const s of this.activeSubscriptions()) {
      if (s.kommunities?.length) return s.kommunities[0].name;
      if (s.community_groups?.length) return s.community_groups[0].name;
    }
    return this.activeSubscriptions()[0]?.product_price?.product_name || 'Your plan';
  }

  /** Create a community/org on the first eligible active plan with empty capacity. */
  fillEmptyPlans(): void {
    const target = this.activeSubscriptions().find((s) => this.hasEmptySlots(s));
    if (!target) return;
    if (this.canCreateKommunity(target)) {
      this.createCommunity(target);
    } else if (this.canCreateCommunityGroup(target)) {
      this.createOrganization(target);
    }
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
    const limit = subscription.komunity_limit;
    if (!limit) return true;
    return subscription.kommunities_count < limit;
  }

  canCreateCommunityGroup(subscription: IUserSubscription): boolean {
    if (subscription.status !== 'active') return false;
    if (!subscription.product_price?.can_create_community_group) return false;
    const limit = subscription.community_group_limit;
    if (!limit) return true;
    return subscription.community_groups_count < limit;
  }

  /** Effective community cap — stored on the subscription at purchase time. */
  effectiveCommunityMax(subscription: IUserSubscription): number | null {
    return subscription.komunity_limit ?? null;
  }

  /** Effective organization cap — stored on the subscription at purchase time. */
  effectiveGroupMax(subscription: IUserSubscription): number | null {
    return subscription.community_group_limit ?? null;
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
    this.cancelTarget = subscription;
    this.dialogService.open(this.cancelDialog, {
      closeOnBackdropClick: !this.isCancelling,
    });
  }

  confirmCancel(ref: NbDialogRef<unknown>): void {
    if (!this.cancelTarget) return;
    this.isCancelling = true;
    this.userSubscriptionService
      .cancelSubscription(this.cancelTarget.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.isCancelling = false;
          const idx = this.subscriptions.findIndex((s) => s.id === updated.id);
          if (idx !== -1) {
            this.subscriptions = [...this.subscriptions.slice(0, idx), updated, ...this.subscriptions.slice(idx + 1)];
          }
          this.cancelTarget = null;
          ref.close();
          this.toastrService.successDialog('Your subscription cancellation has been scheduled.');
        },
        error: () => {
          this.isCancelling = false;
        },
      });
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
