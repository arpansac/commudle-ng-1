/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Recap2025Component } from './recap-2025.component';

describe('Recap2025Component', () => {
  let component: Recap2025Component;
  let fixture: ComponentFixture<Recap2025Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Recap2025Component],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Recap2025Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
