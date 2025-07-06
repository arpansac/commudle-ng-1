import { Component, Input } from '@angular/core';
import { IEvent } from '@commudle/shared-models';
import { NbDialogService } from '@commudle/theme';
import { EEventStatuses } from 'apps/shared-models/enums/event_statuses.enum';

@Component({
  selector: 'commudle-community-events-list-actions',
  templateUrl: './community-events-list-actions.component.html',
  styleUrls: ['./community-events-list-actions.component.scss'],
})
export class CommunityEventsListActionsComponent {
  @Input() value: string | number;
  @Input() eventData: IEvent;
  EEventStatuses = EEventStatuses;
  constructor(private dialogBoxService: NbDialogService) {}
  openCloneEventWindow(dialogBox) {
    this.dialogBoxService.open(dialogBox);
  }
  // gotoRegistrations(eventData: any): void{
  //   if(eventData === EEventStatuses.OPEN){
  //     this.router.navigate(['event-dashboard-test-sidekiq-registrations',eventData.slug])
  //   }
  //   else{
  //     this.router.navigate(['event-dashboard',eventData.slug])
  //   }
  // }
}
