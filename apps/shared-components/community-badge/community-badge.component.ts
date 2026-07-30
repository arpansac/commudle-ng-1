import { Component, Input } from '@angular/core';
import { ICommunity } from 'apps/shared-models/community.model';

@Component({
  selector: 'app-community-badge',
  templateUrl: './community-badge.component.html',
  styleUrls: ['./community-badge.component.scss'],
  standalone: false,
})
export class CommunityBadgeComponent {
  @Input() community: ICommunity;
  @Input() background: string;
  @Input() size: 'small' | 'medium' = 'medium';
  @Input() textColor = 'com-text-gray-500';
  @Input() routeBase = '/communities';
}
