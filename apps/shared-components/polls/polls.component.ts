import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NbWindowService } from '@commudle/theme';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import { TrackSlotsService } from 'apps/commudle-admin/src/app/services/track_slots.service';
import { ICurrentUser } from 'apps/shared-models/current_user.model';
import { EPollStatuses, IPoll } from 'apps/shared-models/poll.model';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { PollsService } from 'apps/shared-services/polls.service';
import { PollsChannel } from '../services/websockets/polls.channel';
import { Subject, takeUntil } from 'rxjs';
import { LoginAuthService } from 'apps/shared-services/login-auth.service';
import { EDbModels } from '@commudle/shared-models';

@Component({
  selector: 'commudle-polls',
  templateUrl: './polls.component.html',
  styleUrls: ['./polls.component.scss'],
})
export class PollsComponent implements OnInit, OnDestroy {
  @ViewChild('newPollTemplate') newPollTemplate: TemplateRef<any>;
  @ViewChild('fillPollTemplate') fillPollTemplate: TemplateRef<any>;

  @Input() pollableId: number;
  @Input() pollableType: EDbModels;

  allActions;
  currentUser: ICurrentUser;
  polls: IPoll[] = [];
  permittedActions = [];

  selectedPoll: IPoll;

  windowRefCreatePoll;
  windowRefFillPoll;

  private destroy$ = new Subject<void>();

  constructor(
    private pollsChannel: PollsChannel,
    private toastLogService: LibToastLogService,
    private authWatchService: LibAuthwatchService,
    private windowService: NbWindowService,
    private eventsService: EventsService,
    private trackSlotsService: TrackSlotsService,
    private loginAuthService: LoginAuthService,
    private pollsService: PollsService,
  ) {}

  login() {
    if (!this.currentUser) {
      this.loginAuthService.openLoginSignupTemplate();
    }
    return true;
  }

  ngOnInit() {
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => (this.currentUser = user));
    this.getPolls();
    this.allActions = this.pollsChannel.ACTIONS;
    this.pollsChannel.subscribe(this.pollableType, this.pollableId);
    this.receiveData();
  }

  ngOnDestroy(): void {
    this.pollsChannel.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  newPoll() {
    this.windowRefCreatePoll = this.windowService.open(this.newPollTemplate, { title: `New Poll` });
  }

  receiveData() {
    this.pollsChannel.channelData$.subscribe((data) => {
      if (data) {
        switch (data.action) {
          case this.pollsChannel.ACTIONS.SET_PERMISSIONS: {
            this.permittedActions = data.permitted_actions;
            break;
          }
          case this.pollsChannel.ACTIONS.CREATE: {
            if (this.windowRefCreatePoll) {
              this.windowRefCreatePoll.close();
            }
            const pollExists = this.polls.findIndex((p) => p.id === data.poll.id);
            if (pollExists === -1) {
              this.polls.unshift(data.poll);
            }
            break;
          }
          case this.pollsChannel.ACTIONS.START: {
            const pollIndex = this.polls.findIndex((p) => p.id === data.poll.id);
            if (this.polls[pollIndex].status !== EPollStatuses.OPEN) {
              this.polls[pollIndex].status = EPollStatuses.OPEN;
              this.selectedPoll = data.poll;
              if (this.currentUser && !this.polls[pollIndex].already_filled) {
                this.windowRefFillPoll = this.windowService.open(this.fillPollTemplate, { title: `Poll!` });
              }
            }

            break;
          }
          case this.pollsChannel.ACTIONS.START_SELF: {
            const pollIndex = this.polls.findIndex((p) => p.id === data.poll.id);
            this.polls[pollIndex].status = EPollStatuses.OPEN;
            this.selectedPoll = data.poll;
            if (this.currentUser && !this.polls[pollIndex].already_filled) {
              this.windowRefFillPoll = this.windowService.open(this.fillPollTemplate, { title: `Poll!` });
            }
            break;
          }
          case this.pollsChannel.ACTIONS.STOP: {
            this.polls[this.polls.findIndex((p) => p.id === data.poll_id)].status = EPollStatuses.CLOSED;
            if (this.windowRefFillPoll) {
              this.windowRefFillPoll.close();
            }
            break;
          }
          case this.pollsChannel.ACTIONS.DELETE: {
            this.polls.splice(
              this.polls.findIndex((p) => p.id === data.poll_id),
              1,
            );
            break;
          }
          case this.pollsChannel.ACTIONS.FILL: {
            this.polls[this.polls.findIndex((p) => p.id === data.poll_id)].already_filled = true;
            this.windowRefFillPoll.close();
            break;
          }
          case this.pollsChannel.ACTIONS.FILL_COUNT: {
            this.polls[this.polls.findIndex((p) => p.id === data.poll_id)].total_responses = data.fill_count;
            break;
          }
          case this.pollsChannel.ACTIONS.ERROR: {
            this.toastLogService.warningDialog(data.message, 2000);
            break;
          }
        }
      }
    });
  }

  getPolls() {
    if (this.pollableType === 'Event') {
      this.eventsService.getPolls(this.pollableId).subscribe((value) => {
        this.polls = value.polls;
      });
    } else {
      this.trackSlotsService.getPolls(this.pollableId).subscribe((value) => (this.polls = value.polls));
    }
  }

  create(pollData) {
    this.pollsService.create(pollData, this.pollableType, this.pollableId).subscribe({
      next: (poll) => {
        if (this.windowRefCreatePoll) {
          this.windowRefCreatePoll.close();
        }
        this.polls.unshift(poll);
        this.toastLogService.successDialog('Poll created successfully');
      },
      error: () => {
        this.toastLogService.warningDialog('Failed to create poll');
      },
    });
  }

  startPoll(pollId) {
    this.pollsChannel.sendData(this.pollsChannel.ACTIONS.START, {
      poll_id: pollId,
    });
  }

  startSelf(pollId) {
    this.pollsChannel.sendData(this.pollsChannel.ACTIONS.START_SELF, {
      poll_id: pollId,
    });
  }

  submitPoll(pollData) {
    this.pollsService.submitPoll(this.selectedPoll.id, pollData).subscribe({
      next: () => {
        this.toastLogService.successDialog('Poll submitted successfully');
        this.polls[this.polls.findIndex((p) => p.id === this.selectedPoll.id)].already_filled = true;
        if (this.windowRefFillPoll) {
          this.windowRefFillPoll.close();
        }
      },
      error: () => {
        this.toastLogService.warningDialog('Failed to submit poll');
      },
    });
  }

  stopPoll(pollId) {
    this.pollsChannel.sendData(this.pollsChannel.ACTIONS.STOP, {
      poll_id: pollId,
    });
  }

  deletePoll(pollId: number, index: number) {
    this.pollsService.delete(pollId, this.pollableType, this.pollableId).subscribe({
      next: () => {
        this.toastLogService.successDialog('Poll deleted successfully');
        this.polls.splice(index, 1);
      },
      error: () => {
        this.toastLogService.warningDialog('Failed to delete poll');
      },
    });
  }
}
