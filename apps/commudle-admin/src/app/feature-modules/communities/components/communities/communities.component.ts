import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { SeoService } from '@commudle/shared-services';

@Component({
    selector: 'commudle-communities',
    templateUrl: './communities.component.html',
    styleUrls: ['./communities.component.scss'],
    standalone: false
})
export class CommunitiesComponent implements OnInit, OnDestroy {
  isMobileView: boolean;
  seoTitle: string;
  seoPreviewImage: string;
  private isBrowser: boolean;

  constructor(
    private footerService: FooterService,
    private seoService: SeoService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.footerService.changeFooterStatus(true);
    // SSR-safe: window is not available on the server.
    this.isMobileView = this.isBrowser ? window.innerWidth <= 640 : false;
    this.setMeta();
  }

  ngOnDestroy(): void {
    this.footerService.changeFooterStatus(false);
  }

  onSeoTitleChange($event: string) {
    this.seoTitle = $event;
    this.setMeta();
  }

  onSeoPreviewImageRetrieved(img: string) {
    this.seoPreviewImage = img;
    this.setMeta();
  }

  setMeta() {
    this.seoService.setTags(
      this.seoTitle ? this.seoTitle : 'Developer Communities',
      'Discover and join top developer communities on Commudle. Connect with peers, participate in events, hackathons, share knowledge & projects, and advance your career. Start building your network today!',
      this.seoPreviewImage ? this.seoPreviewImage : 'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }
}
