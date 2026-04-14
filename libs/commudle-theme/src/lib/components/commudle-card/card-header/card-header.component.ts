import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'com-card-header',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./card-header.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComCardHeaderComponent {}
