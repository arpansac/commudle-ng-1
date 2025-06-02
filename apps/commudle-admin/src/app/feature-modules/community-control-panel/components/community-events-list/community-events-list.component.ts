import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faPlus, faPlusSquare, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import { IEvent } from 'apps/shared-models/event.model';
import { EEventStatuses } from 'apps/shared-models/enums/event_statuses.enum';
import { CommunityEventsListActionsComponent } from './community-events-list-actions/community-events-list-actions.component';
import { CommunityEventsListDateComponent } from './community-events-list-date/community-events-list-date.component';
import { CommunityEventsListPublicPageComponent } from './community-events-list-public-page/community-events-list-public-page.component';
import { debounceTime, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-community-events-list',
  templateUrl: './community-events-list.component.html',
  styleUrls: ['./community-events-list.component.scss'],
})
export class CommunityEventsListComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();

  communityId;
  isLoading = true;
  events: IEvent[];
  EEventStatuses = EEventStatuses;

  query = '';
  faPlusSquare = faPlusSquare;
  icons = {
    faPlus,
    faArrowUpRightFromSquare,
  };

  total = 0;
  count = 10;
  page = 1;

  eventStatuses = Object.values(EEventStatuses);
  activeEventStatuses: string[] = [];

  searchForm;

  //angular2 smart-table, not being used anymore (kept for reference)

  // tableSettings: Settings = {
  //   actions: false,
  //   pager: {
  //     perPage: 10,
  //   },
  //   columns: {
  //     name: {
  //       title: 'Name',
  //     },
  //     date: {
  //       title: 'Date',
  //       isFilterable: false,
  //       type: 'custom',
  //       renderComponent: CommunityEventsListDateComponent,
  //       componentInitFunction: (instance: CommunityEventsListDateComponent, cell: Cell) => {
  //         const rowData: IEvent = cell.getRow().getData();
  //         instance.rowData = rowData;
  //       },
  //     },
  //     status: {
  //       title: 'Status',
  //       isFilterable: false,
  //     },
  //     actions: {
  //       title: 'Actions',
  //       isFilterable: false,
  //       type: 'custom',
  //       renderComponent: CommunityEventsListActionsComponent,
  //       isSortable: false,
  //       componentInitFunction: (instance: CommunityEventsListActionsComponent, cell: Cell) => {
  //         const rowData: IEvent = cell.getRow().getData();
  //         instance.rowData = rowData;
  //       },
  //     },
  //     public_page: {
  //       title: 'Public Page',
  //       isFilterable: false,
  //       type: 'custom',
  //       renderComponent: CommunityEventsListPublicPageComponent,
  //       isSortable: false,
  //       componentInitFunction: (instance: CommunityEventsListPublicPageComponent, cell: Cell) => {
  //         const rowData: IEvent = cell.getRow().getData();
  //         instance.rowData = rowData;
  //       },
  //     },
  //   },
  //   rowClassFunction: () => 'clickable',
  // };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private eventsService: EventsService,
    private fb: FormBuilder,
  ) {
    this.activeEventStatuses = [];
    this.searchForm = this.fb.group({
      name: [''],
    });
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.communityId = params.community_id;

      this.getCommunityEvents();
    });
    this.search();
  }

  getCommunityEvents() {
    this.isLoading = true;
    this.eventsService
      .communityEventsForEmail(this.communityId, this.page, this.count, this.query, this.activeEventStatuses)
      .subscribe((data) => {
        this.events = data.values;
        this.total = data.total;
        this.page = data.page;
        this.isLoading = false;
      });
  }

  search() {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(800),
        takeUntil(this.destroy$),
        switchMap(() => {
          this.page = 1;
          this.isLoading = true;
          this.query = this.searchForm.get('name').value;
          return this.eventsService.communityEventsForEmail(
            this.communityId,
            this.page,
            this.count,
            this.query,
            this.activeEventStatuses,
          );
        }),
      )
      .subscribe((data) => {
        this.events = data.values;
        this.total = data.total;
        this.page = data.page;
        this.isLoading = false;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  filterByTags(status: string) {
    const index = this.activeEventStatuses.indexOf(status);
    if (index > -1) {
      // Remove if the tag is already selected
      this.activeEventStatuses.splice(index, 1);
    } else {
      // Add if the tag is not selected
      this.activeEventStatuses.push(status);
    }
    this.total = 0;
    this.page = 1;
    this.getCommunityEvents();
  }
}
