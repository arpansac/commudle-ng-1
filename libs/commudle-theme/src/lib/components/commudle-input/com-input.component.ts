import { booleanAttribute, ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IComInputShape, IComInputSize, IComInputStatus } from './models/com-input.types';

@Component({
  selector: 'input[comInput], textarea[comInput], input[commudleInput], textarea[commudleInput]',
  template: '',
  styleUrls: ['./com-input.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses',
  },
})
export class ComInputComponent {
  @Input({ alias: 'fieldSize' }) size: IComInputSize = 'medium';
  @Input() status: IComInputStatus = 'basic';
  @Input() shape: IComInputShape = 'rectangle';
  @Input({ transform: booleanAttribute }) fullWidth = false;

  get hostClasses(): string {
    return [
      'com-input',
      'com-transition',
      `size-${this.size}`,
      `status-${this.status}`,
      `shape-${this.shape}`,
      this.fullWidth ? 'input-full-width' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}
