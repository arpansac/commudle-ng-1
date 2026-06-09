import { Component, OnDestroy, OnInit } from '@angular/core';
import { SeoService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-my-subscriptions',
  templateUrl: './my-subscriptions.component.html',
  styleUrls: ['./my-subscriptions.component.scss'],
  standalone: false,
})
export class MySubscriptionsComponent implements OnInit, OnDestroy {
  tabs = [
    { title: 'Subscriptions', route: '.', responsive: true },
    { title: 'Payment History', route: './payment-history', responsive: true },
  ];

  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.setTags(
      'My Subscriptions | Commudle',
      'Manage your subscriptions and payment history on Commudle.',
      'https://commudle.com/assets/images/commudle-logo192.png',
    );
    this.seoService.noIndex(true);
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
  }
}
