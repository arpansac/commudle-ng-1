import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EDbModels, ICampaign, EUserActivityEventType } from '@commudle/shared-models';
import { CampaignService, GoogleTagManagerService, UserEngagementRecordsService } from '@commudle/shared-services';

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
  UserActivityEventType = EUserActivityEventType;

  constructor(
    private campaignService: CampaignService,
    private uerService: UserEngagementRecordsService,
    private fb: FormBuilder,
    private gtmService: GoogleTagManagerService,
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
          this.userEngagementRecordForm.patchValue({
            parent_id: this.campaign.id,
            parent_type: EDbModels.CAMPAIGN,
          });
          this.createUserEngagement(EUserActivityEventType.USER_VIEW);
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

  onClick() {
    this.createUserEngagement(EUserActivityEventType.USER_CLICK);
  }

  createUserEngagement(eventType) {
    if (this.campaign) {
      this.userEngagementRecordForm.patchValue({
        event_type: eventType,
        parent_id: this.campaign.id,
        parent_type: EDbModels.CAMPAIGN,
        url: window.location.href,
      });
      this.uerService
        .userEngagementRecords({ user_engagement_record: this.userEngagementRecordForm.value })
        .subscribe(() =>
          this.gtmService.dataLayerPushEvent(eventType, {
            com_campaign_id: this.campaign.id,
            com_current_page_url: window.location.href,
          }),
        );
    }
  }
}
