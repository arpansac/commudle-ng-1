/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HackathonControlPanelEmailStatsComponent } from './hackathon-control-panel-email-stats.component';

describe('HackathonControlPanelEmailStatsComponent', () => {
  let component: HackathonControlPanelEmailStatsComponent;
  let fixture: ComponentFixture<HackathonControlPanelEmailStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HackathonControlPanelEmailStatsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HackathonControlPanelEmailStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
