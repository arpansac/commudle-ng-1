import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faPlus, faSearch, faUser, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Cell, Settings } from 'angular2-smart-table';
import { DataFormsService } from 'apps/commudle-admin/src/app/services/data_forms.service';
import { IDataForm } from 'apps/shared-models/data_form.model';
import { CommunityFormsListActionsComponent } from './community-forms-list-actions/community-forms-list-actions.component';
import { CommunityFormsListStatsComponent } from './community-forms-list-stats/community-forms-list-stats.component';
import { debounceTime, Subscription, takeUntil, switchMap, Subject } from 'rxjs';
import { ICommunity } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';
import { FormResponsesComponent } from 'apps/shared-components/form-responses/form-responses.component';
import { NbWindowService } from '@commudle/theme';
import { FormBuilder } from '@angular/forms';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';

@Component({
    selector: 'app-community-forms-list',
    templateUrl: './community-forms-list.component.html',
    styleUrls: ['./community-forms-list.component.scss'],
    standalone: false
})
export class CommunityFormsListComponent implements OnInit, OnDestroy {
  community: ICommunity;
  faPlus = faPlus;
  faSearch = faSearch;
  faUser = faUser;
  faEdit = faEdit;
  dataForms: IDataForm[] = [];
  searchTerm = '';
  isLoading = true;
  searchForm;
  total = 0;
  count = 10;
  page = 1;
  query = '';
  destroy$ = new Subject<void>();
  staticAssets = staticAssets;

  // tableSettings: Settings = {
  //   actions: false,
  //   pager: {
  //     perPage: 10,
  //   },
  //   columns: {
  //     name: {
  //       title: 'Name',
  //     },
  //     mini_stats: {
  //       title: 'Mini Stats',
  //       type: 'custom',
  //       renderComponent: CommunityFormsListStatsComponent,
  //       componentInitFunction: (instance: CommunityFormsListStatsComponent, cell: Cell) => {
  //         const dataForms: IDataForm = cell.getRow().getData();
  //         instance.rowData = dataForms;
  //       },
  //       isFilterable: false,
  //       isSortable: false,
  //     },
  //     actions: {
  //       title: 'Actions',
  //       type: 'custom',
  //       renderComponent: CommunityFormsListActionsComponent,
  //       componentInitFunction: (instance: CommunityFormsListActionsComponent, cell: Cell) => {
  //         const dataForms: IDataForm = cell.getRow().getData();
  //         instance.rowData = dataForms;
  //       },
  //       isFilterable: false,
  //       isSortable: false,
  //     },
  //   },
  // };

  subscriptions: Subscription[] = [];

  constructor(
    private dataFormsService: DataFormsService,
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
    private windowService: NbWindowService,
    private fb: FormBuilder,
  ) {
    this.searchForm = this.fb.group({
      name: [''],
    });
  }

  ngOnInit() {
    this.seoService.noIndex(true);
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((value) => {
        this.community = value.community;
        this.setMeta();
        if (this.community.id) {
          this.getDataForms();
        }
        this.search();
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.seoService.noIndex(false);
    this.destroy$.next();
    this.destroy$.complete();
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
          return this.dataFormsService.getCommunityDataForms(this.community.id, this.page, this.count, this.query);
        }),
      )
      .subscribe((data) => {
        this.dataForms = data.values;
        this.total = data.total;
        this.page = data.page;
        this.isLoading = false;
      });
  }

  getDataForms() {
    this.subscriptions.push(
      this.dataFormsService
        .getCommunityDataForms(this.community.id, this.page, this.count, this.query)
        .subscribe((data) => {
          this.dataForms = data.values;
          this.total = data.total;
          this.page = data.page;
          this.isLoading = false;
        }),
    );
  }

  openResponses(form: IDataForm) {
    this.windowService.open(FormResponsesComponent, {
      title: `Survey ${form.name} Responses`,
      context: {
        dataFormId: form.id,
      },
      windowClass: 'full-screen-width',
    });
  }

  setMeta() {
    this.seoService.setTitle(`Form Data | Dashboard | ${this.community.name}`);
  }
}
