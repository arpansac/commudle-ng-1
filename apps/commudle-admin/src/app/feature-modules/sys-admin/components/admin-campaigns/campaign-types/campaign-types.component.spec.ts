/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CampaignTypesComponent } from './campaign-types.component';

describe('CampaignTypesComponent', () => {
  let component: CampaignTypesComponent;
  let fixture: ComponentFixture<CampaignTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CampaignTypesComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
