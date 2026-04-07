import { Component, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from '@commudle/shared-services';

@Component({
  selector: 'app-user-personal-chat-list',
  templateUrl: './user-personal-chat-list.component.html',
  styleUrls: ['./user-personal-chat-list.component.scss'],
  standalone: false,
})
export class UserPersonalChatListComponent implements OnInit, OnDestroy {
  constructor(private layoutService: LayoutService) {}

  ngOnInit(): void {
    this.layoutService.setShowGlobalChatPopup(false);
  }

  ngOnDestroy(): void {
    this.layoutService.setShowGlobalChatPopup(true);
  }
}
