import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewDiscussionFormComponent } from './new-discussion-form.component';

describe('NewDiscussionFormComponent', () => {
  let component: NewDiscussionFormComponent;
  let fixture: ComponentFixture<NewDiscussionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewDiscussionFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewDiscussionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
