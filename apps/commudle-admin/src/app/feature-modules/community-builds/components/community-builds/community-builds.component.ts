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
  seoTitleandDesc;

  constructor(private footerService: FooterService, private seoService: SeoService) {}

  ngOnInit() {
    this.footerService.changeFooterStatus(true);
    this.isMobileView = window.innerWidth <= 640;
    this.setMeta();
  }

  handleTitleandDesc(titleandDesc: object) {
    this.seoTitleandDesc = titleandDesc;
    this.setMeta();
  }

  handlePreviewImage(img: string) {
    this.seoPreviewImage = img;
    this.setMeta();
  }

  ngOnDestroy(): void {
    this.footerService.changeFooterStatus(false);
  }

  setMeta() {
    this.seoService.setTags(
      this.seoTitleandDesc?.title
        ? this.seoTitleandDesc.title
        : 'Builds - Projects & Side Hustle Sharing Platform for Developers ',
      this.seoTitleandDesc?.desc
        ? this.seoTitleandDesc.desc
        : 'Projects built by techies in the developer communities around you. Share your own open source projects in Web, Android, iOS, AI, ML and inspire others',
      this.seoPreviewImage ? this.seoPreviewImage : 'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }
}
