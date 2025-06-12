/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FillDataFormConfirmationComponent } from './fill-data-form-confirmation.component';

describe('FillDataFormConfirmationComponent', () => {
  let component: FillDataFormConfirmationComponent;
  let fixture: ComponentFixture<FillDataFormConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FillDataFormConfirmationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FillDataFormConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
