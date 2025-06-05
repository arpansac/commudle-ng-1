import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { Cell, Settings } from 'angular2-smart-table';
import { DataFormsService } from 'apps/commudle-admin/src/app/services/data_forms.service';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { IDataForm } from 'apps/shared-models/data_form.model';
import { ICommunity } from 'apps/shared-models/community.model';
import { CommunityFormsListActionsComponent } from './community-forms-list-actions/community-forms-list-actions.component';
import { CommunityFormsListStatsComponent } from './community-forms-list-stats/community-forms-list-stats.component';
import { Subscription } from 'rxjs';
import { SeoService } from 'apps/shared-services/seo.service';

@Component({
  selector: 'app-community-forms-list',
  templateUrl: './community-forms-list.component.html',
  styleUrls: ['./community-forms-list.component.scss'],
})
export class CommunityFormsListComponent implements OnInit, OnDestroy {
  community: ICommunity;
  communityId;
  faPlusSquare = faPlusSquare;
  newFormParentId;
  dataForms: IDataForm[];
  isLoading = true;
  tableSettings: Settings = {
    actions: false,
    pager: {
      perPage: 10,
    },
    columns: {
      name: {
        title: 'Name',
      },
      mini_stats: {
        title: 'Mini Stats',
        type: 'custom',
        renderComponent: CommunityFormsListStatsComponent,
        componentInitFunction: (instance: CommunityFormsListStatsComponent, cell: Cell) => {
          const dataForms: IDataForm = cell.getRow().getData();
          instance.rowData = dataForms;
        },
        isFilterable: false,
        isSortable: false,
      },
      actions: {
        title: 'Actions',
        type: 'custom',
        renderComponent: CommunityFormsListActionsComponent,
        componentInitFunction: (instance: CommunityFormsListActionsComponent, cell: Cell) => {
          const dataForms: IDataForm = cell.getRow().getData();
          instance.rowData = dataForms;
        },
        isFilterable: false,
        isSortable: false,
      },
    },
  };

  subscriptions: Subscription[] = [];

  constructor(
    private dataFormsService: DataFormsService,
    private communitiesService: CommunitiesService,
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
  ) {}

  ngOnInit() {
    // check if this has to be removed or not
    this.newFormParentId = this.activatedRoute.parent.snapshot.params.community_id;
    console.log(this.newFormParentId);
    console.log(this.activatedRoute.parent.snapshot.params);
    // this.subscriptions.push(
    //   this.activatedRoute.params.subscribe(() => {
    //     this.communityId = this.activatedRoute.parent.snapshot.params['community_id'];
    //   }),
    // );
    // this.communitiesService.getCommunityDetails(this.communityId).subscribe((data) => {
    //   this.community = data;
    //   this.setMeta();
    // });
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((value) => {
        this.community = value.community;
        console.log(this.community);
        this.communityId = this.community.id;
        this.setMeta();
      }),
    );

    if (this.newFormParentId) {
      this.getDataForms();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.seoService.noIndex(false);
  }

  getDataForms() {
    this.dataFormsService.getCommunityDataForms(this.newFormParentId).subscribe((data) => {
      this.dataForms = data.data_forms;
      this.isLoading = false;
    });
  }

  setMeta() {
    this.seoService.setTitle(`Form Data | Dashboard | ${this.community.name}`);
    this.seoService.noIndex(true);
  }
}
