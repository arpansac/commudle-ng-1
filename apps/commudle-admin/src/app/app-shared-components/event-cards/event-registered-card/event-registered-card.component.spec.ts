/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EventRegisteredCardComponent } from './event-registered-card.component';

describe('EventRegisteredCardComponent', () => {
  let component: EventRegisteredCardComponent;
  let fixture: ComponentFixture<EventRegisteredCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EventRegisteredCardComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventRegisteredCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
