import { Component, Input } from '@angular/core';
import { ICommunityGroup } from '@commudle/shared-models';

@Component({
  selector: 'app-community-group-badge',
  templateUrl: './community-group-badge.component.html',
  styleUrls: ['./community-group-badge.component.scss'],
  standalone: false,
})
export class CommunityGroupBadgeComponent {
  @Input() communityGroup: ICommunityGroup;
  @Input() background: string;
  @Input() size: 'small' | 'medium' = 'medium';
  @Input() textColor = 'com-text-gray-500';
}
