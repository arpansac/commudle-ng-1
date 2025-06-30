import { Component, OnDestroy, OnInit } from '@angular/core';
import { IFaq } from '@commudle/shared-models';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { IPreferredPartners } from 'apps/shared-models/preferred-partners.model';
import { ITestimonial } from 'apps/shared-models/testimonial.model';
import { CmsService } from 'apps/shared-services/cms.service';
import { SeoService } from 'apps/shared-services/seo.service';

@Component({
  selector: 'commudle-agencies',
  templateUrl: './agencies.component.html',
  styleUrls: ['./agencies.component.scss'],
})
export class AgenciesComponent implements OnInit, OnDestroy {
  staticAssets = staticAssets;
  headerImgUrl = staticAssets.agencies_header_image;
  stats: any[] = [
    {
      number: '107+k',
      name: 'Developers',
      description: 'Thousands of developers use Commudle to share knowledge, build recognition and find opportunities.',
    },
    {
      number: '250k',
      name: 'Community Roles',
      description:
        'From being an organizer at a developer community to participating as a member in multiple others, developers empower each other by sharing knowledge.',
    },
    {
      number: '5',
      name: 'Continents',
      description:
        "When we say diverse, we don't just mean location though, our users have vibrant technology backgrounds!",
    },
  ];

  faqs: IFaq[];

  testimonials: ITestimonial[];
  devrelAgenciesCommunities: IPreferredPartners[];
  eventManagementCommunities: IPreferredPartners[];
  vendorsCommunities: IPreferredPartners[];
  showFullDescriptionDevrelAgency: boolean[] = [];
  showFullDescriptionEventManagement: boolean[] = [];
  showFullDescriptionVendors: boolean[] = [];

  constructor(private footerService: FooterService, private seoService: SeoService, private cmsService: CmsService) {}

  ngOnInit(): void {
    this.footerService.changeFooterStatus(true);
    this.setMeta();
    this.getTestimonials();
    this.getDevrelAgenciesCommunities();
    this.getEventManagementCommunities();
    this.getVendorsCommunities();
    this.setFaqs();
  }

  ngOnDestroy() {
    this.footerService.changeFooterStatus(false);
  }

  setMeta(): void {
    this.seoService.setTags(
      'For DevRel Agencies',
      "Build developer programs using Commudle's developer focused engagement features. Host events, run forums & channels, send newsletters. All at one place!",
      this.headerImgUrl,
    );
  }

  getTestimonials() {
    this.cmsService
      .getDataByTypeWithFilter('publicTestimonials', 'testimonialType[]', 'Community_Leader', 10)
      .subscribe((data) => {
        if (data) {
          this.testimonials = data;
        }
      });
  }

  getDevrelAgenciesCommunities() {
    this.cmsService.getDataByTypeWithFilter('preferredPartners', 'category', 'devrel_agency', 10).subscribe((data) => {
      if (data) {
        this.devrelAgenciesCommunities = data;
      }
    });
  }

  getEventManagementCommunities() {
    this.cmsService
      .getDataByTypeWithFilter('preferredPartners', 'category', 'event_management_agency', 10)
      .subscribe((data) => {
        if (data) {
          this.eventManagementCommunities = data;
        }
      });
  }

  getVendorsCommunities() {
    this.cmsService.getDataByTypeWithFilter('preferredPartners', 'category', 'schwag_vendors', 10).subscribe((data) => {
      if (data) {
        this.vendorsCommunities = data;
      }
    });
  }

  imageUrl(source: any) {
    if (source) {
      return this.cmsService.getImageUrl(source);
    }
  }

  toggleShowFullDescriptionDevrelAgency(index: number): void {
    this.showFullDescriptionDevrelAgency[index] = !this.showFullDescriptionDevrelAgency[index];
  }

  toggleShowFullDescriptionEventManagement(index: number): void {
    this.showFullDescriptionEventManagement[index] = !this.showFullDescriptionEventManagement[index];
  }

  toggleShowFullDescriptionVendors(index: number): void {
    this.showFullDescriptionVendors[index] = !this.showFullDescriptionVendors[index];
  }

  setFaqs() {
    this.faqs = [
      {
        question: 'Can I create multiple organizations or business pages which have communities under them?',
        answer:
          'Yes, Commudle has the features for creating an umbrella of communities for different businesses you manage and each can have a separate page and communities under it. You can run multiple technology based, geography or any other classification based global communities on Commudle.',
      },
      {
        question: 'What is the subscription / payment model?',
        answer:
          'You can purchase annual community subscriptions for individual chapters or in bulk exclusively for your business clients.',
      },
      {
        question: 'Does Commudle have the option for custom dashboards and API’s?',
        answer:
          'Yes, we can create custom dashboards or API’s for you to integrate in your existing dashboards as per requirements. The charges for these can be a part of your subscription plan.',
      },
      {
        question: 'How do you ensure that my communities rank up on search engines?',
        answer:
          'All our pages with rich content are search engine optimized and we have dedicated experts who keep improving the strategy. Most of our existing active communities pages have top ranks on search engines.',
      },
      {
        question: 'How do you ensure data privacy of the users and my clients?',
        answer:
          'Commudle is GDPR compliant and ISO 27001 certified. We take data privacy very seriously and understand its importance for businesses and have placed consents at multiple points on the platform so that the users know how their data will be processed and who will have access to it.',
      },
    ];
  }
}
