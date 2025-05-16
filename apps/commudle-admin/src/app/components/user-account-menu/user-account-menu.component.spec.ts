import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserSidebarProfileMenuComponent } from './user-account-menu.component';

describe('UserSidebarProfileMenuComponent', () => {
  let component: UserSidebarProfileMenuComponent;
  let fixture: ComponentFixture<UserSidebarProfileMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserSidebarProfileMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSidebarProfileMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
