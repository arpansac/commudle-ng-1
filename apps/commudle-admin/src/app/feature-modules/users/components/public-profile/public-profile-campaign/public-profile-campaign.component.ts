import { Component } from '@angular/core';
import { ECampaignTypeSlug } from '@commudle/shared-models';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';

@Component({
  selector: 'commudle-public-profile-campaign',
  templateUrl: './public-profile-campaign.component.html',
  styleUrls: ['./public-profile-campaign.component.scss'],
})
export class PublicProfileCampaignComponent {
  ECampaignTypeSlug = ECampaignTypeSlug;
  staticAssets = staticAssets;
}
