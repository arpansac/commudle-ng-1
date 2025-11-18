import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForumMessagesComponent } from './forum-messages.component';

describe('ForumMessagesComponent', () => {
  let component: ForumMessagesComponent;
  let fixture: ComponentFixture<ForumMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForumMessagesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ForumMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
