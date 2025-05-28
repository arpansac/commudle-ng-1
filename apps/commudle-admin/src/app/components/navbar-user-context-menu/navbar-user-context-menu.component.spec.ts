import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarUserContextMenuComponent } from './navbar-user-context-menu.component';

describe('NavbarUserContextMenuComponent', () => {
  let component: NavbarUserContextMenuComponent;
  let fixture: ComponentFixture<NavbarUserContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavbarUserContextMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarUserContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
