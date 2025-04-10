import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturedBuildsComponent } from './featured-builds.component';

describe('FeaturedBuildsComponent', () => {
  let component: FeaturedBuildsComponent;
  let fixture: ComponentFixture<FeaturedBuildsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedBuildsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturedBuildsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
