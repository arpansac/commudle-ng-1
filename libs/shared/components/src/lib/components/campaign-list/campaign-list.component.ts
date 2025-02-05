import { Component, Input } from '@angular/core';
import { ICampaign, ECampaignStatus } from '@commudle/shared-models';
import { CampaignService, ToastrService } from '@commudle/shared-services';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';

@Component({
  selector: 'commudle-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.scss'],
})
export class CampaignListComponent {
  @Input() campaigns: ICampaign[];
  @Input() sysAdmin = false;
  moment = moment;
  icons = { faEdit };
  ECampaignStatus = ECampaignStatus;
  constructor(private campaignService: CampaignService, private tostrService: ToastrService) {}

  updateStatus(event, campaignId) {
    this.campaignService.sysAdminUpdateStatus(campaignId, event.target.value).subscribe((res) => {
      if (res) {
        this.tostrService.successDialog('Campaign status updated successfully');
      }
    });
  }
}
