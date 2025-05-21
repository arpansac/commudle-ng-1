import { Component, OnInit } from '@angular/core';
import { EDbModels, IDiscountCode, EDiscountType } from '@commudle/shared-models';
import { DiscountCodesService } from '@commudle/shared-services';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
@Component({
  selector: 'commudle-sys-admin-discount-code',
  templateUrl: './sys-admin-discount-code.component.html',
  styleUrls: ['./sys-admin-discount-code.component.scss'],
})
export class SysAdminDiscountCodeComponent implements OnInit {
  discountCodes: IDiscountCode[] = [];
  isLoading = false;
  selectedModelType: EDbModels = EDbModels.CAMPAIGN;
  EDbModels = EDbModels;
  icons = {
    faAdd,
  };
  EDiscountType = EDiscountType;
  moment = moment;
  constructor(private discountCodesService: DiscountCodesService) {}

  ngOnInit(): void {
    this.getDiscountCodes();
  }

  onModelTypeChange() {
    console.log('Model type changed:', this.selectedModelType);
    this.getDiscountCodes();
  }

  getDiscountCodes() {
    this.isLoading = true;

    this.discountCodesService.indexByParentOrObject(0, this.selectedModelType, false).subscribe({
      next: (data) => {
        this.discountCodes = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching discount codes:', error);
        this.isLoading = false;
        this.discountCodes = [];
      },
    });
  }

  openCreateForm() {
    // Implement form opening logic
    console.log('Open create form');
  }

  editDiscountCode(code: IDiscountCode) {
    // Implement edit logic
    console.log('Edit discount code', code);
  }

  deleteDiscountCode(id: number) {
    // Implement delete logic
    console.log('Delete discount code', id);
  }
}
