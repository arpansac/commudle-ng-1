/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CampaignFormOrderConfirmationComponent } from './campaign-form-order-confirmation.component';

describe('CampaignFormOrderConfirmationComponent', () => {
  let component: CampaignFormOrderConfirmationComponent;
  let fixture: ComponentFixture<CampaignFormOrderConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CampaignFormOrderConfirmationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignFormOrderConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
