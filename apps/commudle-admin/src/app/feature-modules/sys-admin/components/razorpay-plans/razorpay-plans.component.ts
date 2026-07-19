import { Component, OnDestroy, OnInit } from '@angular/core';
import { SeoService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-razorpay-plans',
  templateUrl: './razorpay-plans.component.html',
  styleUrls: ['./razorpay-plans.component.scss'],
  standalone: false,
})
export class RazorpayPlansComponent implements OnInit, OnDestroy {
  tabs = [{ title: 'Product Prices', route: './', exact: true }];

  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.noIndex(true);
    this.seoService.setTitle('Subscription Plans | Commudle Admin');
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
  }
}
