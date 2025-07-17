import { Component, OnDestroy, OnInit } from '@angular/core';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { SeoService } from 'apps/shared-services/seo.service';

@Component({
  selector: 'app-labs',
  templateUrl: './labs.component.html',
  styleUrls: ['./labs.component.scss'],
})
export class LabsComponent implements OnInit, OnDestroy {
  isMobileView: boolean;
  seoTitle: string;
  seoPreviewImage: string;

  constructor(private seoService: SeoService, private footerService: FooterService) {}

  ngOnInit() {
    this.footerService.changeFooterStatus(true);
    this.isMobileView = window.innerWidth <= 640;
    this.setMeta();
  }

  handleTitle(title: string) {
    this.seoTitle = title;
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
    if (this.seoTitle && this.seoPreviewImage) {
      this.setMeta();
    }
  }

  setMeta() {
    this.seoService.setTags(
      this.seoTitle,
      'Labs are guided hands-on tutorials published by software developers. They teach you algorithms, help you create  apps & projects and cover topics including Web, Flutter, Android, iOS, Data Structures, ML & AI.',
      this.seoPreviewImage ? this.seoPreviewImage : `https://commudle.com/assets/images/commudle-logo192.png`,
    );
  }
}
