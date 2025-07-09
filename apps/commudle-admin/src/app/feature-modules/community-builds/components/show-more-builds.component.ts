import { Component, Input, OnInit } from '@angular/core';
import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';
import { IUser, ICommunityBuild } from '@commudle/shared-models';

@Component({
  selector: 'commudle-show-more-builds',
  templateUrl: './show-more-builds.component.html',
  styleUrls: ['./show-more-builds.component.scss'],
})
export class ShowMoreBuildsComponent implements OnInit {
  @Input() user: IUser;
  @Input() curBuild: ICommunityBuild;

  builds: ICommunityBuild[] = [];

  constructor(private appUsersService: AppUsersService) {}

  ngOnInit(): void {
    this.getBuilds();
  }

  getBuilds(): void {
    this.appUsersService.communityBuilds(this.user.username).subscribe((value) => {
      this.builds = value.community_builds.filter((build) => build.id !== this.curBuild.id).reverse();
    });
  }
}
