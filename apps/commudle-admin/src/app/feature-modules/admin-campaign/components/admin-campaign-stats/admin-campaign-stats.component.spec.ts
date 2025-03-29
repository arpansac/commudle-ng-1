/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminCampaignStatsComponent } from './admin-campaign-stats.component';

describe('AdminCampaignStatsComponent', () => {
  let component: AdminCampaignStatsComponent;
  let fixture: ComponentFixture<AdminCampaignStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminCampaignStatsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCampaignStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
