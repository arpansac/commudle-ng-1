import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ICampaignType } from '@commudle/shared-models';
import { CampaignTypeService } from '@commudle/shared-services';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'commudle-campaign-form-select-campaign',
  templateUrl: './campaign-form-select-campaign.component.html',
  styleUrls: ['./campaign-form-select-campaign.component.scss'],
})
export class CampaignFormSelectCampaignComponent implements OnInit {
  campaignTypes: ICampaignType[];
  campaignForm: FormGroup;
  selectedCampaignTypeId: number;
  icons = {
    faArrowRight,
  };
  constructor(private campaignTypeService: CampaignTypeService, private fb: FormBuilder) {
    this.campaignForm = this.fb.group({
      campaign_type_id: [NaN, Validators.required],
    });
  }

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
    this.campaignForm.patchValue({ campaign_type_id: campaignTypeId });
  }
}
