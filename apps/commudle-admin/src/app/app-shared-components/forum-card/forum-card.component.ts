import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICommunityChannel } from '@commudle/shared-models';
import { NbIconModule } from '@commudle/theme';

@Component({
  selector: 'commudle-forum-card',
  standalone: true,
  imports: [CommonModule, NbIconModule],
  templateUrl: './forum-card.component.html',
  styleUrls: ['./forum-card.component.scss'],
})
export class ForumCardComponent {
  @Input() forum: ICommunityChannel;
  @Input() horizontalScroll = false;
}
