import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { IHackathon, EHackathonStatus } from 'apps/shared-models/hackathon.model';
import * as moment from 'moment';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil, filter } from 'rxjs/operators';
import { faPlus, faArrowUpRightFromSquare, faTableList, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { NbMenuService } from '@commudle/theme';

@Component({
  selector: 'commudle-admin-hackathon',
  templateUrl: './admin-hackathon.component.html',
  styleUrls: ['./admin-hackathon.component.scss'],
})
export class AdminHackathonComponent implements OnInit, OnDestroy {
  @Input() parentId: number | string;
  @Input() parentType: 'Kommunity' | 'CommunityGroup';

  hackathons: IHackathon[];
  subscriptions: Subscription[] = [];
  destroy$ = new Subject<void>();
  EHackathonStatus = EHackathonStatus;

  isLoading = true;
  query = '';
  searchForm;
  total = 0;
  count = 10;
  page = 1;
  hackathonStatuses = Object.values(EHackathonStatus);
  activeHackathonStatuses: string[] = [EHackathonStatus.OPEN, EHackathonStatus.DRAFT, EHackathonStatus.COMPLETED];

  contextMenuItems = [
    {
      title: 'Public Page',
    },
    {
      title: 'Stats',
    },
  ];

  activeContextMenuHackathon: IHackathon;

  moment = moment;
  icons = {
    faPlus,
    faArrowUpRightFromSquare,
    faTableList,
    faArrowRight,
  };

  constructor(
    private hackathonService: HackathonService,
    private fb: FormBuilder,
    private menuService: NbMenuService,
    private router: Router,
  ) {
    this.searchForm = this.fb.group({
      name: [''],
    });
  }

  ngOnInit() {
    this.getHackathons();
    this.search();
    this.handleContextMenu();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }

  getHackathons() {
    this.isLoading = true;
    this.hackathonService.indexHackathons(this.parentId, this.parentType).subscribe((data) => {
      this.hackathons = data;
      this.isLoading = false;
    });
  }

  // getHackathons() {
  //   this.isLoading = true;
  //   this.hackathonService.indexHackathons(this.parentId, this.parentType, this.page, this.count, this.query, this.activeEventStatuses).pipe(takeUntil(this.destroy$)).subscribe((data) => {
  //     this.hackathons = data.values;
  //     this.total = data.total;
  //     this.page = data.page;
  //     this.isLoading = false;
  //   });
  // }

  search() {
    // this.searchForm.valueChanges
    //   .pipe(
    //     debounceTime(800),
    //     takeUntil(this.destroy$),
    //     switchMap(() => {
    //       this.page = 1;
    //       this.isLoading = true;
    //       this.query = this.searchForm.get('name').value;
    //       return this.hackathonService.indexHackathons(
    //         this.parentId,
    //         this.parentType,
    //         this.page,
    //         this.count,
    //         this.query,
    //         this.activeEventStatuses,
    //       );
    //     }),
    //   )
    //   .subscribe((data) => {
    //     this.hackathons = data.values;
    //     this.total = data.total;
    //     this.page = data.page;
    //     this.isLoading = false;
    //   });
  }

  onStatusFilterChange(selectedValues: string[]) {
    this.activeHackathonStatuses = selectedValues;
    this.isLoading = true;
    this.total = 0;
    this.page = 1;
    this.getHackathons();
  }

  setContextHackathon(hackathon: IHackathon) {
    this.activeContextMenuHackathon = hackathon;
  }

  handleContextMenu(): void {
    this.menuService
      .onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'hackathon-context-menu'),
        takeUntil(this.destroy$),
      )
      .subscribe(({ item: menuItem }) => {
        switch (menuItem.title) {
          case 'Public Page': {
            this.router.navigate(['/communities', this.parentId, 'hackathons', this.activeContextMenuHackathon.slug]);
            break;
          }
          case 'Stats': {
            this.router.navigate([
              '/admin',
              'communities',
              this.parentId,
              'hackathon-dashboard',
              this.activeContextMenuHackathon.slug,
              'stats',
            ]);
            break;
          }
        }
      });
  }
}
