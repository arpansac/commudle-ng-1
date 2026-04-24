import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { SeoService } from '@commudle/shared-services';

@Component({
    selector: 'commudle-community-builds',
    templateUrl: './community-builds.component.html',
    styleUrls: ['./community-builds.component.scss'],
    standalone: false
})
export class CommunityBuildsComponent implements OnInit, OnDestroy {
  isMobileView: boolean;
  seoPreviewImage: string;
  seoMetadata;
  private readonly isBrowser: boolean;

  constructor(private footerService: FooterService, private seoService: SeoService, @Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.footerService.changeFooterStatus(true);
    this.isMobileView = this.isBrowser ? window.innerWidth <= 640 : false;
    this.setMeta();
  }

  onSeoMetadataChange(metadata: object) {
    this.seoMetadata = metadata;
    this.setMeta();
  }

  onSeoPreviewImageRetrieved(img: string) {
    this.seoPreviewImage = img;
    this.setMeta();
  }

  ngOnDestroy(): void {
    this.footerService.changeFooterStatus(false);
  }

  setMeta() {
    this.seoService.setTags(
      this.seoMetadata?.title
        ? this.seoMetadata.title
        : 'Builds - Projects & Side Hustle Sharing Platform for Developers ',
      this.seoMetadata?.desc
        ? this.seoMetadata.desc
        : 'Projects built by techies in the developer communities around you. Share your own open source projects in Web, Android, iOS, AI, ML and inspire others',
      this.seoPreviewImage ? this.seoPreviewImage : 'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }
}
