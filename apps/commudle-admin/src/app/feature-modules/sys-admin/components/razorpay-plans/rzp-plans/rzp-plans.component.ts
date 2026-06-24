import { Component, OnDestroy, OnInit } from '@angular/core';
import { IRazorpayPlan } from '@commudle/shared-models';
import { ProductPriceService } from '@commudle/shared-services';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'commudle-admin-rzp-plans',
  templateUrl: './rzp-plans.component.html',
  styleUrls: ['./rzp-plans.component.scss'],
  standalone: false,
})
export class AdminRzpPlansComponent implements OnInit, OnDestroy {
  plans: IRazorpayPlan[] = [];
  isLoading = true;
  page = 1;
  count = 10;
  total = 0;

  private destroy$ = new Subject<void>();

  constructor(private productPriceService: ProductPriceService) {}

  ngOnInit(): void {
    this.fetchPlans();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchPlans(): void {
    this.isLoading = true;
    this.productPriceService
      .fetchRzpPlans(this.page, this.count)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.plans = data.values;
          this.total = data.total;
          this.page = data.page;
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
  }

  getAmount(plan: IRazorpayPlan): string {
    return (plan.item.amount / 100).toFixed(2);
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
