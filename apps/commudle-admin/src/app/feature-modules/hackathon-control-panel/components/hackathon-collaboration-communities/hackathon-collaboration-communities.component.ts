import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbDialogService } from '@commudle/theme';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { HackathonCollaborationCommunitiesService, SeoService, ToastrService } from '@commudle/shared-services';
import {
  EHackathonCollaborationCommunityStatus,
  ICommunity,
  IHackathon,
  IHackathonCollaborationCommunity,
} from '@commudle/shared-models';
import { Subscription } from 'rxjs';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';

@Component({
  selector: 'commudle-hackathon-collaboration-communities',
  templateUrl: './hackathon-collaboration-communities.component.html',
  styleUrls: ['./hackathon-collaboration-communities.component.scss'],
})
export class HackathonCollaborationCommunitiesComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() hackathon: IHackathon;

  @ViewChild('autoInput') input;
  @ViewChild('collaborationConfirmation') collaborationConfirmationDialog;
  EHackathonCollaborationCommunityStatus = EHackathonCollaborationCommunityStatus;
  communities: ICommunity[];
  selectedCommunity = '';
  typing = false;

  collaborationCommunities: IHackathonCollaborationCommunity[] = [];

  faInfoCircle = faInfoCircle;

  subscriptions: Subscription[] = [];
  private hackathonSlug = '';

  constructor(
    private hackathonCollaborationCommunitiesService: HackathonCollaborationCommunitiesService,
    private toastLogService: ToastrService,
    private communitiesService: CommunitiesService,
    private activatedRoute: ActivatedRoute,
    private dialogService: NbDialogService,
    private seoService: SeoService,
    private hackathonService: HackathonService,
  ) {}

  ngOnInit() {
    this.seoService.noIndex(true);

    this.subscriptions.push(
      this.activatedRoute.parent.paramMap.subscribe((params) => {
        this.hackathonSlug = params.get('hackathon_id');
        this.fetchHackathon();
      }),
    );
  }

  fetchHackathon() {
    this.hackathonService.showHackathon(this.hackathonSlug).subscribe((data) => {
      this.hackathon = data;
      this.getCollaborations();
      this.setMeta();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.input) {
        this.input.nativeElement.focus();
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onSelectionChange($event) {
    this.openConfirmationBox($event.id);
    this.selectedCommunity = '';
    this.input.nativeElement.value = '';
    this.communities = [];
  }

  onChange() {
    return this.communitiesService.searchByName(this.input.nativeElement.value).subscribe((data) => {
      this.communities = data;
    });
  }

  getCollaborations() {
    this.hackathonCollaborationCommunitiesService.get(this.hackathon.id).subscribe((data) => {
      this.collaborationCommunities = data;
    });
  }

  createCollaboration(selectedCommunityId) {
    this.hackathonCollaborationCommunitiesService.create(this.hackathon.id, selectedCommunityId).subscribe((data) => {
      this.collaborationCommunities.push(data);
      this.toastLogService.successDialog('Collaboration request sent to the primary email of all organizers');
    });
  }

  removeCollaboration(collaborationCommunityId, index) {
    this.hackathonCollaborationCommunitiesService.destroy(collaborationCommunityId).subscribe((data) => {
      if (data) {
        this.collaborationCommunities.splice(index, 1);
        this.toastLogService.successDialog('Collaboration removed!');
      }
    });
  }

  resendConfirmationEmail(collaborationCommunityId) {
    this.hackathonCollaborationCommunitiesService.resendInvitationMail(collaborationCommunityId).subscribe((data) => {
      if (data) {
        this.toastLogService.successDialog('Collaboration request email resent!');
      }
    });
  }

  checkTyping() {
    this.typing = this.input.nativeElement.value.length > 2;
  }

  openConfirmationBox(communityId) {
    this.dialogService.open(this.collaborationConfirmationDialog, {
      context: {
        communityId: communityId,
      },
    });
  }

  setMeta() {
    // this.seoService.setTitle(`Collaborations | Dashboard | ${this.hackathon.name} | ${this.community.name}`);
  }
}
