/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RecapComponent } from './recap-2024.component';

describe('RecapComponent', () => {
  let component: RecapComponent;
  let fixture: ComponentFixture<RecapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecapComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
