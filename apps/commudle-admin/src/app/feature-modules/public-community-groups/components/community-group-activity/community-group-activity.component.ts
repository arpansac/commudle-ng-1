import { ICommunityChannel } from 'apps/shared-models/community-channel.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { faUsers, faCalendar, faHashtag, faLaptopCode } from '@fortawesome/free-solid-svg-icons';
import { CommunityGroupsService } from 'apps/commudle-admin/src/app/services/community-groups.service';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { ICommunity } from 'apps/shared-models/community.model';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { IEvent } from 'apps/shared-models/event.model';
import { EDbModels, IHackathon } from '@commudle/shared-models';
import { SeoService } from 'apps/shared-services/seo.service';
import { environment } from '@commudle/shared-environments';

@Component({
  selector: 'commudle-community-group-activity',
  templateUrl: './community-group-activity.component.html',
  styleUrls: ['./community-group-activity.component.scss'],
  standalone: false,
})
export class CommunityGroupActivityComponent implements OnInit, OnDestroy {
  communityGroup: ICommunityGroup;
  communities: ICommunity[] = [];
  channels: ICommunityChannel[] = [];
  forums: ICommunityChannel[] = [];
  events: IEvent[] = [];
  upcomingHackathons: IHackathon[] = [];
  subscriptions: Subscription[] = [];
  EDbModels = EDbModels;
  environment = environment;

  // Events pagination
  page = 1;
  count = 6;
  total = 0;

  //font-awesome icons
  faUsers = faUsers;
  faCalendar = faCalendar;
  faHashtag = faHashtag;

  isLoading = true;
  isLoadingEvents = false;
  isLoadingHackathons = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private communityGroupsService: CommunityGroupsService,
    private hackathonService: HackathonService,
    private seoService: SeoService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((data) => {
        this.communityGroup = data.community_group;
        this.getActiveCommunitiesAndChannels();
        this.getEvents();
        this.getUpcomingHackathons();
        this.setMeta();
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  getActiveCommunitiesAndChannels() {
    this.subscriptions.push(
      this.communityGroupsService.activeCommunityAndChannels(this.communityGroup.slug).subscribe((data) => {
        this.communities = data.communities;
        this.channels = data.community_channels;
        this.forums = data.community_forums;
        this.isLoading = false;
      }),
    );
  }

  getEvents() {
    this.isLoadingEvents = true;
    this.events = [];
    this.subscriptions.push(
      this.communityGroupsService
        .pEvents(this.communityGroup.slug, this.page, this.count, 'future')
        .subscribe((data) => {
          this.events = data.values;
          this.total = data.total;
          this.page = data.page;
          this.count = data.count;
          this.isLoadingEvents = false;
        }),
    );
  }

  getUpcomingHackathons() {
    this.isLoadingHackathons = true;
    this.upcomingHackathons = [];
    this.subscriptions.push(
      this.communityGroupsService
        .pHackathons(this.communityGroup.slug, this.page, this.count, 'future')
        .subscribe((data) => {
          this.upcomingHackathons = data.values;
          this.total = data.total;
          this.page = data.page;
          this.count = data.count;
          this.isLoadingHackathons = false;
        }),
    );
  }

  setMeta(): void {
    this.seoService.setTags(
      `Activity | ${this.communityGroup.name}`,
      this.communityGroup.mini_description,
      this.communityGroup.logo.i350,
    );
  }
}
