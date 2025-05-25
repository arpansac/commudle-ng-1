import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenciesComponent } from 'apps/commudle-admin/src/app/feature-modules/public-agencies/components/agencies/agencies.component';

describe('AgenciesComponent', () => {
  let component: AgenciesComponent;
  let fixture: ComponentFixture<AgenciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgenciesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
