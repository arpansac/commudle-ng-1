import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { EPublishStatus, ILab } from 'apps/shared-models/lab.model';
import { ToastrService } from '@commudle/shared-services';
import { SysAdminLabsService } from 'apps/commudle-admin/src/app/feature-modules/sys-admin/services/sys-admin-labs.service';
import { ELabPublishStatus } from '@commudle/shared-models';

@Component({
  selector: 'commudle-labs',
  templateUrl: './labs.component.html',
  styleUrls: ['./labs.component.scss'],
})
export class LabsComponent implements OnInit {
  moment = moment;
  EPublishStatus = EPublishStatus;
  publishStatuses = Object.keys(EPublishStatus);
  page = 1;
  count = 10;
  loading = true;
  total = 0;
  labs: ILab[];
  selectedStatus = EPublishStatus.submitted;
  isLoading = true;

  constructor(private toastLogService: ToastrService, private labsService: SysAdminLabsService) {}

  ngOnInit() {
    this.getLabs();
  }

  getLabs() {
    this.isLoading = true;
    this.labsService.getAll(this.page, this.count, this.selectedStatus).subscribe((data) => {
      this.labs = data.values;
      this.page = data.page;
      this.total = data.total;
      this.isLoading = false;
    });
  }

  updatePublishStatus(publishStatus: ELabPublishStatus, labId: number) {
    this.labsService.updatePublishStatus(labId, publishStatus).subscribe((data) => {
      this.toastLogService.successDialog(`Status Updated!`);
    });
  }

  onStatusChange(event) {
    this.selectedStatus = event.target.value as ELabPublishStatus;
    this.page = 1;
    this.getLabs();
  }

  onPageChange(page: number) {
    this.page = page;
    this.getLabs();
  }
}
