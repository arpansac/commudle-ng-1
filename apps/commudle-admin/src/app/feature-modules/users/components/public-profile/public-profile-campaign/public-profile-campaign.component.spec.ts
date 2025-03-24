/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PublicProfileCampaignComponent } from './public-profile-campaign.component';

describe('PublicProfileCampaignComponent', () => {
  let component: PublicProfileCampaignComponent;
  let fixture: ComponentFixture<PublicProfileCampaignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PublicProfileCampaignComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicProfileCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
