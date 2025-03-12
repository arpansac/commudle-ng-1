import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICampaign, ECampaignStatus } from '@commudle/shared-models';
import { CampaignService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { faEdit, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
@Component({
  selector: 'commudle-campaign-form-order-confirmation',
  templateUrl: './campaign-form-order-confirmation.component.html',
  styleUrls: ['./campaign-form-order-confirmation.component.scss'],
})
export class CampaignFormOrderConfirmationComponent implements OnInit {
  campaign: ICampaign;
  icons = {
    faEdit,
    faArrowRight,
  };
  moment = moment;
  consent = false;
  @ViewChild('submissionCampaign') submissionCampaignDialog: TemplateRef<any>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private campaignService: CampaignService,
    private _dialogService: NbDialogService,
  ) {}

  ngOnInit() {
    this.activatedRoute.parent.data.subscribe((data) => {
      this.campaign = data['campaign'];
      if (this.campaign.status === ECampaignStatus.SUBMITTED) {
        this.consent = true;
      }
    });
  }

  submitForApproval() {
    this.campaignService
      .updateCampaign({ campaign: { status: ECampaignStatus.SUBMITTED } }, this.campaign.id)
      .subscribe((data) => {
        if (data) {
          this.campaign = data;
          this.openDialog(this.submissionCampaignDialog);
        }
      });
  }

  openDialog(dialog) {
    this._dialogService.open(dialog);
  }
}
