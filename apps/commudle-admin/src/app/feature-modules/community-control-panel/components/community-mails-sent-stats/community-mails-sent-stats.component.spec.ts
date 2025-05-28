/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommunityMailsSentStatsComponent } from './community-mails-sent-stats.component';

describe('CommunityMailsSentStatsComponent', () => {
  let component: CommunityMailsSentStatsComponent;
  let fixture: ComponentFixture<CommunityMailsSentStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommunityMailsSentStatsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityMailsSentStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
