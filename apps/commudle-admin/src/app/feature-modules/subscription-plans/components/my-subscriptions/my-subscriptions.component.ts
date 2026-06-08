import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService, SeoService } from '@commudle/shared-services';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'commudle-my-subscriptions',
  templateUrl: './my-subscriptions.component.html',
  styleUrls: ['./my-subscriptions.component.scss'],
  standalone: false,
})
export class MySubscriptionsComponent implements OnInit, OnDestroy {
  tabs = [
    { title: 'Subscriptions', route: './subscriptions', responsive: true },
    { title: 'Payment History', route: './payment-history', responsive: true },
  ];

  private destroy$ = new Subject<void>();

  constructor(private seoService: SeoService, private authService: AuthService) {}

  ngOnInit(): void {
    this.seoService.setTags(
      'My Subscriptions | Commudle',
      'Manage your subscriptions and payment history on Commudle.',
      'https://commudle.com/assets/images/commudle-logo192.png',
    );
    this.seoService.noIndex(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
