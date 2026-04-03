import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ICardAccent, ICardSize, ICardStatus } from '../models/com-card.types';

@Component({
  selector: 'com-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComCardComponent {
  @Input() status: ICardStatus = 'basic';
  @Input() accent?: ICardAccent;
  @Input() size: ICardSize = 'medium';
}
