import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { SeoService } from '@commudle/shared-services';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { NbButtonModule } from '@commudle/theme';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

interface IAudienceStats {
  monthlyPageViews: number;
  techAudiencePercentage: number;
  averageSessionDuration: string;
  pagesPerVisit: number;
  topCountries: string[];
}

interface IAdFormat {
  id: string;
  name: string;
  placement: string;
}

interface ITargetingOption {
  category: 'technology' | 'geography' | 'interest' | 'behavior';
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

@Component({
  selector: 'commudle-page-ad-campaigns',
  standalone: true,
  imports: [CommonModule, SharedComponentsModule, NbButtonModule, FontAwesomeModule],
  templateUrl: './page-ad-campaigns.component.html',
  styleUrls: ['./page-ad-campaigns.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageAdCampaignsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('statCard1, statCard2, statCard3, statCard4') statCards!: QueryList<ElementRef>;

  private destroy$ = new Subject<void>();
  private observer: IntersectionObserver | null = null;
  private hasAnimated = false;
  private scrollTimeout: any = null;

  // Audience statistics data
  audienceStats: IAudienceStats = {
    monthlyPageViews: 500000,
    techAudiencePercentage: 100,
    averageSessionDuration: '4:32',
    pagesPerVisit: 3.8,
    topCountries: ['India', 'United States', 'United Kingdom', 'Germany', 'Canada'],
  };

  // Animated values for counter animation
  animatedStats = {
    monthlyPageViews: 0,
    techAudiencePercentage: 0,
    pagesPerVisit: 0,
  };

  // Ad placement types
  adFormats: IAdFormat[] = [
    {
      id: 'banner-top',
      name: 'Top Banner',
      placement: 'Top of every page',
    },
    {
      id: 'sidebar',
      name: 'Sidebar Ads',
      placement: 'Right sidebar',
    },
    {
      id: 'sponsored-content',
      name: 'Sponsored Content',
      placement: 'Within content feeds',
    },
    {
      id: 'newsletter',
      name: 'Newsletter',
      placement: 'Weekly email newsletter',
    },
    {
      id: 'event-pages',
      name: 'Event Pages',
      placement: 'Event detail pages',
    },
    {
      id: 'community-pages',
      name: 'Community Pages',
      placement: 'Community profiles',
    },
  ];

  // Targeting options data organized by category
  targetingOptions: ITargetingOption[] = [
    // Technology-based targeting
    {
      category: 'technology',
      name: 'JavaScript',
      description: 'Target developers working with JavaScript',
      icon: 'js',
      available: true,
    },
    {
      category: 'technology',
      name: 'Python',
      description: 'Target Python developers and data scientists',
      icon: 'python',
      available: true,
    },
    {
      category: 'technology',
      name: 'React',
      description: 'Target React and frontend developers',
      icon: 'react',
      available: true,
    },
    {
      category: 'technology',
      name: 'Node.js',
      description: 'Target backend developers using Node.js',
      icon: 'node',
      available: true,
    },
    {
      category: 'technology',
      name: 'Angular',
      description: 'Target Angular framework developers',
      icon: 'angular',
      available: true,
    },
    {
      category: 'technology',
      name: 'Docker',
      description: 'Target DevOps and containerization experts',
      icon: 'docker',
      available: true,
    },
    {
      category: 'technology',
      name: 'AWS',
      description: 'Target cloud infrastructure professionals',
      icon: 'aws',
      available: true,
    },
    {
      category: 'technology',
      name: 'Kubernetes',
      description: 'Target container orchestration specialists',
      icon: 'dharmachakra',
      available: true,
    },
    // Geographic targeting
    {
      category: 'geography',
      name: 'India',
      description: 'Target users in India',
      icon: 'globe-asia',
      available: true,
    },
    {
      category: 'geography',
      name: 'United States',
      description: 'Target users in the United States',
      icon: 'flag-usa',
      available: true,
    },
    {
      category: 'geography',
      name: 'Europe',
      description: 'Target users across European countries',
      icon: 'globe-europe',
      available: true,
    },
    {
      category: 'geography',
      name: 'Asia Pacific',
      description: 'Target users in Asia Pacific region',
      icon: 'globe',
      available: true,
    },
    // Interest-based targeting
    {
      category: 'interest',
      name: 'Web Development',
      description: 'Target users interested in web development',
      icon: 'laptop-code',
      available: true,
    },
    {
      category: 'interest',
      name: 'Mobile Development',
      description: 'Target mobile app developers',
      icon: 'mobile-alt',
      available: true,
    },
    {
      category: 'interest',
      name: 'DevOps',
      description: 'Target DevOps and infrastructure professionals',
      icon: 'server',
      available: true,
    },
    {
      category: 'interest',
      name: 'Data Science',
      description: 'Target data scientists and ML engineers',
      icon: 'chart-bar',
      available: true,
    },
    {
      category: 'interest',
      name: 'Cybersecurity',
      description: 'Target security professionals',
      icon: 'shield-alt',
      available: true,
    },
    {
      category: 'interest',
      name: 'Open Source',
      description: 'Target open source contributors',
      icon: 'code-branch',
      available: true,
    },
    // Behavior-based targeting
    {
      category: 'behavior',
      name: 'Active Contributors',
      description: 'Target highly engaged community members',
      icon: 'user-check',
      available: true,
    },
    {
      category: 'behavior',
      name: 'Event Attendees',
      description: 'Target users who attend tech events',
      icon: 'calendar-check',
      available: true,
    },
    {
      category: 'behavior',
      name: 'Job Seekers',
      description: 'Target users actively looking for opportunities',
      icon: 'briefcase',
      available: true,
    },
    {
      category: 'behavior',
      name: 'Content Creators',
      description: 'Target users who create and share content',
      icon: 'pen-fancy',
      available: true,
    },
  ];

  // Example targeting combinations
  targetingExamples = [
    {
      title: 'Frontend Developer Campaign',
      tags: ['React', 'JavaScript', 'Web Development', 'India'],
    },
    {
      title: 'DevOps Tool Promotion',
      tags: ['Docker', 'Kubernetes', 'AWS', 'Active Contributors'],
    },
    {
      title: 'Data Science Course',
      tags: ['Python', 'Data Science', 'United States', 'Job Seekers'],
    },
  ];

  constructor(
    private seoService: SeoService,
    private footerService: FooterService,
    private cdr: ChangeDetectorRef,
    private library: FaIconLibrary,
  ) {
    // Add FontAwesome icons
    this.library.addIconPacks(fas);
  }

  ngOnInit(): void {
    this.setPageMeta();
    this.setFooterVisibility();
    this.preloadCriticalFonts();
    this.loadAnalyticsAsync();
    this.deferNonCriticalCSS();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
    this.setupScrollOptimization();
  }

  private setFooterVisibility(): void {
    // Show the large footer
    this.footerService.changeFooterStatus(true);
    // Hide the mini footer
    this.footerService.changeMiniFooterStatus(false);
  }

  private setPageMeta(): void {
    // Set comprehensive SEO meta tags (Requirement 13.1)
    const title = 'Advertise on Commudle | Reach 500K+ Tech Professionals';
    const description =
      'Self-serve ad platform to reach 100% tech audience. 500,000+ monthly page views. Easy setup, real-time analytics, flexible targeting. Launch campaigns in minutes.';
    const image = 'https://commudle.com/assets/images/commudle-logo-192.png';
    const url = 'https://commudle.com/p/advertise';

    // Set title and basic meta tags
    this.seoService.setTitle(title);
    this.seoService.setTag('description', description);
    this.seoService.setTag(
      'keywords',
      'tech advertising, developer marketing, self-serve ads, tech audience, developer ads, tech community advertising, programming ads, software developer marketing',
    );

    // Set canonical URL (Requirement 13.1)
    this.seoService.setCanonical();

    // Set Open Graph tags for social media (Requirement 13.3)
    this.seoService.setTag('og:title', title);
    this.seoService.setTag('og:description', description);
    this.seoService.setTag('og:image', image);
    this.seoService.setTag('og:image:secure_url', image);
    this.seoService.setTag('og:type', 'website');
    this.seoService.setTag('og:url', url);
    this.seoService.setTag('og:site_name', 'Commudle');

    // Set Twitter Card tags (Requirement 13.3)
    this.seoService.setTag('twitter:card', 'summary_large_image');
    this.seoService.setTag('twitter:title', title);
    this.seoService.setTag('twitter:description', description);
    this.seoService.setTag('twitter:image', image);
    this.seoService.setTag('twitter:site', '@commudle');

    // Set additional meta tags for better SEO
    this.seoService.setTag('author', 'Commudle');
    this.seoService.setTag('viewport', 'width=device-width, initial-scale=1');
    this.seoService.setTag('theme-color', '#3366ff');

    // Set structured data for search engines (Requirement 13.2)
    this.seoService.setSchema(
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Commudle Advertising Platform',
        description: 'Self-serve advertising platform for reaching tech professionals',
        provider: {
          '@type': 'Organization',
          name: 'Commudle',
          url: 'https://commudle.com',
          logo: {
            '@type': 'ImageObject',
            url: 'https://commudle.com/assets/images/commudle-logo-192.png',
          },
          sameAs: [
            'https://twitter.com/commudle',
            'https://www.linkedin.com/company/commudle',
            'https://github.com/commudle',
          ],
        },
        audience: {
          '@type': 'Audience',
          audienceType: 'Technology Professionals',
          geographicArea: {
            '@type': 'Place',
            name: 'Global',
          },
        },
        url: url,
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          priceSpecification: {
            '@type': 'PriceSpecification',
            priceCurrency: 'USD',
            price: '0',
            description: 'No minimum spend required',
          },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '150',
        },
      },
      'structured-data',
    );

    // Add resource hints for performance optimization
    this.addResourceHints();
  }

  /**
   * Add resource hints (preconnect, dns-prefetch) for external resources
   */
  private addResourceHints(): void {
    if (typeof document === 'undefined') {
      return;
    }

    // Preconnect to external domains for faster resource loading
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      // Add other external domains as needed
    ];

    preconnectDomains.forEach((domain) => {
      // Add preconnect link
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = domain;
      preconnect.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect);

      // Add dns-prefetch as fallback
      const dnsPrefetch = document.createElement('link');
      dnsPrefetch.rel = 'dns-prefetch';
      dnsPrefetch.href = domain;
      document.head.appendChild(dnsPrefetch);
    });
  }

  /**
   * Set up intersection observer to trigger animations when stats section is visible
   * Uses IntersectionObserver which is more performant than scroll events
   */
  private setupIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.3, // Trigger when 30% of the section is visible
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.hasAnimated) {
          this.hasAnimated = true;
          this.animateCounters();
          this.animateCards();
        }
      });
    }, options);

    // Observe all stat cards
    this.statCards.forEach((card) => {
      this.observer?.observe(card.nativeElement);
    });
  }

  /**
   * Set up scroll optimization with debouncing
   * Debounces scroll events to improve performance
   */
  private setupScrollOptimization(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Use passive event listener for better scroll performance
    window.addEventListener(
      'scroll',
      () => {
        this.handleScrollDebounced();
      },
      { passive: true },
    );
  }

  /**
   * Debounced scroll handler to prevent excessive function calls
   */
  private handleScrollDebounced(): void {
    // Clear existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Set new timeout - debounce scroll events by 150ms
    this.scrollTimeout = setTimeout(() => {
      this.handleScroll();
    }, 150);
  }

  /**
   * Handle scroll events (debounced)
   * Add any scroll-based logic here
   */
  private handleScroll(): void {
    // Scroll-based logic can be added here
    // This is called after scroll events are debounced
    // Example: Update scroll progress, show/hide elements, etc.
  }

  /**
   * Animate the counter numbers with count-up effect
   */
  private animateCounters(): void {
    const duration = 2000; // 2 seconds
    const frameRate = 60; // 60 FPS
    const totalFrames = (duration / 1000) * frameRate;

    // Animate monthly page views
    this.animateValue(
      0,
      this.audienceStats.monthlyPageViews,
      totalFrames,
      (value) => {
        this.animatedStats.monthlyPageViews = Math.floor(value);
        this.cdr.markForCheck();
      },
      0, // No delay
    );

    // Animate tech audience percentage
    this.animateValue(
      0,
      this.audienceStats.techAudiencePercentage,
      totalFrames,
      (value) => {
        this.animatedStats.techAudiencePercentage = Math.floor(value);
        this.cdr.markForCheck();
      },
      200, // 200ms delay
    );

    // Animate pages per visit
    this.animateValue(
      0,
      this.audienceStats.pagesPerVisit,
      totalFrames,
      (value) => {
        this.animatedStats.pagesPerVisit = value;
        this.cdr.markForCheck();
      },
      400, // 400ms delay
    );
  }

  /**
   * Generic function to animate a value from start to end
   */
  private animateValue(
    start: number,
    end: number,
    totalFrames: number,
    callback: (value: number) => void,
    delay = 0,
  ): void {
    setTimeout(() => {
      let currentFrame = 0;
      const increment = (end - start) / totalFrames;

      const animate = () => {
        currentFrame++;
        const value = start + increment * currentFrame;

        if (currentFrame < totalFrames) {
          callback(value);
          requestAnimationFrame(animate);
        } else {
          callback(end);
        }
      };

      requestAnimationFrame(animate);
    }, delay);
  }

  /**
   * Add stagger animation to stat cards
   */
  private animateCards(): void {
    this.statCards.forEach((card, index) => {
      setTimeout(() => {
        card.nativeElement.classList.add('animate-in');
      }, index * 150); // 150ms stagger between cards
    });
  }

  /**
   * Get targeting options by category
   */
  getTargetingByCategory(category: 'technology' | 'geography' | 'interest' | 'behavior'): ITargetingOption[] {
    return this.targetingOptions.filter((option) => option.category === category);
  }

  /**
   * Defer loading of non-critical CSS to improve initial page load
   */
  private deferNonCriticalCSS(): void {
    // Load non-critical CSS after initial render
    if (typeof window !== 'undefined') {
      // Use requestAnimationFrame to defer until after paint
      requestAnimationFrame(() => {
        // Non-critical styles are already loaded via component styleUrls
        // This method is a placeholder for future non-critical CSS loading
        // Example: Load below-the-fold section styles, animation styles, etc.
      });
    }
  }

  /**
   * Preload critical fonts to improve initial render performance
   */
  private preloadCriticalFonts(): void {
    // Preload critical fonts used in hero section and headings
    const fonts = [
      // Add your critical font URLs here
      // Example: '/assets/fonts/roboto-bold.woff2'
    ];

    fonts.forEach((fontUrl) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = fontUrl;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  /**
   * Load analytics scripts asynchronously to prevent blocking
   */
  private loadAnalyticsAsync(): void {
    // Defer analytics loading until after initial page load
    if (typeof window !== 'undefined') {
      // Use requestIdleCallback if available, otherwise setTimeout
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          this.initializeAnalytics();
        });
      } else {
        setTimeout(() => {
          this.initializeAnalytics();
        }, 1000);
      }
    }
  }

  /**
   * Initialize analytics tracking
   */
  private initializeAnalytics(): void {
    // Analytics initialization code would go here
    // This is loaded asynchronously to not block initial page render
    // Example: Load Google Analytics, Mixpanel, etc.
  }

  ngOnDestroy(): void {
    // Disconnect intersection observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // Clear scroll timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.destroy$.next();
    this.destroy$.complete();
  }
}
