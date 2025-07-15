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
  }

  ngOnDestroy(): void {
    this.footerService.changeFooterStatus(false);
  }

  handleTitle(title: string) {
    this.seoTitle = title;
  }

  handlePreviewImage(img: string) {
    this.seoPreviewImage = img;
  }

  setMeta() {
    this.seoService.setTags(
      this.seoTitle,
      'Discover and join top developer communities on Commudle. Connect with peers, participate in events, hackathons, share knowledge & projects, and advance your career. Start building your network today!',
      this.seoPreviewImage ? this.seoPreviewImage : 'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }
}
