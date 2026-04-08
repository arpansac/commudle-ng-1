import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'com-card-body',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./card-body.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComCardBodyComponent {}
