import { Component } from '@angular/core';
import { faHashtag } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'commudle-community-group-channels',
  templateUrl: './community-group-channels.component.html',
  styleUrls: ['./community-group-channels.component.scss'],
  standalone: false,
})
export class CommunityGroupChannelsComponent {
  faHashtag = faHashtag;
}
