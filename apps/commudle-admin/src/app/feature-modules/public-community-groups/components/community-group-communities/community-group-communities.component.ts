import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommunityGroupsService } from 'apps/commudle-admin/src/app/services/community-groups.service';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { ICommunity } from 'apps/shared-models/community.model';
import { IHackathon } from 'apps/shared-models/hackathon.model';
import { IPageInfo } from 'apps/shared-models/page-info.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { Subscription } from 'rxjs';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { EDbModels } from '@commudle/shared-models';

@Component({
  selector: 'app-community-group-communities',
  templateUrl: './community-group-communities.component.html',
  styleUrls: ['./community-group-communities.component.scss'],
  standalone: false,
})
export class CommunityGroupCommunitiesComponent implements OnInit, OnDestroy {
  communityGroup: ICommunityGroup;
  communities: ICommunity[] = [];
  subscriptions: Subscription[] = [];
  pageInfo: IPageInfo;
  limit = 6;
  isLoading = true;
  total: number;
  faUsers = faUsers;
  EDbModels = EDbModels;
  upcomingHackathons: IHackathon[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private communityGroupsService: CommunityGroupsService,
    private hackathonService: HackathonService,
    private seoService: SeoService,
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((data) => {
        this.communityGroup = data.community_group;
        this.getCommunities();
        this.getUpcomingHackathons();
        this.setMeta();
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  getCommunities() {
    this.isLoading = true;
    this.subscriptions.push(
      this.communityGroupsService
        .pCommunities(this.communityGroup.slug, this.limit, this.pageInfo?.end_cursor)
        .subscribe((data) => {
          this.communities = this.communities.concat(data.page.reduce((acc, value) => [...acc, value.data], []));
          this.pageInfo = data.page_info;
          this.total = data.total;
          this.isLoading = false;
        }),
    );
  }

  setMeta() {
    this.seoService.setTags(
      `Communities | ${this.communityGroup.name}`,
      this.communityGroup.mini_description,
      this.communityGroup.logo.i350,
    );
  }

  getUpcomingHackathons() {
    this.subscriptions.push(
      this.hackathonService.pIndexHackathons(this.communityGroup.id, 'CommunityGroup', 'future').subscribe((data) => {
        this.upcomingHackathons = data.values;
      }),
    );
  }
}
