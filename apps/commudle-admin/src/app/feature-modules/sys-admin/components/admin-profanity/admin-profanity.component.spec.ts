/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminProfanityComponent } from './admin-profanity.component';

describe('AdminProfanityComponent', () => {
  let component: AdminProfanityComponent;
  let fixture: ComponentFixture<AdminProfanityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminProfanityComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminProfanityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
