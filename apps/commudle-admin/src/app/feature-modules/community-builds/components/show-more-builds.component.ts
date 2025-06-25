import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';
import { IUser, ICommunityBuild } from '@commudle/shared-models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'commudle-show-more-builds',
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
    if (this.user?.username && this.curBuild?.id) {
      this.appUsersService.communityBuilds(this.user.username).subscribe((value) => {
        this.builds = value.community_builds.filter((build) => build.id !== this.curBuild.id).reverse();
      });
    }
  }
}
