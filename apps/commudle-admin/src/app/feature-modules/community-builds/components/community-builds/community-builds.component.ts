import { Component, OnDestroy, OnInit } from '@angular/core';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { SeoService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-community-builds',
  templateUrl: './community-builds.component.html',
  styleUrls: ['./community-builds.component.scss'],
})
export class CommunityBuildsComponent implements OnInit, OnDestroy {
  isMobileView: boolean;
  seoPreviewImage: string;
  seoMetadata;

  constructor(private footerService: FooterService, private seoService: SeoService) {}

  ngOnInit() {
    this.footerService.changeFooterStatus(true);
    this.isMobileView = window.innerWidth <= 640;
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
