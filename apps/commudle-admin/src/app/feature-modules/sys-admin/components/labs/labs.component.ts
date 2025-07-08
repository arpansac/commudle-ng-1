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
  // labs = {
  //   draft: [] as ILab[],
  //   submitted: [] as ILab[],
  //   published: [] as ILab[],
  //   flagged: [] as ILab[],
  //   removed: [] as ILab[],
  // };
  labs: ILab[];

  selectedStatus = 'published';

  constructor(private toastLogService: ToastrService, private labsService: SysAdminLabsService) {}

  ngOnInit() {
    this.getAllLabs();
  }

  getAllLabs() {
    this.labsService.getAll(this.page, this.count, EPublishStatus.published).subscribe((data) => {
      this.labs = data.values;
      console.log('🚀 ~ LabsComponent ~ this.labsService.getAll ~ this.labs:', this.labs);
      this.page = data.page;
      this.total = data.total;
    });
  }

  updatePublishStatus(publishStatus: ELabPublishStatus, labId: number) {
    this.labsService.updatePublishStatus(labId, publishStatus).subscribe(() => {
      this.toastLogService.successDialog(`Status Updated!`);
    });
  }

  onStatusChange(status: string) {
    this.selectedStatus = status;
    this.page = 1;
    this.getAllLabs();
  }

  onPageChange(page: number) {
    this.page = page;
    this.getAllLabs();
  }
}
