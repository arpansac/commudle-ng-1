/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PublicFaqsComponent } from './public-faqs.component';

describe('PublicFaqsComponent', () => {
  let component: PublicFaqsComponent;
  let fixture: ComponentFixture<PublicFaqsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PublicFaqsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicFaqsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
