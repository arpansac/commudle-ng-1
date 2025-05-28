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

  private hasTrackedCampaignView = false;
  private hasTrackedDefaultImageView = false;

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
        if (entry.isIntersecting && !this.hasTrackedCampaignView) {
          this.createUserEngagementForCampaign(EUserActivityEventType.USER_VIEW);
          this.hasTrackedCampaignView = true;
          this.campaignObserver.disconnect(); // Stop observing after first call
        }
      },
      { threshold: 0.5 },
    );

    this.defaultImageObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !this.hasTrackedDefaultImageView) {
          this.createUserEngagementForDefaultImage(EUserActivityEventType.USER_VIEW);
          this.hasTrackedDefaultImageView = true;
          this.defaultImageObserver.disconnect(); // Stop observing after first call
        }
      },
      { threshold: 0.5 },
    );

    setTimeout(() => {
      const campaignEl = this.campaignImageContainerDiv?.nativeElement;
      const defaultEl = this.defaultImageContainerDiv?.nativeElement;

      if (this.campaign && campaignEl) {
        this.campaignObserver.observe(campaignEl);
        this.checkAndTriggerIfVisible(campaignEl, this.campaignObserver);
      } else if (defaultEl) {
        this.defaultImageObserver.observe(defaultEl);
        this.checkAndTriggerIfVisible(defaultEl, this.defaultImageObserver);
      }
    }, 500);
  }

  private checkAndTriggerIfVisible(element: HTMLElement, observer: IntersectionObserver) {
    const rect = element.getBoundingClientRect();
    const inViewport =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth);

    if (inViewport) {
      observer.observe(element); // Still required to properly trigger
    }
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
    this.userEngagementRecordForm.patchValue({
      event_type: eventType,
      url: window.location.href,
    });

    this.gtmService.dataLayerPushEvent('default_ad_campaign', {
      com_current_page_url: window.location.href,
      com_event_type: eventType,
      com_campaign_type_slug: this.campaignTypeSlug,
    });
    // this.uerService.userEngagementRecords({ user_engagement_record: this.userEngagementRecordForm.value }).subscribe();
  }
}
