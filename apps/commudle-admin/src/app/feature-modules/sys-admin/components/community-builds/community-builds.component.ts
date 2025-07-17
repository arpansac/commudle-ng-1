import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ToastrService } from '@commudle/shared-services';
import { SysAdminCommunityBuildService } from 'apps/commudle-admin/src/app/feature-modules/sys-admin/services/sys-admin-community-builds.service';
import { EPublishStatus, ICommunityBuild } from '@commudle/shared-models';

@Component({
  selector: 'commudle-community-builds',
  templateUrl: './community-builds.component.html',
  styleUrls: ['./community-builds.component.scss'],
})
export class CommunityBuildsComponent implements OnInit {
  moment = moment;
  cBuilds: ICommunityBuild[] = [];
  EPublishStatus = EPublishStatus;
  publishStatuses = Object.keys(EPublishStatus);
  selectedBuildStatus: EPublishStatus = EPublishStatus.published;
  total = 0;
  page = 1;
  count = 10;
  isLoading = false;

  constructor(private toastLogService: ToastrService, private communityBuildsService: SysAdminCommunityBuildService) {}

  ngOnInit() {
    this.getBuilds();
  }

  getBuilds() {
    this.isLoading = true;
    this.communityBuildsService.getAll(this.page, this.count, this.selectedBuildStatus).subscribe((data) => {
      this.cBuilds = data.values;
      this.total = data.total;
      this.page = data.page;
      this.isLoading = false;
    });
  }

  updatePublishStatus(publishStatus, communityBuildId) {
    this.communityBuildsService.updatePublishStatus(communityBuildId, publishStatus).subscribe(() => {
      this.toastLogService.successDialog(`Status Updated!`);
    });
  }

  fetchBuildsByStatus(cbStatus: EPublishStatus) {
    this.selectedBuildStatus = cbStatus;
    this.page = 1;
    this.getBuilds();
  }
}
