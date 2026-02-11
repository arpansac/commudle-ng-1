import { Component } from '@angular/core';
import { ECampaignTypeSlug } from '@commudle/shared-models';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';

@Component({
    selector: 'commudle-user-dashboard-campaign',
    templateUrl: './user-dashboard-campaign.component.html',
    styleUrls: ['./user-dashboard-campaign.component.scss'],
    standalone: false
})
export class UserDashboardCampaignComponent {
  staticAssets = staticAssets;
  ECampaignTypeSlug = ECampaignTypeSlug;
}
