import { Component, OnDestroy, OnInit } from '@angular/core';
import { LayoutService } from '@commudle/shared-services';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';

@Component({
  selector: 'app-user-personal-chat-list',
  templateUrl: './user-personal-chat-list.component.html',
  styleUrls: ['./user-personal-chat-list.component.scss'],
  standalone: false,
})
export class UserPersonalChatListComponent implements OnInit, OnDestroy {
  constructor(private layoutService: LayoutService, private footerService: FooterService) {}

  ngOnInit(): void {
    this.layoutService.changeFullHeightContent(false);
    this.layoutService.setShowGlobalChatPopup(false);
    this.footerService.changeMiniFooterStatus(false);
  }

  ngOnDestroy(): void {
    this.layoutService.changeFullHeightContent(true);
    this.layoutService.setShowGlobalChatPopup(true);
    this.footerService.changeMiniFooterStatus(true);
  }
}
