/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CampaignFormSelectCampaignComponent } from './campaign-form-select-campaign.component';

describe('CampaignFormSelectCampaignComponent', () => {
  let component: CampaignFormSelectCampaignComponent;
  let fixture: ComponentFixture<CampaignFormSelectCampaignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CampaignFormSelectCampaignComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignFormSelectCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
