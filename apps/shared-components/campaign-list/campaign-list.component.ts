import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICampaign, ECampaignStatus, EDbModels } from '@commudle/shared-models';
import { CampaignService, NoteService, ToastrService } from '@commudle/shared-services';
import { faEdit, faArrowUpRightFromSquare, faSync, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NbDialogService } from '@commudle/theme';
import * as moment from 'moment';
@Component({
    selector: 'commudle-campaign-list',
    templateUrl: './campaign-list.component.html',
    styleUrls: ['./campaign-list.component.scss'],
    standalone: false
})
export class CampaignListComponent {
  @Input() campaigns: ICampaign[];
  @Input() isCampaignAdmin = false;
  @Output() refreshRequested = new EventEmitter<void>();
  moment = moment;
  icons = { faEdit, faArrowUpRightFromSquare, faSync, faTrash };
  ECampaignStatus = ECampaignStatus;
  noteTexts: { [campaignId: number]: string } = {};
  // statusFilter: ECampaignStatus | null = null;
  // faFilter,

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
      this.dialogService.open(dialog, { context: { campaignId: campaign.id } });
    }
  }

  openDestroyCampaignPopup(dialog, campaign) {
    this.dialogService.open(dialog, { context: { campaign: campaign } });
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

  campaignUnapprovedChangesMail(campaignId) {
    this.campaignService.campaignUnapprovedChangesMail(campaignId).subscribe((res) => {
      if (res) {
        this.toasterService.successDialog('Mail Sent');
      }
    });
  }

  destroy(campaignId) {
    this.campaignService.destroy(campaignId).subscribe((res) => {
      if (res) {
        const index = this.campaigns.findIndex((campaign) => campaign.id === campaignId);
        this.campaigns.splice(index, 1);
        this.toasterService.successDialog('Campaign deleted successfully');
      }
    });
  }

  onRefresh() {
    this.refreshRequested.emit();
  }
}
