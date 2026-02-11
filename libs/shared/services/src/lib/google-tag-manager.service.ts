import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { SeoService } from './seo.service';

declare global {
  interface Window {
    dataLayer: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class GoogleTagManagerService {
  host: string;
  private readonly isBrowser: boolean;

  constructor(
    private seoService: SeoService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.host = this.isBrowser ? window.location.hostname : '';
  }

  dataLayerPushEvent(event: string, data: any) {
    if (!this.isBrowser) {
      return;
    }

    data.event = event;
    if (!this.seoService.isBot && !['localhost', 'test.commudle.com'].includes(this.host)) {
      if (window.dataLayer) {
        window.dataLayer.push(data);
      }
    }
  }
}
