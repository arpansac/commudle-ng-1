import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'com-card-footer',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./card-footer.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComCardFooterComponent {}
