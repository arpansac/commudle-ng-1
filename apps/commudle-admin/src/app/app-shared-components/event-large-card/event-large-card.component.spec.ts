import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventLargeCardComponent } from '../event-large-card.component';

describe('EventLargeCardComponent', () => {
  let component: EventLargeCardComponent;
  let fixture: ComponentFixture<EventLargeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventLargeCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventLargeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
