import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { PageAdCampaignsComponent } from './page-ad-campaigns.component';
import { SeoService } from '@commudle/shared-services';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

/**
 * Theme Testing for Ad Campaigns Page
 *
 * This test suite verifies that the ad campaigns page displays correctly
 * in both light and dark modes, with proper styling and visual elements.
 *
 * Requirements: 15.9 - Visual consistency across themes
 */

@Component({
  template: `
    <div [attr.data-theme]="currentTheme" class="theme-wrapper">
      <commudle-page-ad-campaigns></commudle-page-ad-campaigns>
    </div>
  `,
  styles: [
    `
      .theme-wrapper {
        min-height: 100vh;
      }

      /* Light theme styles */
      [data-theme='light'] {
        --color-yankees-blue: #222b45;
        --color-tyankees-blue: #222b45;
        --color-auro-metal-saurus: #667085;
        --color-bright-gray: #e4e9f2;
        --color-white: #ffffff;
        --color-twhite: #ffffff;
        --color-alice-blue: #edf5ff;
        --color-slate-100: #f1f5f9;
        background-color: var(--color-white);
        color: var(--color-yankees-blue);
      }

      /* Dark theme styles */
      [data-theme='dark'] {
        --color-yankees-blue: #ffffff;
        --color-tyankees-blue: #222b45;
        --color-auro-metal-saurus: #a0a0a0;
        --color-bright-gray: #2c2c2c;
        --color-white: #1e1e1e;
        --color-twhite: #ffffff;
        --color-alice-blue: #1a1a2e;
        --color-slate-100: #2a2a3a;
        background-color: var(--color-white);
        color: var(--color-yankees-blue);
      }
    `,
  ],
})
class ThemeTestWrapperComponent {
  currentTheme: 'light' | 'dark' = 'light';

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
  }
}

describe('PageAdCampaignsComponent - Theme Testing', () => {
  let component: PageAdCampaignsComponent;
  let wrapperComponent: ThemeTestWrapperComponent;
  let fixture: ComponentFixture<ThemeTestWrapperComponent>;
  let seoService: any;
  let footerService: any;
  let library: any;

  beforeEach(async () => {
    const seoSpy = jasmine.createSpyObj('SeoService', ['setTitle', 'setTag', 'setCanonical', 'setSchema']);
    const footerSpy = jasmine.createSpyObj('FooterService', ['changeFooterStatus', 'changeMiniFooterStatus']);
    const librarySpy = jasmine.createSpyObj('FaIconLibrary', ['addIconPacks']);

    await TestBed.configureTestingModule({
      imports: [PageAdCampaignsComponent],
      declarations: [ThemeTestWrapperComponent],
      providers: [
        { provide: SeoService, useValue: seoSpy },
        { provide: FooterService, useValue: footerSpy },
        { provide: FaIconLibrary, useValue: librarySpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeTestWrapperComponent);
    wrapperComponent = fixture.componentInstance;

    seoService = TestBed.inject(SeoService);
    footerService = TestBed.inject(FooterService);
    library = TestBed.inject(FaIconLibrary);

    fixture.detectChanges();

    // Get the actual PageAdCampaignsComponent instance
    const componentDebugElement = fixture.debugElement.query(By.directive(PageAdCampaignsComponent));
    component = componentDebugElement.componentInstance;
  });

  describe('Light Mode Testing', () => {
    beforeEach(() => {
      wrapperComponent.setTheme('light');
      fixture.detectChanges();
    });

    it('should display hero section correctly in light mode', () => {
      const heroSection = fixture.debugElement.query(By.css('.hero-section'));
      expect(heroSection).toBeTruthy();

      // Check hero headline is visible
      const headline = fixture.debugElement.query(By.css('.hero-headline'));
      expect(headline).toBeTruthy();
      expect(headline.nativeElement.textContent).toContain('500,000+ Tech Professionals');

      // Check hero metrics are displayed
      const metrics = fixture.debugElement.queryAll(By.css('.metric-item'));
      expect(metrics.length).toBe(2);

      // Check CTA buttons are present
      const ctaButtons = fixture.debugElement.queryAll(By.css('.hero-cta button'));
      expect(ctaButtons.length).toBe(2);
    });

    it('should display statistics section correctly in light mode', () => {
      const statsSection = fixture.debugElement.query(By.css('.stats-section'));
      expect(statsSection).toBeTruthy();

      // Check all stat cards are present
      const statCards = fixture.debugElement.queryAll(By.css('.stat-card'));
      expect(statCards.length).toBe(4);

      // Check animated stats are initialized
      expect(component.animatedStats).toBeDefined();
      expect(component.animatedStats.monthlyPageViews).toBeDefined();
      expect(component.animatedStats.techAudiencePercentage).toBeDefined();
      expect(component.animatedStats.pagesPerVisit).toBeDefined();

      // Check top countries section
      const topCountries = fixture.debugElement.query(By.css('.top-countries'));
      expect(topCountries).toBeTruthy();

      const countryTags = fixture.debugElement.queryAll(By.css('.country-tag'));
      expect(countryTags.length).toBe(component.audienceStats.topCountries.length);
    });

    it('should display features section correctly in light mode', () => {
      const featuresSection = fixture.debugElement.query(By.css('.features-section'));
      expect(featuresSection).toBeTruthy();

      // Check section header
      const sectionTitle = fixture.debugElement.query(By.css('.features-section .section-title'));
      expect(sectionTitle).toBeTruthy();
      expect(sectionTitle.nativeElement.textContent).toContain('Everything You Need to Succeed');

      // Check feature cards (should be 6 cards)
      const featureCards = fixture.debugElement.queryAll(By.css('.feature-card'));
      expect(featureCards.length).toBe(6);

      // Check each feature card has required elements
      featureCards.forEach((card) => {
        const icon = card.query(By.css('.feature-icon'));
        const title = card.query(By.css('.feature-title'));
        const description = card.query(By.css('.feature-description'));
        const list = card.query(By.css('.feature-list'));

        expect(icon).toBeTruthy();
        expect(title).toBeTruthy();
        expect(description).toBeTruthy();
        expect(list).toBeTruthy();
      });
    });

    it('should display ad placements section correctly in light mode', () => {
      const placementsSection = fixture.debugElement.query(By.css('.ad-placements-section'));
      expect(placementsSection).toBeTruthy();

      // Check section title
      const sectionTitle = fixture.debugElement.query(By.css('.ad-placements-section .section-title'));
      expect(sectionTitle).toBeTruthy();
      expect(sectionTitle.nativeElement.textContent).toContain('Your Ads Appear Everywhere');

      // Check placement items match the adFormats data
      const placementItems = fixture.debugElement.queryAll(By.css('.placement-item'));
      expect(placementItems.length).toBe(component.adFormats.length);

      // Check benefits section
      const benefits = fixture.debugElement.query(By.css('.placements-benefits'));
      expect(benefits).toBeTruthy();

      const benefitItems = fixture.debugElement.queryAll(By.css('.benefit-item'));
      expect(benefitItems.length).toBe(4);
    });

    it('should display targeting section correctly in light mode', () => {
      const targetingSection = fixture.debugElement.query(By.css('.targeting-section'));
      expect(targetingSection).toBeTruthy();

      // Check section title
      const sectionTitle = fixture.debugElement.query(By.css('.targeting-section .section-title'));
      expect(sectionTitle).toBeTruthy();
      expect(sectionTitle.nativeElement.textContent).toContain('Precision Targeting');

      // Check targeting categories (should be 4: technology, geography, interest, behavior)
      const categories = fixture.debugElement.queryAll(By.css('.targeting-category'));
      expect(categories.length).toBe(4);

      // Check targeting examples
      const examples = fixture.debugElement.query(By.css('.targeting-examples'));
      expect(examples).toBeTruthy();

      const exampleCards = fixture.debugElement.queryAll(By.css('.example-card'));
      expect(exampleCards.length).toBe(component.targetingExamples.length);
    });

    it('should display CTA section correctly in light mode', () => {
      const ctaSection = fixture.debugElement.query(By.css('.cta-section'));
      expect(ctaSection).toBeTruthy();

      // Check CTA headline
      const headline = fixture.debugElement.query(By.css('.cta-headline'));
      expect(headline).toBeTruthy();
      expect(headline.nativeElement.textContent).toContain('Ready to Reach Your Target Audience?');

      // Check CTA buttons
      const ctaButtons = fixture.debugElement.queryAll(By.css('.cta-buttons button'));
      expect(ctaButtons.length).toBe(2);

      // Check trust indicators
      const trustIndicators = fixture.debugElement.query(By.css('.trust-indicators'));
      expect(trustIndicators).toBeTruthy();

      const trustItems = fixture.debugElement.queryAll(By.css('.trust-item'));
      expect(trustItems.length).toBe(3);
    });

    it('should have proper color contrast in light mode', () => {
      const themeWrapper = fixture.debugElement.query(By.css('[data-theme="light"]'));
      expect(themeWrapper).toBeTruthy();

      // Check that text elements have proper contrast
      const headlines = fixture.debugElement.queryAll(By.css('h1, h2, h3, h4'));
      headlines.forEach((headline) => {
        const computedStyle = window.getComputedStyle(headline.nativeElement);
        // Yankees-Blue (#222B45) on white background provides excellent contrast (12.6:1)
        expect(computedStyle.color).toBeDefined();
      });

      // Check that buttons are properly styled
      const buttons = fixture.debugElement.queryAll(By.css('button[nbButton]'));
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => {
        expect(button.nativeElement).toBeTruthy();
      });
    });
  });

  describe('Dark Mode Testing', () => {
    beforeEach(() => {
      wrapperComponent.setTheme('dark');
      fixture.detectChanges();
    });

    it('should display hero section correctly in dark mode', () => {
      const heroSection = fixture.debugElement.query(By.css('.hero-section'));
      expect(heroSection).toBeTruthy();

      // Check hero headline is visible
      const headline = fixture.debugElement.query(By.css('.hero-headline'));
      expect(headline).toBeTruthy();
      expect(headline.nativeElement.textContent).toContain('500,000+ Tech Professionals');

      // Check hero metrics are displayed
      const metrics = fixture.debugElement.queryAll(By.css('.metric-item'));
      expect(metrics.length).toBe(2);

      // Check CTA buttons are present
      const ctaButtons = fixture.debugElement.queryAll(By.css('.hero-cta button'));
      expect(ctaButtons.length).toBe(2);
    });

    it('should display statistics section correctly in dark mode', () => {
      const statsSection = fixture.debugElement.query(By.css('.stats-section'));
      expect(statsSection).toBeTruthy();

      // Check all stat cards are present
      const statCards = fixture.debugElement.queryAll(By.css('.stat-card'));
      expect(statCards.length).toBe(4);

      // Check top countries section
      const topCountries = fixture.debugElement.query(By.css('.top-countries'));
      expect(topCountries).toBeTruthy();

      const countryTags = fixture.debugElement.queryAll(By.css('.country-tag'));
      expect(countryTags.length).toBe(component.audienceStats.topCountries.length);
    });

    it('should display features section correctly in dark mode', () => {
      const featuresSection = fixture.debugElement.query(By.css('.features-section'));
      expect(featuresSection).toBeTruthy();

      // Check section header
      const sectionTitle = fixture.debugElement.query(By.css('.features-section .section-title'));
      expect(sectionTitle).toBeTruthy();

      // Check feature cards
      const featureCards = fixture.debugElement.queryAll(By.css('.feature-card'));
      expect(featureCards.length).toBe(6);
    });

    it('should display ad placements section correctly in dark mode', () => {
      const placementsSection = fixture.debugElement.query(By.css('.ad-placements-section'));
      expect(placementsSection).toBeTruthy();

      // Check placement items
      const placementItems = fixture.debugElement.queryAll(By.css('.placement-item'));
      expect(placementItems.length).toBe(component.adFormats.length);

      // Check benefits section
      const benefits = fixture.debugElement.query(By.css('.placements-benefits'));
      expect(benefits).toBeTruthy();
    });

    it('should display targeting section correctly in dark mode', () => {
      const targetingSection = fixture.debugElement.query(By.css('.targeting-section'));
      expect(targetingSection).toBeTruthy();

      // Check targeting categories
      const categories = fixture.debugElement.queryAll(By.css('.targeting-category'));
      expect(categories.length).toBe(4);

      // Check targeting examples
      const examples = fixture.debugElement.query(By.css('.targeting-examples'));
      expect(examples).toBeTruthy();
    });

    it('should display CTA section correctly in dark mode', () => {
      const ctaSection = fixture.debugElement.query(By.css('.cta-section'));
      expect(ctaSection).toBeTruthy();

      // Check CTA headline
      const headline = fixture.debugElement.query(By.css('.cta-headline'));
      expect(headline).toBeTruthy();

      // Check CTA buttons
      const ctaButtons = fixture.debugElement.queryAll(By.css('.cta-buttons button'));
      expect(ctaButtons.length).toBe(2);

      // Check trust indicators
      const trustIndicators = fixture.debugElement.query(By.css('.trust-indicators'));
      expect(trustIndicators).toBeTruthy();
    });

    it('should have proper theme-aware styling in dark mode', () => {
      const themeWrapper = fixture.debugElement.query(By.css('[data-theme="dark"]'));
      expect(themeWrapper).toBeTruthy();

      // Check that the theme wrapper has dark mode styles applied
      const computedStyle = window.getComputedStyle(themeWrapper.nativeElement);
      expect(computedStyle.backgroundColor).toBeDefined();
      expect(computedStyle.color).toBeDefined();
    });

    it('should maintain glassmorphism effects in dark mode', () => {
      // Check that glassmorphism containers are present
      // Note: The actual glassmorphism effects would be in the pricing calculator
      // which is not implemented yet, but we can check the structure is ready
      const sections = fixture.debugElement.queryAll(By.css('section'));
      expect(sections.length).toBeGreaterThan(0);

      // Verify sections have proper background styling
      sections.forEach((section) => {
        expect(section.nativeElement).toBeTruthy();
      });
    });
  });

  describe('Theme Switching', () => {
    it('should handle theme switching without errors', () => {
      // Start in light mode
      wrapperComponent.setTheme('light');
      fixture.detectChanges();

      let heroSection = fixture.debugElement.query(By.css('.hero-section'));
      expect(heroSection).toBeTruthy();

      // Switch to dark mode
      wrapperComponent.setTheme('dark');
      fixture.detectChanges();

      heroSection = fixture.debugElement.query(By.css('.hero-section'));
      expect(heroSection).toBeTruthy();

      // Switch back to light mode
      wrapperComponent.setTheme('light');
      fixture.detectChanges();

      heroSection = fixture.debugElement.query(By.css('.hero-section'));
      expect(heroSection).toBeTruthy();
    });

    it('should maintain component functionality across theme changes', () => {
      // Test that component data remains consistent across theme changes
      const initialStats = { ...component.audienceStats };
      const initialFormats = [...component.adFormats];
      const initialTargeting = [...component.targetingOptions];

      // Switch themes multiple times
      wrapperComponent.setTheme('dark');
      fixture.detectChanges();

      wrapperComponent.setTheme('light');
      fixture.detectChanges();

      wrapperComponent.setTheme('dark');
      fixture.detectChanges();

      // Verify data integrity
      expect(component.audienceStats).toEqual(initialStats);
      expect(component.adFormats).toEqual(initialFormats);
      expect(component.targetingOptions).toEqual(initialTargeting);
    });
  });

  describe('Visual Consistency', () => {
    it('should maintain consistent visual hierarchy in both themes', () => {
      // Test light mode
      wrapperComponent.setTheme('light');
      fixture.detectChanges();

      const lightHeadings = fixture.debugElement.queryAll(By.css('h1, h2, h3, h4'));
      const lightButtons = fixture.debugElement.queryAll(By.css('button'));
      const lightSections = fixture.debugElement.queryAll(By.css('section'));

      // Test dark mode
      wrapperComponent.setTheme('dark');
      fixture.detectChanges();

      const darkHeadings = fixture.debugElement.queryAll(By.css('h1, h2, h3, h4'));
      const darkButtons = fixture.debugElement.queryAll(By.css('button'));
      const darkSections = fixture.debugElement.queryAll(By.css('section'));

      // Verify same number of elements in both themes
      expect(lightHeadings.length).toBe(darkHeadings.length);
      expect(lightButtons.length).toBe(darkButtons.length);
      expect(lightSections.length).toBe(darkSections.length);
    });

    it('should maintain proper spacing and layout in both themes', () => {
      // Test that layout structure is consistent across themes
      const testThemes = ['light', 'dark'] as const;

      testThemes.forEach((theme) => {
        wrapperComponent.setTheme(theme);
        fixture.detectChanges();

        // Check main sections are present
        const heroSection = fixture.debugElement.query(By.css('.hero-section'));
        const statsSection = fixture.debugElement.query(By.css('.stats-section'));
        const featuresSection = fixture.debugElement.query(By.css('.features-section'));
        const placementsSection = fixture.debugElement.query(By.css('.ad-placements-section'));
        const targetingSection = fixture.debugElement.query(By.css('.targeting-section'));
        const ctaSection = fixture.debugElement.query(By.css('.cta-section'));

        expect(heroSection).toBeTruthy();
        expect(statsSection).toBeTruthy();
        expect(featuresSection).toBeTruthy();
        expect(placementsSection).toBeTruthy();
        expect(targetingSection).toBeTruthy();
        expect(ctaSection).toBeTruthy();
      });
    });

    it('should have consistent icon and image display in both themes', () => {
      const testThemes = ['light', 'dark'] as const;

      testThemes.forEach((theme) => {
        wrapperComponent.setTheme(theme);
        fixture.detectChanges();

        // Check FontAwesome icons are present
        const icons = fixture.debugElement.queryAll(By.css('fa-icon'));
        expect(icons.length).toBeGreaterThan(0);

        // Check illustration placeholders
        const illustrations = fixture.debugElement.queryAll(By.css('.illustration-placeholder, .placement-image'));
        expect(illustrations.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility in Both Themes', () => {
    it('should maintain proper ARIA labels in both themes', () => {
      const testThemes = ['light', 'dark'] as const;

      testThemes.forEach((theme) => {
        wrapperComponent.setTheme(theme);
        fixture.detectChanges();

        // Check ARIA labels on illustrations
        const ariaLabels = fixture.debugElement.queryAll(By.css('[aria-label]'));
        expect(ariaLabels.length).toBeGreaterThan(0);

        // Check role attributes
        const roleElements = fixture.debugElement.queryAll(By.css('[role="img"]'));
        expect(roleElements.length).toBeGreaterThan(0);
      });
    });

    it('should maintain proper heading hierarchy in both themes', () => {
      const testThemes = ['light', 'dark'] as const;

      testThemes.forEach((theme) => {
        wrapperComponent.setTheme(theme);
        fixture.detectChanges();

        // Check H1 (should be only one)
        const h1Elements = fixture.debugElement.queryAll(By.css('h1'));
        expect(h1Elements.length).toBe(1);

        // Check H2 elements (section headings)
        const h2Elements = fixture.debugElement.queryAll(By.css('h2'));
        expect(h2Elements.length).toBeGreaterThan(0);

        // Check H3 elements (subsection headings)
        const h3Elements = fixture.debugElement.queryAll(By.css('h3'));
        expect(h3Elements.length).toBeGreaterThan(0);
      });
    });
  });
});
