import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageCommudleVsCompetitorComponent } from './page-commudle-vs-competitor.component';
import { SeoService } from '@commudle/shared-services';

describe('PageCommudleVsCompetitorComponent', () => {
  let component: PageCommudleVsCompetitorComponent;
  let fixture: ComponentFixture<PageCommudleVsCompetitorComponent>;
  let seoService: any;

  beforeEach(async () => {
    const seoServiceSpy = jasmine.createSpyObj('SeoService', ['setTags', 'setSchema']);

    await TestBed.configureTestingModule({
      imports: [PageCommudleVsCompetitorComponent],
      providers: [{ provide: SeoService, useValue: seoServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(PageCommudleVsCompetitorComponent);
    component = fixture.componentInstance;
    seoService = TestBed.inject(SeoService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set SEO meta tags on init', () => {
    fixture.detectChanges();

    expect(seoService.setTags).toHaveBeenCalledWith(
      'Commudle vs Competitors - Feature Comparison | Commudle',
      'Compare Commudle with other community management platforms. Discover why Commudle is the best choice for building and managing tech communities.',
      'https://commudle.com/assets/images/commudle-logo-192.png',
      'website',
    );
  });

  it('should set structured data on init', () => {
    fixture.detectChanges();

    expect(seoService.setSchema).toHaveBeenCalledWith(
      jasmine.objectContaining({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Commudle vs Competitors',
      }),
    );
  });

  it('should cleanup on destroy', () => {
    const destroySpy = spyOn<any>(component['destroy$'], 'next');
    const completeSpy = spyOn<any>(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
