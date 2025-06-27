import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicPageFeatureCardComponent } from './public-page-feature-card.component';

describe('PublicPageFeatureCardComponent', () => {
  let component: PublicPageFeatureCardComponent;
  let fixture: ComponentFixture<PublicPageFeatureCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PublicPageFeatureCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicPageFeatureCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
