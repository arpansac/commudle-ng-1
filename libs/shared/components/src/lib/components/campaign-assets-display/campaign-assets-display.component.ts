import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EDbModels, ICampaign, EUserActivityEventType } from '@commudle/shared-models';
import { CampaignService, GoogleTagManagerService, UserEngagementRecordsService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-campaign-assets-display',
  templateUrl: './campaign-assets-display.component.html',
  styleUrls: ['./campaign-assets-display.component.scss'],
})
export class CampaignAssetsDisplayComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() defaultImage: string;
  @Input() defaultImageUrl: string;
  @Input() campaignTypeSlug: string;
  campaign: ICampaign;
  currentSlide = 0;
  slidesCount = 0;
  private intervalId: any;
  userEngagementRecordForm: FormGroup;
  UserActivityEventType = EUserActivityEventType;
  @ViewChild('defaultImageContainer', { static: false }) defaultImageContainerDiv!: ElementRef;
  @ViewChild('campaignImageContainer', { static: false }) campaignImageContainerDiv!: ElementRef;
  private campaignObserver!: IntersectionObserver;
  private defaultImageObserver!: IntersectionObserver;

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
        }
      });
    }
  }

  ngAfterViewInit() {
    this.campaignObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          this.createUserEngagementForCampaign(EUserActivityEventType.USER_VIEW);
          this.campaignObserver.disconnect(); // Stop observing after first call
        }
      },
      { threshold: 0.5 }, // Adjust this as needed (e.g., 0.1 for 10% visibility)
    );

    this.defaultImageObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          this.createUserEngagementForDefaultImage(EUserActivityEventType.USER_VIEW);
          this.defaultImageObserver.disconnect(); // Stop observing after first call
        }
      },
      { threshold: 0.5 }, // Adjust this as needed (e.g., 0.1 for 10% visibility)
    );

    setTimeout(() => {
      if (this.campaign) {
        if (this.campaignImageContainerDiv?.nativeElement) {
          this.campaignObserver.observe(this.campaignImageContainerDiv.nativeElement);
        }
      } else {
        if (this.defaultImageContainerDiv?.nativeElement) {
          this.campaignObserver.observe(this.defaultImageContainerDiv.nativeElement);
        }
      }
    }, 5000); // Delay to ensure the element is rendered
  }

  ngOnDestroy(): void {
    this.clearAutoSlide();
    if (this.campaignObserver) {
      this.campaignObserver.disconnect();
    }
    if (this.defaultImageObserver) {
      this.defaultImageObserver.disconnect();
    }
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
    this.createUserEngagementForCampaign(EUserActivityEventType.USER_CLICK);
  }

  createUserEngagementForCampaign(eventType) {
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
          this.gtmService.dataLayerPushEvent('ad_campaign', {
            com_campaign_id: this.campaign.id,
            com_campaign_name: this.campaign.name,
            com_campaign_type: this.campaign.campaign_type,
            com_current_page_url: window.location.href,
            com_event_type: eventType,
          }),
        );
    }
  }

  createUserEngagementForDefaultImage(eventType) {
    // FIXME: Send relevent data to user engagement record
    this.userEngagementRecordForm.patchValue({
      event_type: eventType,
      url: window.location.href,
    });
    this.uerService.userEngagementRecords({ user_engagement_record: this.userEngagementRecordForm.value }).subscribe();
  }
}
