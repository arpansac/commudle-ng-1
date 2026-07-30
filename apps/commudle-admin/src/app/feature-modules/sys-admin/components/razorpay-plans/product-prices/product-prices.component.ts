import { Component, OnDestroy, OnInit } from '@angular/core';
import { IProductPrice } from '@commudle/shared-models';
import { ProductPriceService } from '@commudle/shared-services';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'commudle-admin-product-prices',
  templateUrl: './product-prices.component.html',
  styleUrls: ['./product-prices.component.scss'],
  standalone: false,
})
export class AdminProductPricesComponent implements OnInit, OnDestroy {
  productPrices: IProductPrice[] = [];
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(private productPriceService: ProductPriceService) {}

  ngOnInit(): void {
    this.productPriceService
      .index()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.productPrices = data;
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
