import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService, SeoService, UserSubscriptionService } from '@commudle/shared-services';
import { IUser } from '@commudle/shared-models';
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

  currentUser?: IUser;
  activeCount = 0;
  trialingCount = 0;
  expiredCount = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private seoService: SeoService,
    private authService: AuthService,
    private userSubscriptionService: UserSubscriptionService,
  ) {}

  get timeTheme(): { period: string; greeting: string; emoji: string } {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { period: 'morning', greeting: 'Good morning', emoji: '☀️' };
    } else if (hour >= 12 && hour < 17) {
      return { period: 'afternoon', greeting: 'Good afternoon', emoji: '🌤️' };
    } else if (hour >= 17 && hour < 21) {
      return { period: 'evening', greeting: 'Good evening', emoji: '🌆' };
    }
    return { period: 'night', greeting: 'Good night', emoji: '🌙' };
  }

  ngOnInit(): void {
    this.seoService.setTags(
      'My Subscriptions | Commudle',
      'Manage your subscriptions and payment history on Commudle.',
      'https://commudle.com/assets/images/commudle-logo192.png',
    );
    this.seoService.noIndex(true);

    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => (this.currentUser = user));

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
        this.trialingCount = stats.trialing_count;
        this.expiredCount = stats.expired_count;
      });
  }
}
