import { Component, Input } from '@angular/core';
import { EDbModels } from '@commudle/shared-models';

@Component({
    selector: 'commudle-session-page-poll',
    templateUrl: './session-page-poll.component.html',
    styleUrls: ['./session-page-poll.component.scss'],
    standalone: false
})
export class SessionPagePollComponent {
  @Input() pollableId: number;
  @Input() pollableType: EDbModels;
}
