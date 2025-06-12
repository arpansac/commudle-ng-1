import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileCompletionProgressComponent } from './profile-completion-progress.component';

describe('ProfileCompletionProgressComponent', () => {
  let component: ProfileCompletionProgressComponent;
  let fixture: ComponentFixture<ProfileCompletionProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileCompletionProgressComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileCompletionProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
