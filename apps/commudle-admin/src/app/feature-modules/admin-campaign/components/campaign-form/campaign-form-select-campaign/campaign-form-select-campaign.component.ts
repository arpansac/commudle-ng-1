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
  campaignExists = false;
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
        if (params.campaign) {
          this.campaign = params.campaign;
          this.campaignExists = true;
          this.selectedCampaignTypeId = this.campaign.campaign_type_id;
        }
      });
    });
  }

  selectCampaignType(campaignTypeId: number) {
    this.selectedCampaignTypeId = campaignTypeId;
  }

  createCampaign() {
    this.campaignService.createCampaign(this.selectedCampaignTypeId).subscribe((res) => {
      this.router.navigate(['campaigns', 'edit', res.id, 'order-setup']);
    });
  }

  updateCampaign() {
    this.campaignService
      .updateCampaign({ campaign: { campaign_type_id: this.selectedCampaignTypeId } }, this.campaign.id)
      .subscribe((res) => {
        this.router.navigate(['campaigns', 'edit', res.id, 'order-setup'], {
          fragment: 'user-information',
        });
      });
  }
}
