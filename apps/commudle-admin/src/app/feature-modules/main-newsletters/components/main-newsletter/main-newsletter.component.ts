import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@commudle/shared-environments';
import { MainNewslettersService } from 'apps/commudle-admin/src/app/feature-modules/main-newsletters/services/main-newsletters.service';
import { IMainNewsletter } from 'apps/shared-models/main-newsletter.model';
import { SeoService } from 'apps/shared-services/seo.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-main-newsletter',
    templateUrl: './main-newsletter.component.html',
    styleUrls: ['./main-newsletter.component.scss'],
    standalone: false
})
export class MainNewsletterComponent implements OnInit, OnDestroy {
  mainNewsletter: IMainNewsletter;
  sanitizedContent: SafeHtml;

  subscriptions: Subscription[] = [];

  constructor(
    private mainNewslettersService: MainNewslettersService,
    private sanitizer: DomSanitizer,
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.activatedRoute.params.subscribe((data) => {
        if (data.main_newsletter_id) {
          this.getMainNewsletter(data.main_newsletter_id);
        }
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  getMainNewsletter(id) {
    this.mainNewslettersService.show(id).subscribe((data) => {
      this.mainNewsletter = data;
      let newsletterContent = data.content.replace(/utm_medium=email/g, 'utm_medium=webapp');
      newsletterContent = newsletterContent.replace(/utm_source=email/g, 'utm_source=webapp');
      this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(newsletterContent);
      this.setMeta();
      this.setSchema();
    });
  }

  setMeta(): void {
    this.seoService.setTags(
      this.mainNewsletter.title,
      this.mainNewsletter.email_subject,
      'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }

  setSchema() {
    const schemaForNewsletter = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: this.mainNewsletter.title,
      url: environment.app_url + '/newsletters/' + this.mainNewsletter.id,
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
      datePublished: this.mainNewsletter.created_at,
    };
    this.seoService.setSchema(schemaForNewsletter);
  }
}
