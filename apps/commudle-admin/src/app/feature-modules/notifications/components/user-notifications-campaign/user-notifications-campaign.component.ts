import { Component } from '@angular/core';
import { environment } from '@commudle/shared-environments';
import { ECampaignTypeSlug } from '@commudle/shared-models';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
@Component({
  selector: 'commudle-user-notifications-campaign',
  templateUrl: './user-notifications-campaign.component.html',
  styleUrls: ['./user-notifications-campaign.component.scss'],
})
export class UserNotificationsCampaignComponent {
  staticAssets = staticAssets;
  ECampaignTypeSlug = ECampaignTypeSlug;
  defaultUrl = environment.app_url + '/campaigns/new';
}
