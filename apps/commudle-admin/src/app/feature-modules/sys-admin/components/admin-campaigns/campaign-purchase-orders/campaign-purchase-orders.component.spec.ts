/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CampaignPurchaseOrdersComponent } from './campaign-purchase-orders.component';

describe('CampaignPurchaseOrdersComponent', () => {
  let component: CampaignPurchaseOrdersComponent;
  let fixture: ComponentFixture<CampaignPurchaseOrdersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CampaignPurchaseOrdersComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignPurchaseOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
