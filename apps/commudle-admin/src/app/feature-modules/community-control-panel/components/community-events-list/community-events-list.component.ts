import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faPlus, faArrowUpRightFromSquare, faTableList } from '@fortawesome/free-solid-svg-icons';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import { EEventStatuses } from 'apps/shared-models/enums/event_statuses.enum';
import { CommunityEventsListActionsComponent } from './community-events-list-actions/community-events-list-actions.component';
import { CommunityEventsListDateComponent } from './community-events-list-date/community-events-list-date.component';
import { CommunityEventsListPublicPageComponent } from './community-events-list-public-page/community-events-list-public-page.component';
import { debounceTime, filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ICommunity, IEvent } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';

@Component({
  selector: 'app-community-events-list',
  templateUrl: './community-events-list.component.html',
  styleUrls: ['./community-events-list.component.scss'],
})
export class CommunityEventsListComponent implements OnInit, OnDestroy {
  @ViewChild('cloneEvent') cloneEvent: TemplateRef<any>;
  destroy$ = new Subject<void>();

  community: ICommunity;

  isLoading = true;
  events: IEvent[];
  EEventStatuses = EEventStatuses;

  query = '';
  icons = {
    faPlus,
    faArrowUpRightFromSquare,
    faTableList,
  };

  total = 0;
  count = 10;
  page = 1;

  eventStatuses = Object.values(EEventStatuses);
  activeEventStatuses: string[] = [EEventStatuses.OPEN, EEventStatuses.DRAFT, EEventStatuses.COMPLETED];

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
    private seoService: SeoService,
    private dialogBoxService: NbDialogService,
  ) {
    this.searchForm = this.fb.group({
      name: [''],
    });
  }

  ngOnInit() {
    this.seoService.noIndex(true);
    this.activatedRoute.parent.data.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.community = value.community;
      this.setMeta();
      this.getCommunityEvents();
      this.search();
    });
  }

  getCommunityEvents() {
    this.isLoading = true;
    this.eventsService
      .communityEventsForEmail(this.community.id, this.page, this.count, this.query, this.activeEventStatuses)
      .pipe(takeUntil(this.destroy$))
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
            this.community.id,
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
    this.seoService.noIndex(false);
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
    this.isLoading = true;
    this.total = 0;
    this.page = 1;
    this.getCommunityEvents();
  }

  setMeta() {
    this.seoService.setTitle(`Events | Dashboard | ${this.community.name}`);
  }

  onActionSelect(event: Event, eventData: IEvent) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    if (value === 'clone') {
      this.openCloneEventWindow(this.cloneEvent, eventData);
    } else if (value === 'public-page') {
      this.router.navigate(['/communities/', eventData.kommunity_id, 'events', eventData.slug]);
    } else if (value === 'stats') {
      this.router.navigate(['/admin/communities/', eventData.kommunity_id, 'event-dashboard', eventData.slug, 'stats']);
    }
  }

  openCloneEventWindow(dialogBox, eventData: IEvent) {
    this.dialogBoxService.open(dialogBox, { context: { eventData } });
  }
}
