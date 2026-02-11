import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NbDialogService } from '@commudle/theme';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { EventCollaborationCommunitiesService } from 'apps/commudle-admin/src/app/services/event-collaboration-communities.service';
import {
  IEventCollaborationCommunity,
  EEventCollaborationCommunityStatus,
} from 'apps/shared-models/event_collaboration_community.model';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { SeoService } from '@commudle/shared-services';
import { ICommunity, IEvent } from '@commudle/shared-models';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-collaborating-communities',
    templateUrl: './collaborating-communities.component.html',
    styleUrls: ['./collaborating-communities.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CollaboratingCommunitiesComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() community: ICommunity;
  @Input() event: IEvent;

  @ViewChild('autoInput') input;
  @ViewChild('collaborationConfirmation') collaborationConfirmationDialog;
  EEventCollaborationCommunityStatus = EEventCollaborationCommunityStatus;
  communities: ICommunity[];
  selectedCommunity = '';
  typing = false;

  collaborationCommunities: IEventCollaborationCommunity[] = [];

  faInfoCircle = faInfoCircle;

  subscriptions: Subscription[] = [];

  constructor(
    private eventCollaborationCommunitiesService: EventCollaborationCommunitiesService,
    private toastLogService: LibToastLogService,
    private communitiesService: CommunitiesService,
    private changeDetectorRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private dialogService: NbDialogService,
    private seoService: SeoService,
  ) {}

  ngOnInit() {
    this.seoService.noIndex(true);
    this.communities = [];
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((data) => {
        this.community = data.community;
        this.event = data.event;
        this.getCollaborations();
        this.setMeta();
      }),
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.input) {
        this.input.nativeElement.focus();
      }
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.community && this.event) {
      this.getCollaborations();
    }
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  onSelectionChange($event) {
    this.openConfirmationBox($event.id);
    // this.createCollaboration($event.id);
    this.selectedCommunity = '';
    this.input.nativeElement.value = '';
    this.communities = [];
  }

  onChange() {
    return this.communitiesService.searchByName(this.input.nativeElement.value).subscribe((data) => {
      this.communities = data;
      this.changeDetectorRef.markForCheck();
    });
  }

  getCollaborations() {
    this.eventCollaborationCommunitiesService.get(this.event.id).subscribe((data) => {
      this.collaborationCommunities = data.event_collaboration_communities;
      this.changeDetectorRef.markForCheck();
    });
  }

  createCollaboration(selectedCommunityId) {
    this.eventCollaborationCommunitiesService.create(this.event.id, selectedCommunityId).subscribe((data) => {
      this.collaborationCommunities.push(data);
      this.toastLogService.successDialog('Collaboration request sent to the primary email of all organizers');
      this.changeDetectorRef.markForCheck();
    });
  }

  removeCollaboration(collaborationCommunityId, index) {
    this.eventCollaborationCommunitiesService.destroy(collaborationCommunityId).subscribe((data) => {
      this.collaborationCommunities.splice(index, 1);
      this.toastLogService.successDialog('Collaboration removed!');
      this.changeDetectorRef.markForCheck();
    });
  }

  resendConfirmationEmail(collaborationCommunityId) {
    // this.eventCollaborationCommunitiesService.resendInvitationMail(collaborationCommunityId).subscribe((data) => {
    //   this.toastLogService.successDialog('Collaboration request email resent!');
    //   this.changeDetectorRef.markForCheck();
    // });
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
    this.seoService.setTitle(`Collaborations | Dashboard | ${this.event.name} | ${this.community.name}`);
  }
}
