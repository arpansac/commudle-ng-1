import { Component, OnDestroy, OnInit } from '@angular/core';
import { ICampaign } from '@commudle/shared-models';
import { CampaignService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-campaign-assets-display',
  templateUrl: './campaign-assets-display.component.html',
  styleUrls: ['./campaign-assets-display.component.scss'],
})
export class CampaignAssetsDisplayComponent implements OnInit, OnDestroy {
  campaign: ICampaign | null = null;
  currentSlide = 0;
  slidesCount = 0;
  private intervalId: any;

  constructor(private campaignService: CampaignService) {}

  ngOnInit() {
    this.campaignService.indexOngoingCampaign(3).subscribe((data) => {
      if (data && data.campaign_assets && data.campaign_assets.length > 0) {
        this.campaign = data;
        this.slidesCount = this.campaign.campaign_assets.length;
        this.startAutoSlide();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearAutoSlide();
  }

  private startAutoSlide() {
    this.clearAutoSlide(); // Clear any existing interval before starting a new one
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000); // 5 seconds
  }

  nextSlide() {
    if (this.slidesCount > 0) {
      this.currentSlide = (this.currentSlide + 1) % this.slidesCount; // Loop back to first slide
    }
  }

  private clearAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
