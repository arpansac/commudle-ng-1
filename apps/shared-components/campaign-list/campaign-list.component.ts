import { Component, Input } from '@angular/core';
import {
  ICampaign,
  ECampaignStatus,
  EPurchaseOrderStatus,
  EDbModels,
  ECampaignTypeSlug,
} from '@commudle/shared-models';
import { CampaignService, NoteService, ToastrService } from '@commudle/shared-services';
import { faEdit, faReceipt, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
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
  icons = { faEdit, faReceipt, faArrowUpRightFromSquare };
  ECampaignStatus = ECampaignStatus;
  ECampaignTypeSlug = ECampaignTypeSlug;

  EPurchaseOrderStatus = EPurchaseOrderStatus;
  noteTexts: { [campaignId: number]: string } = {};
  newsletterId: number;
  constructor(
    private campaignService: CampaignService,
    private toasterService: ToastrService,
    private dialogService: NbDialogService,
    private noteService: NoteService,
  ) {}

  updateStatus(event, campaignId) {
    this.campaignService.campaignAdminUpdateStatus(campaignId, event.target.value).subscribe((res) => {
      if (res) {
        const index = this.campaigns.findIndex((campaign) => campaign.id === campaignId);
        this.campaigns[index] = res;
        this.toasterService.successDialog('Campaign status updated successfully');
      }
    });
  }

  openPopup(dialog, campaign) {
    if (this.isCampaignAdmin) {
      if (campaign.newsletter_id) {
        this.newsletterId = campaign.newsletter_id;
      } else {
        this.newsletterId = null;
      }
      this.dialogService.open(dialog, { context: { campaignId: campaign.id } });
    }
  }

  updateNotes(campaignId: number) {
    if (!this.noteTexts[campaignId]) return; // Prevent empty submissions

    const formData = new FormData();
    formData.append('note[text]', this.noteTexts[campaignId]);
    this.noteService.createNote(formData, EDbModels.CAMPAIGN, campaignId).subscribe((note) => {
      const index = this.campaigns.findIndex((campaign) => campaign.id === campaignId);
      this.campaigns[index].unapproved_reasons.push(note);
      this.noteTexts[campaignId] = '';
    });
  }

  updateNewsletterWithCampaign(campaignId) {
    this.campaignService.updateNewsletterWithCampaign(campaignId, this.newsletterId).subscribe((res) => {
      if (res) {
        const index = this.campaigns.findIndex((campaign) => campaign.id === campaignId);
        this.campaigns[index].newsletter_id = this.newsletterId;
        this.toasterService.successDialog('Campaign updated successfully');
      }
    });
  }
}
