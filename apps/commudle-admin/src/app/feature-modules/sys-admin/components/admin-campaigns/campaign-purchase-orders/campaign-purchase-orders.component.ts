import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EDbModels, IPurchaseOrder } from '@commudle/shared-models';
import { PurchaseOrderService } from '@commudle/shared-services';
import moment from 'moment';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'commudle-campaign-purchase-orders',
  templateUrl: './campaign-purchase-orders.component.html',
  styleUrls: ['./campaign-purchase-orders.component.scss'],
})
export class CampaignPurchaseOrdersComponent implements OnInit {
  purchaseOrders: IPurchaseOrder[];
  isLoading = true;
  page = 1;
  count = 10;
  total = 0;
  searchForm: FormGroup;
  moment = moment;
  constructor(private purchaseOrderService: PurchaseOrderService, private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      search: [''],
    });
  }

  ngOnInit() {
    this.fetchPaymentDetails();

    this.searchForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.fetchPaymentDetails();
    });
  }

  fetchPaymentDetails() {
    this.isLoading = true;
    this.purchaseOrderService
      .indexByOrderType(EDbModels.CAMPAIGN, this.page, this.count, this.searchForm.get('search').value)
      .subscribe((data) => {
        this.purchaseOrders = data.values;
        this.page = data.page;
        this.total = data.total;
        this.isLoading = false;
      });
  }
}
