import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SysAdminDiscountCodeComponent } from './sys-admin-discount-code.component';

describe('SysAdminDiscountCodeComponent', () => {
  let component: SysAdminDiscountCodeComponent;
  let fixture: ComponentFixture<SysAdminDiscountCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SysAdminDiscountCodeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SysAdminDiscountCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
