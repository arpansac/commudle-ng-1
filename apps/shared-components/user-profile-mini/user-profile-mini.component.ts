import { Component, Input } from '@angular/core';
import { IUser } from '@commudle/shared-models';

@Component({
  selector: 'app-user-profile-mini',
  templateUrl: './user-profile-mini.component.html',
  styleUrls: ['./user-profile-mini.component.scss'],
  standalone: false,
})
export class UserProfileMiniComponent {
  @Input() user: IUser;
  @Input() size: string;
  @Input() designation: boolean;
  @Input() disableAnchor = false;
  @Input() showLiveStatus: boolean;
  @Input() showOnlineText = false;
  @Input() alignStart = false;
  @Input() profileInfoMaxWidth = '80%';
  @Input() addPadding = true;
  @Input() truncateName = false;
  @Input() userLatestMessage: string;
  @Input() unreadMessagesCount: number;

  isOnline: boolean;

  HandleOnlineStatus(status) {
    this.isOnline = status;
  }
}
