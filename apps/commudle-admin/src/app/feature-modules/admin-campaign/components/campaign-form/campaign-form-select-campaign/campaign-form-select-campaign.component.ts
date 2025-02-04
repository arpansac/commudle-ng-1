import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICampaign, ICampaignType } from '@commudle/shared-models';
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
  campaign: ICampaign;
  isLoading = true;
  constructor(
    private campaignTypeService: CampaignTypeService,
    private campaignService: CampaignService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.getCampaignTypes();
  }

  getCampaignTypes() {
    this.campaignTypeService.getCampaignTypes().subscribe((res) => {
      this.campaignTypes = res;
      this.isLoading = false;
      this.activatedRoute.data.subscribe((params) => {
        this.campaign = params.campaign;
        this.selectedCampaignTypeId = params.campaign.campaign_type_id;
      });
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

  updateCampaign() {
    this.campaignService
      .updateCampaign({ campaign_type_id: this.selectedCampaignTypeId }, this.campaign.id)
      .subscribe((res) => {
        this.router.navigate(['campaign', 'edit', res.id, 'order-setup']);
      });
  }
}
