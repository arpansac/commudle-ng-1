import { Component } from '@angular/core';
import { ECampaignTypeSlug } from '@commudle/shared-models';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { environment } from '@commudle/shared-environments';
@Component({
  selector: 'commudle-search-page-campaign',
  templateUrl: './search-page-campaign.component.html',
  styleUrls: ['./search-page-campaign.component.scss'],
})
export class SearchPageCampaignComponent {
  staticAssets = staticAssets;
  ECampaignTypeSlug = ECampaignTypeSlug;

  defaultUrl = environment.app_url + '/campaigns/new';
}
