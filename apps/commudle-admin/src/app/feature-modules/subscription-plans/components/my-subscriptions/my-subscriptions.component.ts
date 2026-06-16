import { Component, OnDestroy, OnInit } from '@angular/core';
import { IUserSubscription } from '@commudle/shared-models';
import { AuthService, SeoService, UserSubscriptionService } from '@commudle/shared-services';
import { Subject, takeUntil, filter } from 'rxjs';

@Component({
  selector: 'commudle-my-subscriptions',
  templateUrl: './my-subscriptions.component.html',
  styleUrls: ['./my-subscriptions.component.scss'],
  standalone: false,
})
export class MySubscriptionsComponent implements OnInit, OnDestroy {
  tabs = [
    { title: 'Subscriptions', route: './', exact: true },
    { title: 'Payment History', route: './payment-history', exact: false },
  ];

  subscriptions: IUserSubscription[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private seoService: SeoService,
    private authService: AuthService,
    private userSubscriptionService: UserSubscriptionService,
  ) {}

  ngOnInit(): void {
    this.seoService.setTags(
      'My Subscriptions | Commudle',
      'Manage your subscriptions and payment history on Commudle.',
      'https://commudle.com/assets/images/commudle-logo192.png',
    );
    this.seoService.noIndex(true);

    this.authService.currentUserVerified$
      .pipe(
        filter((v) => v !== null),
        takeUntil(this.destroy$),
      )
      .subscribe((verified) => {
        if (verified) this.fetchSubscriptions();
      });
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.destroy$.next();
    this.destroy$.complete();
  }

  get activeCount(): number {
    return this.subscriptions.filter((s) => s.status === 'active').length;
  }

  get totalCommunities(): number {
    return this.subscriptions.reduce((sum, s) => sum + (s.kommunities_count || 0), 0);
  }

  get totalOrganizations(): number {
    return this.subscriptions.reduce((sum, s) => sum + (s.community_groups_count || 0), 0);
  }

  private fetchSubscriptions(): void {
    this.userSubscriptionService
      .getMySubscriptions(1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => (this.subscriptions = res.values));
  }
}
