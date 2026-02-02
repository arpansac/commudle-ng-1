import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef } from '@angular/core';
import {
  ICampaign,
  ECampaignStatus,
  EPurchaseOrderStatus,
  EDbModels,
  ECampaignTypeSlug,
} from '@commudle/shared-models';
import { CampaignService, NoteService, ToastrService } from '@commudle/shared-services';
import {
  faEdit,
  faReceipt,
  faArrowUpRightFromSquare,
  faSync,
  faFilter,
  faDownload,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { NbDialogService } from '@commudle/theme';
import * as moment from 'moment';
@Component({
    selector: 'commudle-campaign-list',
    templateUrl: './campaign-list.component.html',
    styleUrls: ['./campaign-list.component.scss'],
    standalone: false
})
export class CampaignListComponent implements OnChanges {
  @Input() campaigns: ICampaign[];
  @Input() isCampaignAdmin = false;
  @Output() refreshRequested = new EventEmitter<void>();
  moment = moment;
  icons = { faEdit, faReceipt, faArrowUpRightFromSquare, faSync, faFilter, faDownload, faTrash };
  ECampaignStatus = ECampaignStatus;
  ECampaignTypeSlug = ECampaignTypeSlug;

  EPurchaseOrderStatus = EPurchaseOrderStatus;
  noteTexts: { [campaignId: number]: string } = {};
  newsletterId: number | null;
  statusFilter: ECampaignStatus | null = null;
  // statusOptions = Object.values(ECampaignStatus) as ECampaignStatus[];

  constructor(
    private campaignService: CampaignService,
    private toasterService: ToastrService,
    private dialogService: NbDialogService,
    private noteService: NoteService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['campaigns'] && !changes['campaigns'].firstChange) {
      this.statusFilter = null;
    }
  }

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
      if (campaign.main_newsletter_id) {
        this.newsletterId = campaign.main_newsletter_id;
      } else {
        this.newsletterId = null;
      }
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

  updateNewsletterWithCampaign(campaignId) {
    this.campaignService.updateNewsletterWithCampaign(campaignId, Number(this.newsletterId)).subscribe((res) => {
      if (res) {
        const index = this.campaigns.findIndex((campaign) => campaign.id === campaignId);
        this.campaigns[index].main_newsletter_id = this.newsletterId;
        this.toasterService.successDialog('Campaign updated successfully');
      }
    });
  }

  resendPaymentLink(campaignId) {
    this.campaignService.resendPaymentLink(campaignId).subscribe((res) => {
      if (res) {
        this.toasterService.successDialog('Payment Link Sent');
      }
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

  // get filteredCampaigns(): ICampaign[] {
  //   if (!this.campaigns) return [];
  //   if (this.statusFilter == null) return this.campaigns;
  //   return this.campaigns.filter((c) => c.status === this.statusFilter);
  // }
}
