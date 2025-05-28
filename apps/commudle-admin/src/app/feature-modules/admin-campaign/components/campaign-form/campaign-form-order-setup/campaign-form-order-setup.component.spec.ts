/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CampaignFormOrderSetupComponent } from './campaign-form-order-setup.component';

describe('CampaignFormOrderSetupComponent', () => {
  let component: CampaignFormOrderSetupComponent;
  let fixture: ComponentFixture<CampaignFormOrderSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CampaignFormOrderSetupComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignFormOrderSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
