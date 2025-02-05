/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminCampaignsListComponent } from './admin-campaigns-list.component';

describe('AdminCampaignsListComponent', () => {
  let component: AdminCampaignsListComponent;
  let fixture: ComponentFixture<AdminCampaignsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminCampaignsListComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCampaignsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
