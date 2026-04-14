import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ICardAccent, ICardSize } from '../models/com-card.types';

@Component({
  selector: 'com-card',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./card.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComCardComponent {
  @Input() accent?: ICardAccent;
  @Input() size: ICardSize = 'medium';
}
