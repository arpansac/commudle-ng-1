import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserPersonalConnectComponent } from './user-personal-connect.component';

describe('UserPersonalConnectComponent', () => {
  let component: UserPersonalConnectComponent;
  let fixture: ComponentFixture<UserPersonalConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPersonalConnectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserPersonalConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
