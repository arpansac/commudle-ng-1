import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';
import { ICommunityBuild } from 'apps/shared-models/community-build.model';
import { IUser } from 'apps/shared-models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-show-more-builds',
  templateUrl: './show-more-builds.component.html',
  styleUrls: ['./show-more-builds.component.scss'],
})
export class ShowMoreBuildsComponent implements OnInit, OnDestroy {
  @Input() user: IUser;
  @Input() curBuild: ICommunityBuild;

  builds: ICommunityBuild[] = [];
  subscriptions: Subscription[] = [];

  constructor(private appUsersService: AppUsersService) {}

  ngOnInit(): void {
    this.getBuilds();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  getBuilds(): void {
    this.subscriptions.push(
      this.appUsersService.communityBuilds(this.user.username).subscribe((value) => {
        this.builds = value.community_builds.filter((build) => build.id !== this.curBuild.id);
      }),
    );
  }
}
