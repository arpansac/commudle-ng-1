import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { CommunityBuildsService } from 'apps/commudle-admin/src/app/services/community-builds.service';
import { EPublishStatus, ICommunityBuild } from 'apps/shared-models/community-build.model';
import { ToastrService } from '@commudle/shared-services';

@Component({
  selector: 'app-community-builds',
  templateUrl: './community-builds.component.html',
  styleUrls: ['./community-builds.component.scss'],
})
export class CommunityBuildsComponent implements OnInit {
  moment = moment;
  cBuilds: ICommunityBuild[] = [];
  EPublishStatus = EPublishStatus;
  publishStatuses = Object.keys(EPublishStatus);
  total = 0;
  page = 1;
  isLoading = false;

  constructor(private toastLogService: ToastrService, private communityBuildsService: CommunityBuildsService) {}

  ngOnInit() {
    this.getAllBuilds();
  }

  getAllBuilds() {
    this.isLoading = true;
    this.communityBuildsService.getAll(this.page).subscribe((data) => {
      this.cBuilds = this.cBuilds.concat(data.community_builds);
      this.total = data.total;
      this.page += 1;
      this.isLoading = false;
    });
  }

  updatePublishStatus(publishStatus, communityBuildId) {
    this.communityBuildsService.updatePublishStatus(communityBuildId, publishStatus).subscribe(() => {
      this.toastLogService.successDialog(`Status Updated!`);
    });
  }
}
