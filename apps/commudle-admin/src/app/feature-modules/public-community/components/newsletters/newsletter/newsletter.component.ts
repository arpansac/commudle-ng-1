import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICommunity } from '@commudle/shared-models';
import { NewsletterService } from 'apps/commudle-admin/src/app/services/newsletter.service';
import { INewsletter } from 'apps/shared-models/newsletter.model';
import { SeoService } from '@commudle/shared-services';
import { environment } from '@commudle/shared-environments';

@Component({
    selector: 'commudle-newsletter',
    templateUrl: './newsletter.component.html',
    styleUrls: ['./newsletter.component.scss'],
    standalone: false
})
export class NewsletterComponent implements OnInit {
  newsletter: INewsletter;
  community: ICommunity;
  constructor(
    private activatedRoute: ActivatedRoute,
    private newsletterService: NewsletterService,
    private seoService: SeoService,
  ) {}

  ngOnInit() {
    const pageSlug = this.activatedRoute.snapshot.params['newsletter_slug'];
    this.activatedRoute.parent.parent.data.subscribe((data) => {
      this.community = data.community;
      this.getNewsletter(pageSlug, data.community.id);
    });
  }

  getNewsletter(slug, parentId) {
    this.newsletterService.getPShow(slug, parentId, 'Kommunity').subscribe((data) => {
      this.newsletter = data;
      this.setMeta();
      this.setSchema();
    });
  }

  setMeta() {
    this.seoService.setTags(
      this.newsletter.title,
      this.newsletter.brief_description,
      'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }

  setSchema() {
    const schemaForNewsletter = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: this.newsletter.title,
      url: environment.app_url + '/newsletters/' + this.newsletter.id,
      author: {
        '@type': 'Organization',
        name: this.community.name,
        url: environment.app_url + '/communities/' + this.community.slug,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Commudle',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.commudle.com/assets/images/commudle-logo-full.png',
        },
      },
      datePublished: this.newsletter.created_at,
    };
    this.seoService.setSchema(schemaForNewsletter);
  }
}
