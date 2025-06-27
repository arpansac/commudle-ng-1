import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesIndexComponent } from './features-index.component';

describe('FeaturesIndexComponent', () => {
  let component: FeaturesIndexComponent;
  let fixture: ComponentFixture<FeaturesIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeaturesIndexComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturesIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
