import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiAssistantSelectorComponent } from './ai-assistant-selector.component';

describe('AiAssistantSelectorComponent', () => {
  let component: AiAssistantSelectorComponent;
  let fixture: ComponentFixture<AiAssistantSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiAssistantSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AiAssistantSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
