import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ICampaign, ECampaignStatus, EDbModels, ICampaignStats } from '@commudle/shared-models';
import { CampaignService, NoteService, ToastrService } from '@commudle/shared-services';
import { faEdit, faArrowRight, faSync, faTrash, faFilter } from '@fortawesome/free-solid-svg-icons';
import { NbDialogService } from '@commudle/theme';
import * as moment from 'moment';
// import { forkJoin, Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

@Component({
    selector: 'commudle-campaign-list',
    templateUrl: './campaign-list.component.html',
    styleUrls: ['./campaign-list.component.scss'],
    standalone: false
})
export class CampaignListComponent implements OnChanges {
  @Input() campaigns: ICampaign[];
  @Input() isCampaignAdmin = false;
  @Input() isLoading = false;
  @Input() selectedStatus: ECampaignStatus | null = null;
  @Output() refreshRequested = new EventEmitter<ECampaignStatus | null>();
  moment = moment;
  icons = { faEdit, faArrowRight, faSync, faTrash, faFilter };
  ECampaignStatus = ECampaignStatus;
  readonly adminStatusOptions: ECampaignStatus[] = [
    ECampaignStatus.PAUSED,
    ECampaignStatus.STOPPED,
    ECampaignStatus.RESUMED,
  ];
  noteTexts: { [campaignId: string]: string } = {};
  statusFilter: ECampaignStatus | null = null;
  statsUserCampaigns: ICampaignStats;
  // statsOverview: ICampaignStats;
  statsOverview: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedStatus']) {
      this.statusFilter = this.selectedStatus;
    }
    if (changes['campaigns'] && this.campaigns?.length) {
      // Loop through campaigns here once
      this.campaigns.forEach((campaign) => {
        if (this.statsOverview[campaign.id]) return;
        this.campaignService.getStatsOverview(campaign.id).subscribe((stats: ICampaignStats) => {
          this.statsOverview[campaign.id] = stats;
        });
      });
    }
  }

  constructor(
    private campaignService: CampaignService,
    private toasterService: ToastrService,
    private dialogService: NbDialogService,
    private noteService: NoteService,
  ) {}

  ngOnInit(): void {
    this.getUserCampaignsStats();
  }

  // private loadStatsOverview(): void {
  //   if (!this.campaigns?.length) return;
  //   const sources: Record<string, Observable<{ campaign: ICampaign; stats: ICampaignStats }>> = {};
  //   this.campaigns.forEach((campaign, i) => {
  //     sources[i] = this.campaignService.getStatsOverview(campaign.id).pipe(map((stats) => ({ campaign, stats })));
  //   });
  //   forkJoin(sources).subscribe((results) =>
  //     Object.entries(results).forEach(([i, r]) => (this.campaigns[+i].statsOverview = r.stats)),
  //   );
  // }

  getStatusOptionsForCampaign(campaign: ICampaign): ECampaignStatus[] {
    if (campaign?.status === ECampaignStatus.LIVE) {
      return [ECampaignStatus.PAUSED, ECampaignStatus.STOPPED];
    }
    if (campaign?.status === ECampaignStatus.PAUSED) {
      return [ECampaignStatus.RESUMED];
    }
    return [];
  }

  updateStatus(value, campaignId, index) {
    if (value === ECampaignStatus.PAUSED) {
      this.campaignService.campaignAdminUpdateStatusPause(campaignId).subscribe((res) => {
        if (res) {
          this.campaigns[index] = { ...this.campaigns[index], status: ECampaignStatus.PAUSED };
          this.toasterService.successDialog('Campaign status updated successfully');
        }
      });
    } else if (value === ECampaignStatus.STOPPED) {
      this.campaignService.campaignAdminUpdateStatusStop(campaignId).subscribe((res) => {
        if (res) {
          this.campaigns[index] = { ...this.campaigns[index], status: ECampaignStatus.STOPPED };
          this.toasterService.successDialog('Campaign status updated successfully');
        }
      });
    } else if (value === ECampaignStatus.RESUMED) {
      this.campaignService.campaignAdminUpdateStatusResume(campaignId).subscribe((res) => {
        if (res) {
          this.campaigns[index] = { ...this.campaigns[index], status: ECampaignStatus.RESUMED };
          this.toasterService.successDialog('Campaign status updated successfully');
        }
      });
    }
  }
  openPopup(dialog, campaign) {
    if (this.isCampaignAdmin) {
      this.dialogService.open(dialog, { context: { campaign } });
    }
  }

  // openDestroyCampaignPopup(dialog, campaign) {
  //   this.dialogService.open(dialog, { context: { campaign: campaign } });
  // }

  updateNotes(campaignId: string) {
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

  // destroy(campaignId) {
  //   this.campaignService.destroy(campaignId).subscribe((res) => {
  //     if (res) {
  //       const index = this.campaigns.findIndex((campaign) => campaign.id === campaignId);
  //       this.campaigns.splice(index, 1);
  //       this.toasterService.successDialog('Campaign deleted successfully');
  //     }
  //   });
  // }

  onRefresh() {
    this.refreshRequested.emit(this.statusFilter);
  }

  onFilterChange(event: ECampaignStatus) {
    this.statusFilter = event;
    this.refreshRequested.emit(this.statusFilter);
  }

  getUserCampaignsStats() {
    this.campaignService.getUserCampaignsStats().subscribe((stats: ICampaignStats) => {
      this.statsUserCampaigns = stats;
    });
  }
}
