import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ILab } from '@commudle/shared-models';
import { LabsService } from 'apps/commudle-admin/src/app/feature-modules/labs/services/labs.service';
import { IPageInfo } from 'apps/shared-models/page-info.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '@commudle/shared-environments';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-labs-search',
  templateUrl: './labs-search.component.html',
  styleUrls: ['./labs-search.component.scss'],
})
export class LabsSearchComponent implements OnInit {
  labs: ILab[] = [];
  pageInfo: IPageInfo;
  loading = false;
  loadingLabs = false;
  total: number;
  limit = 9;
  skeletonLoaderCard = true;
  queryParamsString = '';
  searchForm;
  query = '';
  isLoadingSearch = false;
  page = 1;
  count = 10;
  totalSearch = 0;
  seoTitle: string;

  @Output() seoTitleChange = new EventEmitter<string>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private location: Location,
    private seoService: SeoService,
    private labsService: LabsService,
  ) {
    this.searchForm = this.fb.group({
      name: [''],
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
    this.labs = [];
    this.updateSeoTitle();
    if (!params.query) {
      this.getLabs();
    }
  }

  updateSeoTitle() {
    if (this.query) {
      this.seoTitle = `${this.query} - Guided Tutorials by Software Developers & Designers`;
    }
    this.seoTitleChange.emit(this.seoTitle);
  }

  search() {
    this.query = '';
    this.searchForm.valueChanges.pipe(debounceTime(800), distinctUntilChanged()).subscribe(() => {
      if (this.isLoadingSearch) {
        return;
      }
      this.labs = [];
      this.pageInfo = null;
      this.isLoadingSearch = true;
      this.query = this.searchForm.get('name').value;
      this.queryParamsString = this.query;
      this.generateParams(this.query);
    });
  }

  generateParams(query) {
    this.skeletonLoaderCard = true;
    const queryParams: { [key: string]: any } = {};

    if (query) {
      queryParams.query = query;
    }
    this.seoTitle = this.query;
    this.updateSeoTitle();
    const urlSearchParams = new URLSearchParams(queryParams);
    const queryParamsString = urlSearchParams.toString();
    this.location.replaceState(location.pathname, queryParamsString);
    this.getLabs();
  }

  resetFiltersAndSearch() {
    this.searchForm.get('name').setValue('');
    this.query = '';
    this.labs = [];
    this.pageInfo = null;
  }

  getLabs() {
    this.loading = true;
    if (this.loadingLabs) {
      return;
    }
    this.loadingLabs = true;
    if (!this.pageInfo?.end_cursor) {
      this.labs = [];
    }
    this.labsService.pIndex(this.pageInfo?.end_cursor, this.limit, this.query).subscribe((data) => {
      this.labs = this.labs.concat(data.page.reduce((acc, value) => [...acc, value.data], []));
      this.setSeoSchema();
      this.total = data.total;
      this.pageInfo = data.page_info;
      this.skeletonLoaderCard = false;
      this.loadingLabs = false;
      this.loading = false;
      this.isLoadingSearch = false;
    });
  }

  setSeoSchema() {
    const schemaArray = this.labs.map((lab) => ({
      '@context': 'https://schema.org/',
      '@type': 'HowTo',
      name: lab.name,
      image: lab.header_image ? lab.header_image.url : '',
      step: lab.lab_steps.map((step) => ({
        '@type': 'HowToStep',
        name: step.name,
        url: `${environment.app_url}/labs/${lab.slug}/steps/${step.id}`,
      })),
    }));

    this.seoService.setSchema(schemaArray);
  }
}
