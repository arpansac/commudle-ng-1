import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'com-card-footer',
  templateUrl: './card-footer.component.html',
  styleUrls: ['./card-footer.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComCardFooterComponent {}
