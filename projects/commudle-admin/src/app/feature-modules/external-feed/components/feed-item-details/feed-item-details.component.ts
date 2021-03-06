import {
  Component,
  Input,
  Output,
  OnInit,
  TemplateRef,
  ViewChild,
  EventEmitter,
} from "@angular/core";
import { IFeedItem } from "projects/shared-models/feed-item.model";
import { DiscussionsService } from "projects/commudle-admin/src/app/services/discussions.service";
import { IDiscussion } from "projects/shared-models/discussion.model";
import { DatePipe } from "@angular/common";
import {DiscussionChatChannel} from 'projects/shared-components/services/websockets/discussion-chat.channel';
import {ICurrentUser} from 'projects/shared-models/current_user.model';
import {LibAuthwatchService} from 'projects/shared-services/lib-authwatch.service';

@Component({
  selector: "app-feed-item-details",
  templateUrl: "./feed-item-details.component.html",
  styleUrls: ["./feed-item-details.component.scss"],
})
export class FeedItemDetailsComponent implements OnInit {
  @Input() feedItem: IFeedItem;
  discussionChat: IDiscussion;

  messagesCount: number;
  currentUser: ICurrentUser;

  constructor(
    private discussionsService: DiscussionsService,
    private datePipe: DatePipe,
    private discussionChatChannel: DiscussionChatChannel,
    private authWatchService: LibAuthwatchService,
  ) {}

  ngOnInit() {
    this.feedItem.details.created_at = this.datePipe.transform(
      this.feedItem.details.created_at,
      "d MMMM, YYYY"
    );
    this.getDiscussionChat();
  }

  getDiscussionChat() {
    this.discussionsService
      .pGetOrCreateForFeedItemChat(this.feedItem.id)
      .subscribe((data) => (this.discussionChat = data));
  }

}
