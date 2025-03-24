/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SearchPageCampaignComponent } from './search-page-campaign.component';

describe('SearchPageCampaignComponent', () => {
  let component: SearchPageCampaignComponent;
  let fixture: ComponentFixture<SearchPageCampaignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SearchPageCampaignComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchPageCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
