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
  seoTitle: string;
  seoDescription: string;
  seoPreviewImage: string;

  constructor(private footerService: FooterService, private seoService: SeoService) {}

  ngOnInit() {
    this.footerService.changeFooterStatus(true);
    this.isMobileView = window.innerWidth <= 640;
  }

  handleTitle(title: string) {
    this.seoTitle = title;
    this.trySetMeta();
  }

  handleDesc(desc: string) {
    this.seoDescription = desc;
    this.trySetMeta();
  }

  handlePreviewImage(img: string) {
    this.seoPreviewImage = img;
    this.trySetMeta();
  }

  ngOnDestroy(): void {
    this.footerService.changeFooterStatus(false);
  }

  trySetMeta() {
    if (this.seoTitle && this.seoDescription && this.seoPreviewImage) {
      this.setMeta();
    }
  }
  setMeta() {
    console.log(this.seoPreviewImage);
    this.seoService.setTags(
      this.seoTitle,
      this.seoDescription,
      this.seoPreviewImage ? this.seoPreviewImage : 'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }
}
