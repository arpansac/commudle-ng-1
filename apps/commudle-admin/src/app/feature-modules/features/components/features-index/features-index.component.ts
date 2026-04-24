import { isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { faAdd, faMinus } from '@fortawesome/free-solid-svg-icons';
import { IFeature } from 'apps/shared-models/features.model';
import { CmsService } from 'apps/shared-services/cms.service';

@Component({
    selector: 'commudle-features-index',
    templateUrl: './features-index.component.html',
    styleUrls: ['./features-index.component.scss'],
    standalone: false
})
export class FeaturesIndexComponent implements OnInit {
  @Input() features: IFeature[];
  @Input() selectedFeature: IFeature;
  @Output() featureSlug: EventEmitter<string> = new EventEmitter<string>();
  showSubHeading = [];
  faAdd = faAdd;
  faMinus = faMinus;
  isMobileView: boolean;
  selectedFeatureSlug: string;
  private readonly isBrowser: boolean;

  constructor(private cmsService: CmsService, @Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.isMobileView = this.isBrowser ? window.innerWidth <= 640 : false;
    this.featureSlug.emit(this.features[0].slug.current);
    this.selectedFeatureSlug = this.features[0].slug.current;
  }

  imageUrl(source: any) {
    return this.cmsService.getImageUrl(source);
  }

  toggleShowAnswers(slug, index?: number) {
    if (slug) {
      this.selectedFeatureSlug = slug;
      this.featureSlug.emit(slug);
    }
    for (let i = 0; i < this.showSubHeading.length; i++) {
      if (i !== index) {
        this.showSubHeading[i] = false;
      }
    }
    this.showSubHeading[index] = !this.showSubHeading[index];
  }
}
