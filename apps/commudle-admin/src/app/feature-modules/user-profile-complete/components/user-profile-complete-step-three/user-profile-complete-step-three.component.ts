import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { ICommunity } from 'apps/shared-models/community.model';
import { IEvent } from 'apps/shared-models/event.model';
import { IPageInfo } from 'apps/shared-models/page-info.model';
import { IUser } from 'apps/shared-models/user.model';

@Component({
  selector: 'app-user-profile-complete-step-three',
  templateUrl: './user-profile-complete-step-three.component.html',
  styleUrls: ['./user-profile-complete-step-three.component.scss'],
})
export class UserProfileCompleteStepThreeComponent implements OnInit {
  staticAssets = staticAssets;
  order_by = 'members_count';
  communities: ICommunity[] = [];
  upcomingEvents: IEvent[] = [];
  showSpinnerCommunities = false;
  isLoadingSpeakers = false;
  showSpinnerEvents = false;
  pageInfo: IPageInfo;
  limit = 4;
  query = '';
  mini = true;
  speakers: IUser[] = [];

  constructor(
    private router: Router,
    private communitiesService: CommunitiesService,
    private eventsService: EventsService,
  ) {}

  ngOnInit() {
    this.getPopularCommunities();
    this.getAllSpeakersList();
    this.getUpcomingEvents();
  }

  finishProcess() {
    this.router.navigate(['/dashboard']);
  }

  goToPreviousStep() {
    this.router.navigate(['/user-profile-complete/step-two']);
  }

  getPopularCommunities(): void {
    this.showSpinnerCommunities = true;
    this.communitiesService
      .getPopularCommunities(this.pageInfo?.end_cursor, this.limit, this.query, this.order_by)
      .subscribe((data) => {
        this.communities = this.communities.concat(data.page.reduce((acc, value) => [...acc, value.data], []));
        this.showSpinnerCommunities = false;
      });
  }

  getAllSpeakersList() {
    this.isLoadingSpeakers = true;
    this.communitiesService.getSpeakersList(this.mini, this.pageInfo?.end_cursor, this.limit).subscribe((data) => {
      this.speakers = this.speakers.concat(data.page.reduce((acc, value) => [...acc, value.data], []));
      this.isLoadingSpeakers = false;
    });
  }

  getUpcomingEvents() {
    this.showSpinnerEvents = true;
    this.eventsService.getEventsList('future', this.limit, this.pageInfo?.end_cursor).subscribe((data) => {
      if (data) {
        this.upcomingEvents = this.upcomingEvents.concat(data.page.reduce((acc, value) => [...acc, value.data], []));
        this.showSpinnerEvents = false;
      }
    });
  }
}
