import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserRolesUsersService } from 'apps/commudle-admin/src/app/services/user_roles_users.service';
import { ICommunity } from 'apps/shared-models/community.model';
import { IUser } from 'apps/shared-models/user.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { debounceTime, takeUntil, Subscription, Subject, distinctUntilChanged } from 'rxjs';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { IPageInfo } from 'apps/shared-models/page-info.model';
import { FormBuilder } from '@angular/forms';
import { EDomain } from '@commudle/shared-models';
import { KeyValue, Location } from '@angular/common';

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
  queryParamsString = '';
  month = false;
  year = false;
  employer = false;
  employee = false;

  subscriptions: Subscription[] = [];

  speakers: IUser[] = [];
  isLoadingSpeakers = false;
  isLoadingMembers = false;
  loadingData = false;
  showSpinner = false;
  isLeftScrollDisabled = true;
  isRightScrollDisabled = true;
  searchForm;
  membersForm;
  EDomain = EDomain;
  filterByMutuals = false;

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private userRolesUsersService: UserRolesUsersService,
    private seoService: SeoService,
    private communitiesService: CommunitiesService,
    private fb: FormBuilder,
    private location: Location,
  ) {
    this.searchForm = this.fb.group({
      name: [''],
    });

    this.membersForm = this.fb.group({
      employment_status: [''],
      domains: [[]],
    });
  }

  ngOnInit(): void {
    const params = this.activatedRoute.snapshot.queryParams;
    if (Object.keys(params).length > 0) {
      if (params.domains) {
        let domainsArray: string[];

        if (typeof params.domains === 'string' && params.domains.includes(',')) {
          domainsArray = params.domains.split(',');
        } else {
          domainsArray = [params.domains];
        }
        this.membersForm.get('domains').patchValue(domainsArray);
      }
      if (params.employer === 'true') {
        this.membersForm.get('employment_status').setValue('employer');
        this.employer = true;
        this.employee = false;
      } else if (params.employee === 'true') {
        this.membersForm.get('employment_status').setValue('employee');
        this.employer = false;
        this.employee = true;
      }
      if (params.query) {
        this.query = params.query;
        this.searchForm.get('name').setValue(this.query);
      }
      if (params.mutuals === 'true') {
        this.filterByMutuals = true;
      }
      this.page = 1;
      this.members = [];
      this.total = 0;
    }
    this.search();

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
    this.members = [];
    this.page_info = null;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }

  search() {
    this.query = '';
    this.searchForm.valueChanges
      .pipe(debounceTime(800), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.loadingData) {
          return;
        }
        this.members = [];
        this.page_info = null;
        this.page = 1;
        this.total = 0;
        this.canLoadMore = true;
        this.loadingData = true;
        this.query = this.searchForm.get('name').value;
        this.queryParamsString = this.query;
        this.generateParams(
          this.employer,
          this.employee,
          this.query,
          this.filterByMutuals,
          this.membersForm.get('domains').value,
        );
      });
  }

  onFilterChange() {
    const filterValues = this.membersForm.value;

    if (filterValues.employment_status === 'employer') {
      this.employer = true;
      this.employee = false;
    } else if (filterValues.employment_status === 'employee') {
      this.employer = false;
      this.employee = true;
    } else {
      this.employer = false;
      this.employee = false;
    }

    this.generateParams(this.employer, this.employee, this.query, this.filterByMutuals, filterValues.domains);
    this.page = 1;
    this.members = [];
    this.total = 0;
    this.getMembers();
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
    if (!this.isLoadingMembers) {
      this.isLoadingMembers = true;
      this.showSpinner = true;
      this.subscriptions.push(
        this.userRolesUsersService
          .pGetCommunityMembers(
            this.employer,
            this.employee,
            this.query,
            this.filterByMutuals,
            this.membersForm.get('domains').value,
            this.community.id,
            this.page,
            this.count,
          )
          .subscribe((data) => {
            this.members = data.values;
            this.page = +data.page;
            this.total = data.total;
            this.isLoadingMembers = false;
            if (this.members.length >= this.total) {
              this.canLoadMore = false;
            }
            this.showSpinner = false;
            this.loadingData = false;
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

      this.generateParams(
        this.employer,
        this.employee,
        this.query,
        this.filterByMutuals,
        this.membersForm.get('domains').value,
      );
    }
    this.total = 0;
    this.page = 1;
    this.getMembers();
  }

  generateParams(employer, employee, query, filterByMutuals, domains) {
    const queryParams: { [key: string]: any } = {};
    if (employer) {
      queryParams.employer = true;
    }
    if (employee) {
      queryParams.employee = true;
    }
    if (query) {
      queryParams.query = query;
    }
    if (filterByMutuals) {
      queryParams.mutuals = true;
    }
    if (domains && domains.length > 0) {
      queryParams.domains = domains.join(',');
    }
    const urlSearchParams = new URLSearchParams(queryParams);
    const queryParamsString = urlSearchParams.toString();
    this.location.replaceState(location.pathname, queryParamsString);
    this.getMembers();
  }

  clearAllFilters() {
    this.membersForm.reset();
    this.searchForm.get('name').setValue('');
    this.filterByMutuals = false;
    this.employer = false;
    this.employee = false;
    this.page = 1;
    this.members = [];
    this.total = 0;
    this.getMembers();
    this.location.replaceState(location.pathname, '');
  }
}
