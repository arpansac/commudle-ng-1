import { Component, OnDestroy, OnInit } from '@angular/core';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { SeoService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-communities',
  templateUrl: './communities.component.html',
  styleUrls: ['./communities.component.scss'],
})
export class CommunitiesComponent implements OnInit, OnDestroy {
  isMobileView: boolean;
  seoTitle: string;
  seoPreviewImage: string;

  constructor(private footerService: FooterService, private seoService: SeoService) {}

  ngOnInit(): void {
    this.footerService.changeFooterStatus(true);
    this.isMobileView = window.innerWidth <= 640;
    this.setMeta();
  }

  ngOnDestroy(): void {
    this.footerService.changeFooterStatus(false);
  }

  handleTitle($event: string) {
    this.seoTitle = $event;
    this.trySetMeta();
  }

  handlePreviewImage(img: string) {
    this.seoPreviewImage = img;
    this.trySetMeta();
  }

  trySetMeta() {
    if (this.seoTitle && this.seoPreviewImage) {
      this.setMeta();
    }
  }

  setMeta() {
    this.seoService.setTags(
      this.seoTitle,
      'Discover and join top developer communities on Commudle. Connect with peers, participate in events, hackathons, share knowledge & projects, and advance your career. Start building your network today!',
      this.seoPreviewImage ? this.seoPreviewImage : 'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }
}
