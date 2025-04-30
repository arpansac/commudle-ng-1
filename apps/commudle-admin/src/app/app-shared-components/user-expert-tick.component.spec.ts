import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserExpertTickComponent } from './user-expert-tick.component';

describe('UserExpertTickComponent', () => {
  let component: UserExpertTickComponent;
  let fixture: ComponentFixture<UserExpertTickComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserExpertTickComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserExpertTickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
