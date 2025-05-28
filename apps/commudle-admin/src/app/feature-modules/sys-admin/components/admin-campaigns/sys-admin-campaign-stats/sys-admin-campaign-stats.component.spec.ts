/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SysAdminCampaignStatsComponent } from './sys-admin-campaign-stats.component';

describe('SysAdminCampaignStatsComponent', () => {
  let component: SysAdminCampaignStatsComponent;
  let fixture: ComponentFixture<SysAdminCampaignStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SysAdminCampaignStatsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SysAdminCampaignStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
