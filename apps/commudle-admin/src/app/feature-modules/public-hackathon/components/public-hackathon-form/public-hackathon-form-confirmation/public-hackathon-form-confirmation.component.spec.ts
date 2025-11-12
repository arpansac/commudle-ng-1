import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicHackathonFormConfirmationComponent } from './public-hackathon-form-confirmation.component';

describe('PublicHackathonFormConfirmationComponent', () => {
  let component: PublicHackathonFormConfirmationComponent;
  let fixture: ComponentFixture<PublicHackathonFormConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicHackathonFormConfirmationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicHackathonFormConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
