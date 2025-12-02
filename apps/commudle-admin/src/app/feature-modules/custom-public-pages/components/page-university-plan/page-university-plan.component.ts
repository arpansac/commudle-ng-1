import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { SeoService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-page-university-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-university-plan.component.html',
  styleUrls: ['./page-university-plan.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageUniversityPlanComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.setPageMeta();
  }

  private setPageMeta(): void {
    // Set comprehensive SEO meta tags
    this.seoService.setTags(
      'University Plan - Special Pricing for Educational Institutions | Commudle',
      "Discover Commudle's special university plan with exclusive pricing and features designed for educational institutions. Empower your students and faculty with the best community management platform.",
      'https://commudle.com/assets/images/commudle-logo-192.png',
      'website',
    );

    // Set structured data for search engines
    this.seoService.setSchema({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'University Plan',
      description:
        "Discover Commudle's special university plan with exclusive pricing and features designed for educational institutions.",
      url: 'https://commudle.com/p/university-plan',
      publisher: {
        '@type': 'Organization',
        name: 'Commudle',
        logo: {
          '@type': 'ImageObject',
          url: 'https://commudle.com/assets/images/commudle-logo-192.png',
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
