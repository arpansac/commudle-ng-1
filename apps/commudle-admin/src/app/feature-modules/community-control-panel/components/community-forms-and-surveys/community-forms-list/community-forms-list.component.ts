import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faPlus, faSearch, faUser, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Cell, Settings } from 'angular2-smart-table';
import { DataFormsService } from 'apps/commudle-admin/src/app/services/data_forms.service';
import { IDataForm } from 'apps/shared-models/data_form.model';
import { CommunityFormsListActionsComponent } from './community-forms-list-actions/community-forms-list-actions.component';
import { CommunityFormsListStatsComponent } from './community-forms-list-stats/community-forms-list-stats.component';
import { Subscription } from 'rxjs';
import { ICommunity } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';
import { FormResponsesComponent } from 'apps/shared-components/form-responses/form-responses.component';
import { NbWindowService } from '@commudle/theme';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-community-forms-list',
  templateUrl: './community-forms-list.component.html',
  styleUrls: ['./community-forms-list.component.scss'],
})
export class CommunityFormsListComponent implements OnInit, OnDestroy {
  community: ICommunity;
  faPlus = faPlus;
  faSearch = faSearch;
  faUser = faUser;
  faEdit = faEdit;
  dataForms: IDataForm[];
  filteredForms: IDataForm[];
  searchTerm = '';
  isLoading = true;
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
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.seoService.noIndex(false);
  }

  getDataForms() {
    this.subscriptions.push(
      this.dataFormsService.getCommunityDataForms(this.community.id).subscribe((data) => {
        this.dataForms = data.data_forms;
        this.filteredForms = [...this.dataForms];
        this.isLoading = false;
      }),
    );
  }

  onSearchChange() {
    if (!this.searchTerm.trim()) {
      this.filteredForms = [...this.dataForms];
    } else {
      this.filteredForms = this.dataForms.filter(
        (form) =>
          form.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          form.user.toLowerCase().includes(this.searchTerm.toLowerCase()),
      );
    }
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
