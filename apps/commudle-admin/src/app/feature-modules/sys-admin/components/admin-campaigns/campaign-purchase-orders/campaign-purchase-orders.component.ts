import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EDbModels, IPurchaseOrder } from '@commudle/shared-models';
import { PurchaseOrderService } from '@commudle/shared-services';
import moment from 'moment';

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
  }

  fetchPaymentDetails() {
    this.isLoading = true;
    this.purchaseOrderService.indexByOrderType(EDbModels.CAMPAIGN, this.page, this.count).subscribe((data) => {
      this.purchaseOrders = data.values;
      this.page = data.page;
      this.total = data.total;
      this.isLoading = false;
    });
  }
}
