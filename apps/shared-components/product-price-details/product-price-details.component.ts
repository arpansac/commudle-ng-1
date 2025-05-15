import { Component, Input, OnInit } from '@angular/core';
import { IProductPrice } from '@commudle/shared-models';
import { ProductPriceService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-product-price-details',
  templateUrl: './product-price-details.component.html',
  styleUrls: ['./product-price-details.component.scss'],
})
export class ProductPriceDetailsComponent implements OnInit {
  @Input() productPriceId: number;
  productPrice: IProductPrice;

  hasDiscount = false;

  constructor(private productPriceService: ProductPriceService) {}

  ngOnInit(): void {
    this.fetchProductPrice();
  }

  fetchProductPrice(): void {
    this.productPriceService.showById(this.productPriceId).subscribe((data: IProductPrice) => {
      this.productPrice = data;
      this.hasDiscount = this.productPrice.discount > 0;
    });
  }
}
