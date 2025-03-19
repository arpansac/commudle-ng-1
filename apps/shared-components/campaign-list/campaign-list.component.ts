import { Component, Input } from '@angular/core';
import { ICampaign, ECampaignStatus, EPurchaseOrderStatus, EDbModels } from '@commudle/shared-models';
import { CampaignService, NoteService, ToastrService } from '@commudle/shared-services';
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

  EPurchaseOrderStatus = EPurchaseOrderStatus;
  noteTexts: { [campaignId: number]: string } = {};

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

  openPopup(dialog, campaignId) {
    this.dialogService.open(dialog, { context: campaignId });
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
}
