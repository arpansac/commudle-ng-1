import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ICampaignType } from '@commudle/shared-models';
import { CampaignService, CampaignTypeService } from '@commudle/shared-services';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'commudle-campaign-form-select-campaign',
  templateUrl: './campaign-form-select-campaign.component.html',
  styleUrls: ['./campaign-form-select-campaign.component.scss'],
})
export class CampaignFormSelectCampaignComponent implements OnInit {
  campaignTypes: ICampaignType[];
  selectedCampaignTypeId: number;
  icons = {
    faArrowRight,
  };
  constructor(
    private campaignTypeService: CampaignTypeService,
    private campaignService: CampaignService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.getCampaignTypes();
  }

  getCampaignTypes() {
    this.campaignTypeService.getCampaignTypes().subscribe((res) => {
      this.campaignTypes = res;
    });
  }

  selectCampaignType(campaignTypeId: number) {
    this.selectedCampaignTypeId = campaignTypeId;
  }

  createCampaign() {
    this.campaignService.createCampaign(this.selectedCampaignTypeId).subscribe((res) => {
      this.router.navigate(['campaign', 'edit', res.id, 'order-setup']);
    });
  }
}
