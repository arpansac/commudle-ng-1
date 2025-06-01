import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faPlus, faPlusSquare, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import { IEvent } from 'apps/shared-models/event.model';
import { CommunityEventsListActionsComponent } from './community-events-list-actions/community-events-list-actions.component';
import { CommunityEventsListDateComponent } from './community-events-list-date/community-events-list-date.component';
import { CommunityEventsListPublicPageComponent } from './community-events-list-public-page/community-events-list-public-page.component';
import { Cell } from 'angular2-smart-table'; // Ensure this is imported
import { debounceTime, filter, map, switchMap } from 'rxjs/operators';
import { NbDialogService } from '@commudle/theme';

import moment from 'moment';

@Component({
  selector: 'app-community-events-list',
  templateUrl: './community-events-list.component.html',
  styleUrls: ['./community-events-list.component.scss'],
})
export class CommunityEventsListComponent implements OnInit {
  selectedEvent: IEvent;
  faPlusSquare = faPlusSquare;
  communityId;
  isLoading = true;
  events: IEvent[];

  query = '';

  icons = {
    faPlus,
    faArrowUpRightFromSquare,
  };

  moment = moment;

  total = 0;
  count = 10;
  page = 1;
  options;

  eventStatus: string[] = [];

  searchForm;

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
    private dialogBoxService: NbDialogService,
  ) {
    this.eventStatus = [];
    this.searchForm = this.fb.group({
      name: [''],
    });
    this.options = ['open', 'draft', 'completed', 'cancelled'];
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.communityId = params.community_id;

      this.getCommunityEvents();
    });
    this.search();
  }

  openCloneEventWindow(dialogBox, event) {
    this.selectedEvent = event;
    this.dialogBoxService.open(dialogBox);
  }

  getCommunityEvents() {
    this.eventsService
      .communityEventsForEmail(this.communityId, this.page, this.count, this.query, this.eventStatus)
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
        switchMap(() => {
          this.page = 1;
          this.isLoading = true;
          this.query = this.searchForm.get('name').value;
          return this.eventsService.communityEventsForEmail(
            this.communityId,
            this.page,
            this.count,
            this.query,
            this.eventStatus,
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

  filterByTags(status: string) {
    const index = this.eventStatus.indexOf(status);
    if (index > -1) {
      // Remove if already selecteds
      this.eventStatus.splice(index, 1);
    } else {
      // Add if not selected
      this.eventStatus.push(status);
    }
    this.total = 0;
    this.page = 1;
    this.getCommunityEvents();
  }

  isStatusSelected(status: string): boolean {
    return this.eventStatus && this.eventStatus.includes(status); // ✅ Returns boolean
  }
}
