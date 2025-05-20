import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IProductPrice } from '@commudle/shared-models';
import { ProductPriceService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-product-price-details',
  templateUrl: './product-price-details.component.html',
  styleUrls: ['./product-price-details.component.scss'],
})
export class ProductPriceDetailsComponent implements OnInit {
  @Input() productPriceId: number;
  @Output() productPriceLoaded = new EventEmitter<IProductPrice>();

  productPrice: IProductPrice;
  hasDiscount = false;

  constructor(private productPriceService: ProductPriceService) {}

  ngOnInit(): void {
    this.fetchProductPrice();
  }

  fetchProductPrice(): void {
    this.productPriceService.showById(this.productPriceId).subscribe((data: IProductPrice) => {
      this.productPrice = data;
      this.productPriceLoaded.emit(this.productPrice);
      this.hasDiscount = this.productPrice.discount_percentage > 0;
      // this.hasDiscount = this.productPrice.discount_amount > 0;
    });
  }
}
