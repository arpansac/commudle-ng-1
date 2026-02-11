import { Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { CommunityBuildsService } from 'apps/commudle-admin/src/app/services/community-builds.service';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { Subject, takeUntil } from 'rxjs';
import { SeoService, ToastrService } from '@commudle/shared-services';
import { ICommunityBuild } from '@commudle/shared-models';
import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';

@Component({
    selector: 'commudle-my-community-builds',
    templateUrl: './my-community-builds.component.html',
    styleUrls: ['./my-community-builds.component.scss'],
    standalone: false
})
export class MyCommunityBuildsComponent implements OnInit, OnDestroy {
  moment = moment;
  cBuilds: ICommunityBuild[] = [];
  incompleteProfile = false;

  private destroy$ = new Subject<void>();

  constructor(
    private communityBuildsService: CommunityBuildsService,
    private seoService: SeoService,
    private toastLogService: ToastrService,
    private authWatchService: LibAuthwatchService,
    private appUsersService: AppUsersService,
  ) {}

  ngOnInit() {
    this.seoService.setTitle('My Community Builds');
    this.seoService.noIndex(true);
    this.getAllBuilds();

    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data && !data.profile_completed) {
        this.incompleteProfile = true;
      }
    });
  }

  ngOnDestroy() {
    this.seoService.noIndex(false);
    this.destroy$.next();
    this.destroy$.complete();
  }

  getAllBuilds() {
    this.appUsersService.myCommunityBuilds().subscribe((data) => {
      this.cBuilds = data.community_builds;
    });
  }

  destroyBuild(buildId) {
    const buildIndex = this.cBuilds.findIndex((k) => k.id === buildId);
    this.communityBuildsService.destroy(this.cBuilds[buildIndex].id).subscribe((data) => {
      if (data) {
        this.cBuilds.splice(buildIndex, 1);
        this.toastLogService.successDialog('Deleted');
      }
    });
  }
}
