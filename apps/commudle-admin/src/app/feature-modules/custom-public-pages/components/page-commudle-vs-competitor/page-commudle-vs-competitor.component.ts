import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { SeoService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-page-commudle-vs-competitor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-commudle-vs-competitor.component.html',
  styleUrls: ['./page-commudle-vs-competitor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageCommudleVsCompetitorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.setPageMeta();
  }

  private setPageMeta(): void {
    // Set comprehensive SEO meta tags
    this.seoService.setTags(
      'Commudle vs Competitors - Feature Comparison | Commudle',
      'Compare Commudle with other community management platforms. Discover why Commudle is the best choice for building and managing tech communities.',
      'https://commudle.com/assets/images/commudle-logo-192.png',
      'website',
    );

    // Set structured data for search engines
    this.seoService.setSchema({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Commudle vs Competitors',
      description:
        'Compare Commudle with other community management platforms. Discover why Commudle is the best choice for building and managing tech communities.',
      url: 'https://commudle.com/p/commudle-vs-competitor',
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
