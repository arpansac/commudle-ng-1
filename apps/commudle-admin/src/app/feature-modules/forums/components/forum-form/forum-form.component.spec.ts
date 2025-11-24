/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ForumFormComponent } from './forum-form.component';

describe('ForumFormComponent', () => {
  let component: ForumFormComponent;
  let fixture: ComponentFixture<ForumFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ForumFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
