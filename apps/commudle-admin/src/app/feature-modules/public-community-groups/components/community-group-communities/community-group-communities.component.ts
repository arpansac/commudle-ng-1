import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunityGroupsService } from 'apps/commudle-admin/src/app/services/community-groups.service';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { ICommunity } from 'apps/shared-models/community.model';
import { IEvent } from 'apps/shared-models/event.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { Subscription } from 'rxjs';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { EDbModels, IHackathon } from '@commudle/shared-models';

@Component({
  selector: 'app-community-group-communities',
  templateUrl: './community-group-communities.component.html',
  styleUrls: ['./community-group-communities.component.scss'],
  standalone: false,
})
export class CommunityGroupCommunitiesComponent implements OnInit, OnDestroy {
  communityGroup: ICommunityGroup;
  communities: ICommunity[] = [];
  upcomingEvents: IEvent[] = [];
  subscriptions: Subscription[] = [];
  isLoading = true;
  faUsers = faUsers;
  EDbModels = EDbModels;
  upcomingHackathons: IHackathon[] = [];

  // Pagination
  page = 1;
  count = 9;
  total = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private communityGroupsService: CommunityGroupsService,
    private hackathonService: HackathonService,
    private seoService: SeoService,
  ) {}

  ngOnInit() {
    const params = this.activatedRoute.snapshot.queryParams;
    if (params.page) {
      this.page = Number(params.page);
    }

    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((data) => {
        this.communityGroup = data.community_group;
        this.getCommunities();
        this.getUpcomingEvents();
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
      this.communityGroupsService.pCommunities(this.communityGroup.slug, this.page, this.count).subscribe((data) => {
        this.communities = data.values;
        this.total = data.total;
        this.page = data.page;
        this.count = data.count;
        this.isLoading = false;
      }),
    );
  }

  onPageChange(page: number) {
    this.page = page;
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page: this.page },
      queryParamsHandling: 'merge',
    });
    this.getCommunities();
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
      this.communityGroupsService.pHackathons(this.communityGroup.id, 1, 5, 'future').subscribe((data) => {
        this.upcomingHackathons = data.values;
      }),
    );
  }

  getUpcomingEvents() {
    this.subscriptions.push(
      this.communityGroupsService.pEvents(this.communityGroup.slug, 1, 5, 'future').subscribe((data) => {
        this.upcomingEvents = data.values;
      }),
    );
  }
}
