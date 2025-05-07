/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UserExpertTickComponent } from './user-expert-tick.component';

describe('UserExpertTickComponent', () => {
  let component: UserExpertTickComponent;
  let fixture: ComponentFixture<UserExpertTickComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserExpertTickComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserExpertTickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
