import { Component, OnDestroy, OnInit } from '@angular/core';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { SeoService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-public-home-list-speakers',
  templateUrl: './public-home-list-speakers.component.html',
  styleUrls: ['./public-home-list-speakers.component.scss'],
})
export class PublicHomeListSpeakersComponent implements OnInit, OnDestroy {
  isMobileView: boolean;
  seoPreviewImage: string;
  seoTitle: string;

  constructor(private footerService: FooterService, private seoService: SeoService) {}

  ngOnInit(): void {
    this.footerService.changeFooterStatus(true);
    this.isMobileView = window.innerWidth <= 640;
  }

  ngOnDestroy(): void {
    this.footerService.changeFooterStatus(false);
  }

  handlePreviewImage(img) {
    this.seoPreviewImage = img;
  }

  handleTitle(title) {
    this.seoTitle = title;
  }
}
