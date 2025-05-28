/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UserDashboardCampaignComponent } from './user-dashboard-campaign.component';

describe('UserDashboardCampaignComponent', () => {
  let component: UserDashboardCampaignComponent;
  let fixture: ComponentFixture<UserDashboardCampaignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserDashboardCampaignComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDashboardCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
