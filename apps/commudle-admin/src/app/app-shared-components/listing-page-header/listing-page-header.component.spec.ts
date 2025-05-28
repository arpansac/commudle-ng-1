import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListingPageHeaderComponent } from './listing-page-header.component';

describe('ListingPageHeaderComponent', () => {
  let component: ListingPageHeaderComponent;
  let fixture: ComponentFixture<ListingPageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingPageHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListingPageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
