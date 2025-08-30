import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ICampaign, ICampaignType, ECampaignTypeSlug } from '@commudle/shared-models';
import { CampaignService, CampaignTypeService, GoogleTagManagerService, SeoService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
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
  ECampaignTypeSlug = ECampaignTypeSlug;

  constructor(
    private campaignTypeService: CampaignTypeService,
    private campaignService: CampaignService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialogService: NbDialogService,
    private seoService: SeoService,
    private gtm: GoogleTagManagerService,
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
          this.seoService.setTags(
            `Edit ${this.campaign.name} Campaign`,
            `Edit your campaign ${this.campaign.name}`,
            'https://commudle.com/assets/images/commudle-logo192.png',
          );
        } else {
          this.seoService.setTags(
            'Create a Campaign',
            'Create a new campaign to boost outreach to thousands of developers on Commudle. Choose a campaign type to start',
            'https://commudle.com/assets/images/commudle-logo192.png',
          );
        }
      });
    });
  }

  selectCampaignType(campaignTypeId: number) {
    if (this.campaignExists) {
      return;
    }
    this.selectedCampaignTypeId = campaignTypeId;
  }

  createCampaign() {
    this.campaignService.createCampaign(this.selectedCampaignTypeId).subscribe((res: ICampaign) => {
      this.gtmDataLayerPushEvent('new-campaign-step-1-created', {
        com_campaign_id: res.id,
        com_campaign_type_name: res.campaign_type.name,
      });
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

  getClampedText(description: string): string {
    const limit = 150;
    if (description.length > limit) {
      return description.slice(0, limit) + '...';
    }
    return description;
  }

  viewMoreClicked(dialog, campaignType: ICampaignType) {
    this.dialogService.open(dialog, {
      context: {
        campaignType: campaignType,
      },
    });
  }

  private gtmDataLayerPushEvent(eventName: string, eventData: Record<string, string | number> = {}): void {
    this.gtm.dataLayerPushEvent(eventName, eventData);
  }
}
