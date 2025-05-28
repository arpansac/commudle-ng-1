/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HackathonIndividualTeamEmailComponent } from './hackathon-individual-team-email.component';

describe('HackathonIndividualTeamEmailComponent', () => {
  let component: HackathonIndividualTeamEmailComponent;
  let fixture: ComponentFixture<HackathonIndividualTeamEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HackathonIndividualTeamEmailComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HackathonIndividualTeamEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
