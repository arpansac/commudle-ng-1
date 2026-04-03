import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'com-card-body',
  templateUrl: './card-body.component.html',
  styleUrls: ['./card-body.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComCardBodyComponent {}
