import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ComInputComponent } from './com-input.component';
import { CommudleInputModule } from './commudle-input.module';
import { IComInputShape, IComInputSize, IComInputStatus } from './models/com-input.types';

@Component({
  template: `
    <input comInput class="primary-input" [size]="size" [status]="status" [shape]="shape" [fullWidth]="fullWidth" />
    <textarea
      comInput
      class="primary-textarea"
      [size]="size"
      [status]="status"
      [shape]="shape"
      [fullWidth]="fullWidth"
    ></textarea>
    <input commudleInput status="danger" fieldSize="small" />
    <input comInput size="giant" status="primary" />
  `,
  standalone: false,
})
class InputTestComponent {
  @Input() size: IComInputSize = 'medium';
  @Input() status: IComInputStatus = 'basic';
  @Input() shape: IComInputShape = 'rectangle';
  @Input() fullWidth = false;
}

describe('ComInputComponent (comInput)', () => {
  let fixture: ComponentFixture<InputTestComponent>;
  let inputTestComponent: InputTestComponent;
  let inputElement: HTMLInputElement;
  let textareaElement: HTMLTextAreaElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputTestComponent],
      imports: [CommudleInputModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InputTestComponent);
    inputTestComponent = fixture.componentInstance;
    inputElement = fixture.nativeElement.querySelector('input.primary-input');
    textareaElement = fixture.nativeElement.querySelector('textarea.primary-textarea');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(ComInputComponent))).toBeTruthy();
  });

  it('should set status', () => {
    inputTestComponent.status = 'danger';
    fixture.detectChanges();

    expect(inputElement.classList).toContain('status-danger');
    expect(textareaElement.classList).toContain('status-danger');
  });

  it('should set size', () => {
    inputTestComponent.size = 'large';
    fixture.detectChanges();

    expect(inputElement.classList).toContain('size-large');
    expect(textareaElement.classList).toContain('size-large');
  });

  it('should set shape class', () => {
    inputTestComponent.shape = 'semi-round';
    fixture.detectChanges();

    expect(inputElement.classList).toContain('shape-semi-round');
    expect(textareaElement.classList).toContain('shape-semi-round');
  });

  it('should set full width', () => {
    inputTestComponent.fullWidth = true;
    fixture.detectChanges();

    expect(inputElement.classList).toContain('input-full-width');
    expect(textareaElement.classList).toContain('input-full-width');
  });

  it('should support commudleInput selector alias', () => {
    fixture.detectChanges();
    const aliasInput = fixture.nativeElement.querySelector('input[commudleInput]');
    expect(aliasInput.classList).toContain('status-danger');
    expect(aliasInput.classList).toContain('size-small');
  });

  it('should accept size attribute (Nebular-style)', () => {
    fixture.detectChanges();
    const giantInput = fixture.nativeElement.querySelector('input.size-giant');
    expect(giantInput).toBeTruthy();
    expect(giantInput.classList).toContain('status-primary');
  });
});
