import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IEvent } from '@commudle/shared-models';
import { NbDialogService } from '@commudle/theme';

@Component({
  selector: 'commudle-community-events-list-public-page',
  templateUrl: './community-events-list-public-page.component.html',
  styleUrls: ['./community-events-list-public-page.component.scss'],
})
export class CommunityEventsListPublicPageComponent implements OnInit {
  @Input() value: string | number;
  @Input() eventData: IEvent;
  @ViewChild('cloneEvent') cloneEvent: TemplateRef<any>;

  constructor(private dialogBoxService: NbDialogService, private router: Router) {}

  ngOnInit(): void {}

  onActionSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    if (value === 'clone') {
      this.openCloneEventWindow(this.cloneEvent);
    } else if (value === 'public-page') {
      this.router.navigate(['/communities/', this.eventData.kommunity_id, 'events', this.eventData.slug]);
    } else if (value === 'stats') {
      this.router.navigate([
        '/admin/communities/',
        this.eventData.kommunity_id,
        'event-dashboard',
        this.eventData.slug,
        'stats',
      ]);
    }
  }

  openCloneEventWindow(dialogBox) {
    this.dialogBoxService.open(dialogBox);
  }
}
