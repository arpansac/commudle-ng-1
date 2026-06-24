import { Component, OnDestroy, OnInit } from '@angular/core';
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

  activeCount = 0;
  totalCommunities = 0;
  totalOrganizations = 0;

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
        if (verified) this.fetchStats();
      });
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchStats(): void {
    this.userSubscriptionService
      .getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats) => {
        this.activeCount = stats.active_count;
        this.totalCommunities = stats.total_communities;
        this.totalOrganizations = stats.total_organizations;
      });
  }
}
