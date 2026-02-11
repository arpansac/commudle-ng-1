import { Component, OnInit } from '@angular/core';
import { ICaseStudy } from 'apps/shared-models/case-study.model';
import { CmsService } from 'apps/shared-services/cms.service';
import { SeoService } from '@commudle/shared-services';

@Component({
    selector: 'commudle-case-studies-header',
    templateUrl: './case-studies-header.component.html',
    styleUrls: ['./case-studies-header.component.scss'],
    standalone: false
})
export class CaseStudiesHeaderComponent implements OnInit {
  caseStudyPageHeader: ICaseStudy;
  headerImgUrl: string;

  constructor(private cmsService: CmsService, private seoService: SeoService) {}

  ngOnInit(): void {
    this.getHeaderText();
  }

  imageUrl(source: any) {
    return this.cmsService.getImageUrl(source);
  }

  getHeaderText() {
    this.cmsService.getDataBySlug('case-study').subscribe((data) => {
      this.caseStudyPageHeader = data;
      this.headerImgUrl = this.imageUrl(this.caseStudyPageHeader?.header_image).url();
      this.setMeta();
    });
  }

  setMeta(): void {
    this.seoService.setTags(
      'Case Studies - Successful Developer Programs',
      'Understand how Commudle has helped devrels and their developer programs become successful across different geographies and scale. Simple to use, high impact and super networking',
      this.headerImgUrl,
    );
  }
}
