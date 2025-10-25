/* eslint-disable @nx/enforce-module-boundaries */
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommunityChannelManagerService } from 'apps/commudle-admin/src/app/feature-modules/community-channels/services/community-channel-manager.service';
import { DiscussionsService } from 'apps/commudle-admin/src/app/services/discussions.service';
import { ICommunityChannel } from 'apps/shared-models/community-channel.model';
import { IDiscussion } from 'apps/shared-models/discussion.model';
import { Subject, takeUntil, finalize, catchError, of } from 'rxjs';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { NbDialogService } from '@commudle/theme';
import { CommunityChannelsService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-community-channel',
  templateUrl: './community-channel.component.html',
  styleUrls: ['./community-channel.component.scss'],
})
export class CommunityChannelComponent implements OnInit, OnDestroy, OnChanges {
  @Input() selectedChannelId: number;
  @Input() shareMessageUrl: string;
  selectedChannel: ICommunityChannel;
  discussion: IDiscussion;
  channelRoles = {};
  showMembersList = false;
  isLoading = true;
  notFound = false;

  faUsers = faUsers;
  private destroy$ = new Subject<void>();

  constructor(
    private communityChannelManagerService: CommunityChannelManagerService,
    private discussionsService: DiscussionsService,
    private nbDialogService: NbDialogService,
    private channelService: CommunityChannelsService,
  ) {}

  ngOnInit() {
    this.communityChannelManagerService.allChannelRoles$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.channelRoles = data;
    });

    if (this.selectedChannelId) {
      this.loadChannel();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedChannelId']) {
      this.selectedChannelId = Number(changes['selectedChannelId'].currentValue);
      this.loadChannel();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadChannel() {
    if (!this.selectedChannelId) {
      this.notFound = true;
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.notFound = false;

    this.channelService.showChannelForm(this.selectedChannelId).subscribe((selectedChannel) => {
      if (selectedChannel) {
        this.selectedChannel = selectedChannel;
        this.communityChannelManagerService.setChannel(selectedChannel);
        this.loadDiscussion();
      } else {
        this.notFound = true;
        this.isLoading = false;
      }
    });
  }

  private loadDiscussion() {
    this.discussionsService
      .pGetOrCreateForCommunityChannel(this.selectedChannelId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.notFound = true;
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe((data) => {
        if (data) {
          this.discussion = data;
          this.communityChannelManagerService.setCommunityListview(false);
        }
      });
  }

  toggleMembersList() {
    this.showMembersList = !this.showMembersList;
  }

  onLongPress(dialog) {
    this.nbDialogService.open(dialog);
  }
}
