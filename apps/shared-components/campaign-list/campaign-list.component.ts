import { Component, Input } from '@angular/core';
import { ICampaign, ECampaignStatus } from '@commudle/shared-models';
import { CampaignService, ToastrService } from '@commudle/shared-services';
import { faEdit, faReceipt } from '@fortawesome/free-solid-svg-icons';
import { NbDialogService } from '@commudle/theme';
import moment from 'moment';

@Component({
  selector: 'commudle-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.scss'],
})
export class CampaignListComponent {
  @Input() campaigns: ICampaign[];
  @Input() isCampaignAdmin = false;
  moment = moment;
  icons = { faEdit, faReceipt };
  ECampaignStatus = ECampaignStatus;

  constructor(
    private campaignService: CampaignService,
    private toasterService: ToastrService,
    private dialogService: NbDialogService,
  ) {}

  updateStatus(event, campaignId) {
    this.campaignService.sysAdminUpdateStatus(campaignId, event.target.value).subscribe((res) => {
      if (res) {
        this.toasterService.successDialog('Campaign status updated successfully');
      }
    });
  }

  openPopup(dialog, campaignId) {
    if (this.isCampaignAdmin) {
      this.campaignService.fetchCampaign(campaignId).subscribe((campaign) => {
        if (campaign) {
          this.dialogService.open(dialog, { context: campaign });
        }
      });
    }
  }
}
