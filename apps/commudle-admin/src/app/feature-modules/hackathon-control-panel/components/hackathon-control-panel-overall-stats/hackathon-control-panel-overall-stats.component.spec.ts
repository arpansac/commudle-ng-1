/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HackathonControlPanelOverallStatsComponent } from './hackathon-control-panel-overall-stats.component';

describe('HackathonControlPanelOverallStatsComponent', () => {
  let component: HackathonControlPanelOverallStatsComponent;
  let fixture: ComponentFixture<HackathonControlPanelOverallStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HackathonControlPanelOverallStatsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HackathonControlPanelOverallStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
