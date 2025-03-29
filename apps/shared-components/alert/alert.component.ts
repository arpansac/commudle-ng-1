import { Component, Input } from '@angular/core';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'commudle-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent {
  icons = {
    faTriangleExclamation,
  };

  @Input() info: boolean;
  @Input() error: boolean;
  @Input() message: string;
  @Input() errorMessage: string;
  @Input() border = true;
  @Input() warning: string;
}
