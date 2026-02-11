import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from '@commudle/shared-environments';
import { PublicNewslettersService } from 'apps/commudle-admin/src/app/feature-modules/public-newsletters/services/public-newsletters.service';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { IMainNewsletter } from 'apps/shared-models/main-newsletter.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-newsletter-list',
    templateUrl: './newsletter-list.component.html',
    styleUrls: ['./newsletter-list.component.scss'],
    standalone: false
})
export class NewsletterListComponent implements OnInit, OnDestroy {
  newsletters: IMainNewsletter[] = [];
  subscriptions: Subscription[] = [];
  schemaForNewsletter = [];
  headerImage;

  constructor(
    private publicNewslettersService: PublicNewslettersService,
    private seoService: SeoService,
    private footerService: FooterService,
  ) {}

  ngOnInit(): void {
    this.footerService.changeFooterStatus(true);
    this.getPublishedNewsletters();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.footerService.changeFooterStatus(false);
  }

  getPublishedNewsletters() {
    this.subscriptions.push(
      this.publicNewslettersService.publicIndex().subscribe((data) => {
        this.newsletters = data.main_newsletters;
        this.headerImage =
          this.newsletters[0].header_image?.url || 'https://commudle.com/assets/images/commudle-logo192.png';
        this.setMeta();
        this.setSchema();
      }),
    );
  }

  setMeta() {
    this.seoService.setTags(
      'Commudle IDE: Newsletters from the Community',
      'We publish every month from different activities, events, channels, projects, tutorials and more from the techies, developers & designers around you!',
      this.headerImage,
    );
  }

  setSchema() {
    for (const newsletter of this.newsletters) {
      this.schemaForNewsletter.push({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: newsletter.title,
        url: environment.app_url + '/newsletters/' + newsletter.id,
        image: newsletter.header_image?.url,
        author: {
          '@type': 'Organization',
          name: 'Commudle',
          url: 'https://www.commudle.com/',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Commudle',
          logo: {
            '@type': 'ImageObject',
            url: 'https://www.commudle.com/assets/images/commudle-logo-full.png',
          },
        },
        datePublished: newsletter.created_at,
      });
    }
    this.seoService.setSchema(this.schemaForNewsletter);
  }
}
