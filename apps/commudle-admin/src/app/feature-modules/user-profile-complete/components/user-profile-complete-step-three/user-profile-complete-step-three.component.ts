import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ICommunity, IEvent, IPageInfo, IUser } from '@commudle/shared-models';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { ProfileStatusBarService } from 'apps/commudle-admin/src/app/services/profile-status-bar.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'commudle-user-profile-complete-step-three',
  templateUrl: './user-profile-complete-step-three.component.html',
  styleUrls: ['./user-profile-complete-step-three.component.scss'],
})
export class UserProfileCompleteStepThreeComponent implements OnInit, OnDestroy {
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
  countdownValue: number | null = null;
  private countdownInterval: any;
  referrerUrl: string | null = null;
  displayReferrerUrl = '';
  showDashboardButton = true;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private communitiesService: CommunitiesService,
    private eventsService: EventsService,
    private profileStatusBarService: ProfileStatusBarService,
  ) {}

  ngOnInit() {
    this.profileStatusBarService.changeProfileBarStatus(false);

    this.profileStatusBarService.referrerUrl$.pipe(takeUntil(this.destroy$)).subscribe((url) => {
      this.referrerUrl = url || '/';

      if (this.referrerUrl && this.referrerUrl !== '/' && this.referrerUrl !== '') {
        this.displayReferrerUrl = this.referrerUrl.startsWith('/') ? this.referrerUrl.substring(1) : this.referrerUrl;
      } else {
        this.displayReferrerUrl = '';
      }

      if (this.referrerUrl && (this.referrerUrl === '/' || this.referrerUrl === '')) {
        this.showDashboardButton = true;
      } else {
        this.showDashboardButton = false;
      }

      this.startCountdown();
    });

    this.getPopularCommunities();
    this.getAllSpeakersList();
    this.getUpcomingEvents();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.profileStatusBarService.changeProfileBarStatus(true);
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.profileStatusBarService.clearReferrerUrl();
  }

  finishProcess() {
    if (this.referrerUrl && this.showDashboardButton === false) {
      this.router.navigateByUrl(this.referrerUrl);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  goToPreviousStep() {
    this.router.navigate(['/user-profile-complete/step-two']);
  }

  startCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownValue = 5;

    this.countdownInterval = setInterval(() => {
      if (this.countdownValue && this.countdownValue > 1) {
        this.countdownValue--;
      } else {
        clearInterval(this.countdownInterval);
        this.countdownValue = null;
        this.finishProcess();
      }
    }, 1000);
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
