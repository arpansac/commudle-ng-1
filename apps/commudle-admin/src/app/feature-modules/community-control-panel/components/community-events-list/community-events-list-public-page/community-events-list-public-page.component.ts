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

  openCloneEventWindow(dialogBox) {
    this.dialogBoxService.open(dialogBox);
  }
}
