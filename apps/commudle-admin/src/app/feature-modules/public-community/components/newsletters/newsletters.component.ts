import { Component, OnInit } from '@angular/core';
import { INewsletter } from 'apps/shared-models/newsletter.model';
import { NewsletterService } from 'apps/commudle-admin/src/app/services/newsletter.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ICommunity } from '@commudle/shared-models';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { SeoService } from '@commudle/shared-services';
import { environment } from '@commudle/shared-environments';
@Component({
  selector: 'commudle-newsletters',
  templateUrl: './newsletters.component.html',
  styleUrls: ['./newsletters.component.scss'],
})
export class NewslettersComponent implements OnInit {
  subscriptions: Subscription[] = [];
  newsletters: INewsletter[];
  community: ICommunity;
  schemaForNewsletter = [];

  constructor(
    private newsletterService: NewsletterService,
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.activatedRoute.parent.parent.data.subscribe((data) => {
        this.community = data.community;
        this.getNewsletters();
      }),
    );
  }

  getNewsletters() {
    this.subscriptions.push(
      this.newsletterService.getPIndex(this.community.id, 'Kommunity').subscribe((data) => {
        this.newsletters = data;
        this.setMeta();
        this.setSchema();
      }),
    );
  }

  setMeta() {
    this.seoService.setTags(
      `Newsletters - ${this.community.name}`,
      this.newsletters.length > 0
        ? `Read ${this.community.name} newsletters, the latest one is ${this.newsletters[0].title}`
        : 'No newsletters to show right now',
      'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }

  setSchema() {
    for (const newsletter of this.newsletters) {
      this.schemaForNewsletter.push({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: newsletter.title,
        url: environment.app_url + '/communities' + this.community.slug + 'newsletters' + newsletter.slug,
        image: newsletter.banner_image?.url,
        author: {
          '@type': 'Organization',
          name: 'Commudle',
          url: 'https://www.commudle.com/',
        },
        publisher: {
          '@type': 'Organization',
          name: this.community.name,
          logo: {
            '@type': 'ImageObject',
            url: this.community.logo_image_path.i64,
          },
        },
        datePublished: newsletter.created_at,
      });
    }
    this.seoService.setSchema(this.schemaForNewsletter);
  }
}
