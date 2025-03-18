import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsService } from 'apps/shared-services/cms.service';
import { IListingPageHeader } from 'apps/shared-models/listing-page-header.model';
import { SharedComponentsModule } from '@commudle/shared-components';
import { ECampaignTypeSlug } from '@commudle/shared-models';
import { SharedPipesModule } from 'apps/shared-pipes/pipes.module';

@Component({
  selector: 'commudle-listing-page-header',
  standalone: true,
  imports: [CommonModule, SharedComponentsModule, SharedPipesModule],
  templateUrl: './listing-page-header.component.html',
  styleUrls: ['./listing-page-header.component.scss'],
})
export class ListingPageHeaderComponent implements OnInit {
  @Input() parentType: string;
  header: IListingPageHeader;
  richText: string;
  CampaignTypeSlug = ECampaignTypeSlug;

  constructor(private cmsService: CmsService) {}

  ngOnInit(): void {
    this.getHeaderText(this.parentType);
  }

  imageUrl(source: any) {
    return this.cmsService.getImageUrl(source);
  }

  getHeaderText(parentType) {
    this.cmsService.getDataBySlug(parentType).subscribe((data) => {
      this.header = data;
      this.richText = this.cmsService.getHtmlFromBlock(data);
    });
  }
}
