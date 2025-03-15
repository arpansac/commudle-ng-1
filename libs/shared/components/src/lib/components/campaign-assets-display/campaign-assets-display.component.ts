import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ICampaign } from '@commudle/shared-models';
import { CampaignService, UserEngagementRecordsService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-campaign-assets-display',
  templateUrl: './campaign-assets-display.component.html',
  styleUrls: ['./campaign-assets-display.component.scss'],
})
export class CampaignAssetsDisplayComponent implements OnInit, OnDestroy {
  @Input() defaultImage: string;
  @Input() defaultImageUrl: string;
  @Input() campaignTypeSlug: string;
  campaign: ICampaign;
  currentSlide = 0;
  slidesCount = 0;
  private intervalId: any;
  userEngagementRecordForm: FormGroup;

  constructor(
    private campaignService: CampaignService,
    private uerService: UserEngagementRecordsService,
    private fb: FormBuilder,
  ) {
    this.userEngagementRecordForm = this.fb.group({
      url: '',
      event_type: '',
      created_at: new Date().toISOString(),
      parent_id: '',
      parent_type: '',
    });
  }

  ngOnInit() {
    if (this.campaignTypeSlug) {
      this.campaignService.indexOngoingCampaign(this.campaignTypeSlug).subscribe((data) => {
        if (data && data.campaign_assets && data.campaign_assets.length > 0) {
          this.campaign = data;
          this.slidesCount = this.campaign.campaign_assets.length;
          this.startAutoSlide();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.clearAutoSlide();
  }

  nextSlide() {
    if (this.slidesCount > 0) {
      this.currentSlide = (this.currentSlide + 1) % this.slidesCount; // Loop back to first slide
    }
  }

  private startAutoSlide() {
    this.clearAutoSlide(); // Clear any existing interval before starting a new one
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000); // 5 seconds
  }

  private clearAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  createUserEngagement() {
    this.uerService.userEngagementRecords(this.userEngagementRecordForm).subscribe((data) => {});
  }
}
