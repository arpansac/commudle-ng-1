import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
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

/** Optional per-campaign stats when API returns them (e.g. from dashboard index). */
export interface ICampaignWithStats extends ICampaign {
  impressions?: number;
  clicks?: number;
  ctr?: number;
  ecpm?: number;
}

/** Aggregate KPIs for the list header (optional; computed from campaigns when not provided). */
export interface ICampaignListStats {
  totalImpressions: number;
  totalSpendings: number;
  ctr: number;
  ecpm: number;
}

@Component({
    selector: 'commudle-campaign-list',
    templateUrl: './campaign-list.component.html',
    styleUrls: ['./campaign-list.component.scss'],
    standalone: false
})
export class CampaignListComponent {
  @Input() campaigns: ICampaign[] = [];
  @Input() isCampaignAdmin = false;
  /** Optional aggregate stats; when not set, KPIs are computed from campaigns. */
  @Input() stats: ICampaignListStats | null = null;

  @Output() refreshRequested = new EventEmitter<void>();
  @Output() filterClicked = new EventEmitter<void>();
  @Output() exportCsvClicked = new EventEmitter<void>();

  moment = moment;
  icons = {
    faEdit,
    faReceipt,
    faArrowUpRightFromSquare,
    faSync,
    faFilter,
    faDownload,
    faTrash,
  };
  ECampaignStatus = ECampaignStatus;
  ECampaignTypeSlug = ECampaignTypeSlug;
  EPurchaseOrderStatus = EPurchaseOrderStatus;

  selectedCampaignIds = new Set<number>();
  noteTexts: { [campaignId: number]: string } = {};
  newsletterId: number | null = null;

  constructor(
    private campaignService: CampaignService,
    private toasterService: ToastrService,
    private dialogService: NbDialogService,
    private noteService: NoteService,
  ) {}

  get totalImpressions(): number {
    if (this.stats != null) return this.stats.totalImpressions;
    return (this.campaigns || []).reduce((sum, c) => sum + this.getCampaignImpressions(c), 0);
  }

  get totalSpendings(): number {
    if (this.stats != null) return this.stats.totalSpendings;
    return (this.campaigns || []).reduce((sum, c) => sum + (c.budget ?? 0), 0);
  }

  get overallCtr(): number {
    if (this.stats != null) return this.stats.ctr;
    const totalImpressions = this.totalImpressions;
    const totalClicks = (this.campaigns || []).reduce((sum, c) => sum + this.getCampaignClicks(c), 0);
    if (totalImpressions === 0) return 0;
    return (totalClicks / totalImpressions) * 100;
  }

  get ecpm(): number {
    if (this.stats != null) return this.stats.ecpm;
    const totalImpressions = this.totalImpressions;
    if (totalImpressions === 0) return 0;
    return (this.totalSpendings / totalImpressions) * 1000;
  }

  get totalClicks(): number {
    return (this.campaigns || []).reduce((sum, c) => sum + this.getCampaignClicks(c), 0);
  }

  getCampaignImpressions(campaign: ICampaign): number {
    return (campaign as ICampaignWithStats).impressions ?? 0;
  }

  getCampaignClicks(campaign: ICampaign): number {
    return (campaign as ICampaignWithStats).clicks ?? 0;
  }

  getCampaignCtr(campaign: ICampaign): number {
    const withStats = campaign as ICampaignWithStats;
    if (withStats.ctr != null) return withStats.ctr;
    const imp = this.getCampaignImpressions(campaign);
    const clicks = this.getCampaignClicks(campaign);
    return imp === 0 ? 0 : (clicks / imp) * 100;
  }

  getStatusLabel(status: ECampaignStatus): string {
    switch (status) {
      case ECampaignStatus.LIVE:
        return 'Active';
      case ECampaignStatus.APPROVED:
        return 'Paused';
      case ECampaignStatus.SUBMITTED:
      case ECampaignStatus.CHANGES_REQUIRED:
        return 'Under Review';
      case ECampaignStatus.COMPLETE:
        return 'Completed';
      case ECampaignStatus.REJECTED:
        return 'Rejected';
      case ECampaignStatus.DRAFT:
        return 'Draft';
      case ECampaignStatus.INCOMPLETE:
        return 'Incomplete';
      default:
        return (status as string) || '';
    }
  }

  getStatusBadgeStatus(status: ECampaignStatus): string {
    switch (status) {
      case ECampaignStatus.LIVE:
        return 'info';
      case ECampaignStatus.APPROVED:
        return 'warning';
      case ECampaignStatus.SUBMITTED:
      case ECampaignStatus.CHANGES_REQUIRED:
        return 'basic';
      case ECampaignStatus.COMPLETE:
        return 'success';
      case ECampaignStatus.REJECTED:
        return 'danger';
      default:
        return 'basic';
    }
  }

  canShowToggle(campaign: ICampaign): boolean {
    return true;
    // return campaign.status === ECampaignStatus.LIVE || campaign.status === ECampaignStatus.APPROVED;
  }

  isToggleChecked(campaign: ICampaign): boolean {
    return campaign.status === ECampaignStatus.LIVE;
  }

  onToggleChange(campaign: ICampaign, checked: boolean): void {
    const newStatus = checked ? ECampaignStatus.LIVE : ECampaignStatus.APPROVED;
    if (!this.isCampaignAdmin) return;
    this.campaignService.campaignAdminUpdateStatus(campaign.id, newStatus).subscribe((res) => {
      const index = this.campaigns.findIndex((c) => c.id === campaign.id);
      if (index !== -1) this.campaigns[index] = res;
      this.toasterService.successDialog('Campaign status updated successfully');
    });
  }

  isSelected(campaign: ICampaign): boolean {
    return this.selectedCampaignIds.has(campaign.id);
  }

  toggleSelect(campaign: ICampaign): void {
    if (this.selectedCampaignIds.has(campaign.id)) {
      this.selectedCampaignIds.delete(campaign.id);
    } else {
      this.selectedCampaignIds.add(campaign.id);
    }
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      (this.campaigns || []).forEach((c) => this.selectedCampaignIds.add(c.id));
    } else {
      this.selectedCampaignIds.clear();
    }
  }

  isAllSelected(): boolean {
    const list = this.campaigns || [];
    return list.length > 0 && list.every((c) => this.selectedCampaignIds.has(c.id));
  }

  showActions(campaign: ICampaign): boolean {
    return (
      !this.isCampaignAdmin &&
      (campaign.status === ECampaignStatus.CHANGES_REQUIRED ||
        campaign.status === ECampaignStatus.SUBMITTED ||
        campaign.status === ECampaignStatus.REJECTED)
    );
  }

  onRefresh(): void {
    this.refreshRequested.emit();
  }

  onFilter(): void {
    this.filterClicked.emit();
  }

  onExportCsv(): void {
    this.exportCsvClicked.emit();
  }

  formatNumber(value: number): string {
    return value.toLocaleString();
  }

  formatCtr(value: number): string {
    return value.toFixed(3) + '%';
  }

  formatCurrency(value: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }

  updateStatus(event: Event, campaignId: number): void {
    const value = (event.target as HTMLSelectElement).value as ECampaignStatus;
    this.campaignService.campaignAdminUpdateStatus(campaignId, value).subscribe((res) => {
      const index = this.campaigns.findIndex((c) => c.id === campaignId);
      if (index !== -1) this.campaigns[index] = res;
      this.toasterService.successDialog('Campaign status updated successfully');
    });
  }

  openPopup(dialog: TemplateRef<{ campaignId: number }>, campaign: ICampaign): void {
    if (this.isCampaignAdmin) {
      this.newsletterId = campaign.main_newsletter_id ?? null;
      this.dialogService.open(dialog, { context: { campaignId: campaign.id } });
    }
  }

  openDestroyCampaignPopup(dialog: TemplateRef<{ campaign: ICampaign }>, campaign: ICampaign): void {
    this.dialogService.open(dialog, { context: { campaign } });
  }

  updateNotes(campaignId: number): void {
    if (!this.noteTexts[campaignId]) return;
    const formData = new FormData();
    formData.append('note[text]', this.noteTexts[campaignId]);
    this.noteService.createNote(formData, EDbModels.CAMPAIGN, campaignId).subscribe((note) => {
      const index = this.campaigns.findIndex((c) => c.id === campaignId);
      if (index !== -1 && this.campaigns[index].unapproved_reasons) {
        this.campaigns[index].unapproved_reasons!.push(note);
      }
      this.noteTexts[campaignId] = '';
    });
  }

  updateNewsletterWithCampaign(campaignId: number): void {
    this.campaignService.updateNewsletterWithCampaign(campaignId, Number(this.newsletterId)).subscribe((res) => {
      const index = this.campaigns.findIndex((c) => c.id === campaignId);
      if (index !== -1) this.campaigns[index].main_newsletter_id = this.newsletterId ?? undefined;
      this.toasterService.successDialog('Campaign updated successfully');
    });
  }

  resendPaymentLink(campaignId: number): void {
    this.campaignService.resendPaymentLink(campaignId).subscribe(() => {
      this.toasterService.successDialog('Payment Link Sent');
    });
  }

  campaignUnapprovedChangesMail(campaignId: number): void {
    this.campaignService.campaignUnapprovedChangesMail(campaignId).subscribe(() => {
      this.toasterService.successDialog('Mail Sent');
    });
  }

  destroy(campaignId: number): void {
    this.campaignService.destroy(campaignId).subscribe((res) => {
      if (res) {
        const index = this.campaigns.findIndex((c) => c.id === campaignId);
        if (index !== -1) this.campaigns.splice(index, 1);
        this.selectedCampaignIds.delete(campaignId);
        this.toasterService.successDialog('Campaign deleted successfully');
      }
    });
  }
}

// @Input() campaigns: ICampaign[];
//   @Input() isCampaignAdmin = false;
//   moment = moment;
//   icons = { faEdit, faReceipt, faArrowUpRightFromSquare };
//   ECampaignStatus = ECampaignStatus;
//   ECampaignTypeSlug = ECampaignTypeSlug;

//   EPurchaseOrderStatus = EPurchaseOrderStatus;
//   noteTexts: { [campaignId: number]: string } = {};
//   newsletterId: number | null;
//   constructor(
//     private campaignService: CampaignService,
//     private toasterService: ToastrService,
//     private dialogService: NbDialogService,
//     private noteService: NoteService,
//   ) {}

//   updateStatus(event, campaignId) {
//     this.campaignService.campaignAdminUpdateStatus(campaignId, event.target.value).subscribe((res) => {
//       if (res) {
//         const index = this.campaigns.findIndex((campaign) => campaign.id === campaignId);
//         this.campaigns[index] = res;
//         this.toasterService.successDialog('Campaign status updated successfully');
//       }
//     });
//   }

//   openPopup(dialog, campaign) {
//     if (this.isCampaignAdmin) {
//       if (campaign.main_newsletter_id) {
//         this.newsletterId = campaign.main_newsletter_id;
//       } else {
//         this.newsletterId = null;
//       }
//       this.dialogService.open(dialog, { context: { campaignId: campaign.id } });
//     }
//   }

//   openDestroyCampaignPopup(dialog, campaign) {
//     this.dialogService.open(dialog, { context: { campaign: campaign } });
//   }

//   updateNotes(campaignId: number) {
//     if (!this.noteTexts[campaignId]) return; // Prevent empty submissions

//     const formData = new FormData();
//     formData.append('note[text]', this.noteTexts[campaignId]);
//     this.noteService.createNote(formData, EDbModels.CAMPAIGN, campaignId).subscribe((note) => {
//       const index = this.campaigns.findIndex((campaign) => campaign.id === campaignId);
//       this.campaigns[index].unapproved_reasons.push(note);
//       this.noteTexts[campaignId] = '';
//     });
//   }

//   updateNewsletterWithCampaign(campaignId) {
//     this.campaignService.updateNewsletterWithCampaign(campaignId, Number(this.newsletterId)).subscribe((res) => {
//       if (res) {
//         const index = this.campaigns.findIndex((campaign) => campaign.id === campaignId);
//         this.campaigns[index].main_newsletter_id = this.newsletterId;
//         this.toasterService.successDialog('Campaign updated successfully');
//       }
//     });
//   }

//   resendPaymentLink(campaignId) {
//     this.campaignService.resendPaymentLink(campaignId).subscribe((res) => {
//       if (res) {
//         this.toasterService.successDialog('Payment Link Sent');
//       }
//     });
//   }

//   campaignUnapprovedChangesMail(campaignId) {
//     this.campaignService.campaignUnapprovedChangesMail(campaignId).subscribe((res) => {
//       if (res) {
//         this.toasterService.successDialog('Mail Sent');
//       }
//     });
//   }

//   destroy(campaignId) {
//     this.campaignService.destroy(campaignId).subscribe((res) => {
//       if (res) {
//         const index = this.campaigns.findIndex((campaign) => campaign.id === campaignId);
//         this.campaigns.splice(index, 1);
//         this.toasterService.successDialog('Campaign deleted successfully');
//       }
//     });
//   }
// }
