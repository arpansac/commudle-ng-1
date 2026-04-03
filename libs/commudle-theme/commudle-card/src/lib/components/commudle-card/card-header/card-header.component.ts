import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'com-card-header',
  templateUrl: './card-header.component.html',
  styleUrls: ['./card-header.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComCardHeaderComponent {}
