import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserRolesUsersService } from 'apps/commudle-admin/src/app/services/user_roles_users.service';
import { ICommunity } from 'apps/shared-models/community.model';
import { IUser } from 'apps/shared-models/user.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { debounceTime, takeUntil, Subscription, switchMap, Subject } from 'rxjs';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { IPageInfo } from 'apps/shared-models/page-info.model';
import { FormBuilder } from '@angular/forms';
import { EDomain } from '@commudle/shared-models';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss'],
})
export class MembersComponent implements OnInit, OnDestroy {
  community: ICommunity;
  members: IUser[] = [];

  page_info: IPageInfo;
  mini = false;
  skeletonLoaderCard = true;
  canLoadMoreSpeakers = false;
  page = 1;
  count = 9;
  canLoadMore = true;
  total;
  query = '';
  month = false;
  year = false;
  employer = false;
  employee = false;

  subscriptions: Subscription[] = [];

  speakers: IUser[] = [];
  isLoadingSpeakers = false;
  isLoadingMembers = false;
  showSpinner = false;
  isLeftScrollDisabled = true;
  isRightScrollDisabled = true;
  searchForm;
  communityFilterForm;
  EDomain = EDomain;
  filterByMutuals = false;

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private userRolesUsersService: UserRolesUsersService,
    private seoService: SeoService,
    private communitiesService: CommunitiesService,
    private fb: FormBuilder,
  ) {
    this.searchForm = this.fb.group({
      name: [''],
    });

    this.communityFilterForm = this.fb.group({
      experience_level: [null],
      employment_status: [null],
      skills: [null],
      gender: [null],
      domains: [null],
    });
  }

  ngOnInit(): void {
    this.search();
    const params = this.activatedRoute.snapshot.queryParams;
    if (Object.keys(params).length > 0) {
      if (params.query) {
        this.query = params.query;
        this.searchForm.get('name').setValue(this.query);
      }
    }
    this.activatedRoute.parent.data.subscribe((data) => {
      this.community = data.community;
      if (this.community) {
        this.getSpeakerDetails();
        if (!params.query) {
          this.getMembers();
        }
        this.seoService.setTitle(` Community Members | ${this.community.name}`);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  search() {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(800),
        takeUntil(this.destroy$),
        switchMap(() => {
          this.page = 1;
          this.isLoadingMembers = true;
          this.query = this.searchForm.get('name').value;
          return this.userRolesUsersService.getCommunityMembers(
            this.query,
            this.community.id,
            this.count,
            this.page,
            this.employer,
            this.employee,
          );
        }),
      )
      .subscribe((data) => {
        this.isLoadingMembers = false;
        this.members = data.users;
        this.page = +data.page;
        this.total = data.total;
      });
  }

  onFilterChange() {
    console.log(this.communityFilterForm.value);
  }

  getSpeakerDetails() {
    this.canLoadMoreSpeakers = true;
    if (this.isLoadingSpeakers) {
      return;
    }
    this.isLoadingSpeakers = true;
    if (!this.page_info?.end_cursor) {
      this.speakers = [];
    }

    this.communitiesService
      .getSpeakersList(
        this.mini,
        this.page_info?.end_cursor,
        this.count,
        null,
        this.query,
        this.month,
        this.year,
        this.employer,
        this.employee,
        this.community.id,
      )
      .subscribe((data) => {
        this.speakers = this.speakers.concat(data.page.reduce((acc, value) => [...acc, value.data], []));
        this.total = data.total;
        this.isRightScrollDisabled = false;
        this.page_info = data.page_info;
        this.skeletonLoaderCard = false;
        this.isLoadingSpeakers = false;
        this.canLoadMoreSpeakers = false;
      });
  }

  scrollSpeakers(direction: 'left' | 'right') {
    const speakersContainer = document.querySelector('.speakers-list') as HTMLElement;
    if (speakersContainer) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      speakersContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  checkScrollPosition(event: Event) {
    const target = event.target as HTMLElement;
    this.isLeftScrollDisabled = target.scrollLeft <= 0;
    this.isRightScrollDisabled = target.scrollLeft + target.clientWidth >= target.scrollWidth - 5;
  }

  getMembers(): void {
    if (!this.isLoadingMembers && (!this.total || this.members.length < this.total)) {
      this.isLoadingMembers = true;
      this.showSpinner = true;
      this.subscriptions.push(
        this.userRolesUsersService.pGetCommunityMembers(this.community.id, this.page, this.count).subscribe((data) => {
          this.members = [...this.members, ...data.users];
          this.page += 1;
          this.total = data.total;
          this.isLoadingMembers = false;
          if (this.members.length >= this.total) {
            this.canLoadMore = false;
          }
          this.showSpinner = false;
        }),
      );
    }
  }

  originalOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return 0;
  };

  filterByTags(event) {
    if (event === 'mutuals') {
      this.filterByMutuals = !this.filterByMutuals;
    }
    console.log(this.filterByMutuals);
    this.total = 0;
    this.page = 1;
    this.getMembers();
  }
}
