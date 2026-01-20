import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  TemplateRef,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { NbDialogService } from '@commudle/theme';
import {
  ERoundMentorSlotStatus,
  IHackathonJudge,
  IRound,
  IRoundMentorSlot,
  IRoundMentorSlotBooking,
} from '@commudle/shared-models';
import { RoundMentorSlotService, ToastrService } from '@commudle/shared-services';
import { RoundMentorSlotBookingChannel } from 'apps/shared-components/services/websockets/round-mentor-slot-booking.channel';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'commudle-mentor-slot-team-assignment',
  templateUrl: './mentor-slot-team-assignment.component.html',
  styleUrls: ['./mentor-slot-team-assignment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MentorSlotTeamAssignmentComponent implements OnInit, OnDestroy {
  @Input() round: IRound;
  @Input() mentor: IHackathonJudge;
  @Input() index: number;
  @Output() slotClick = new EventEmitter<IRoundMentorSlot>();
  @Output() cancelSlot = new EventEmitter<void>();

  roundMentorSlots: IRoundMentorSlot[];
  isSlotCancelled = false;

  @ViewChild('cancelConfirmDialog') cancelConfirmDialog: TemplateRef<any>;

  readonly icons = { faPlus, faXmark };
  private destroy$ = new Subject<void>();

  constructor(
    private dialogService: NbDialogService,
    private roundMentorSlotService: RoundMentorSlotService,
    private toastrService: ToastrService,
    private cdr: ChangeDetectorRef,
    private roundMentorSlotBookingChannel: RoundMentorSlotBookingChannel,
  ) {}

  ngOnInit() {
    this.roundMentorSlotService.indexByRoundMentor(this.round.id, this.mentor.id).subscribe((slots) => {
      this.roundMentorSlots = slots;
      this.isSlotCancelled = slots[this.index]?.status === ERoundMentorSlotStatus.CANCELLED;
      this.cdr.markForCheck();
    });
    this.receivedChannelData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSlotClick(): void {
    if (this.isSlotCancelled) return;

    if (
      this.roundMentorSlots[this.index]?.round_mentor_slot_bookings?.length >=
      this.round.round_mentor_slot_rule.max_teams_per_slot
    ) {
      this.toastrService.warningDialog('This slot has reached maximum capacity');
      return;
    }
    this.slotClick.emit(this.roundMentorSlots[this.index]);
  }

  onCancelSlot(event: Event): void {
    event.stopPropagation();
    this.dialogService.open(this.cancelConfirmDialog).onClose.subscribe((confirmed) => {
      if (confirmed) {
        this.cancelMentorSlot();
      }
    });
  }

  private receivedChannelData() {
    this.roundMentorSlotBookingChannel.channelData$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        this.handleChannelData(data);
      }
    });
  }

  private handleChannelData(data: any): void {
    switch (data.action) {
      case this.roundMentorSlotBookingChannel.ACTIONS.BOOK:
      case this.roundMentorSlotBookingChannel.ACTIONS.CANCEL: {
        const booking: IRoundMentorSlotBooking = data.booking;
        const slot = this.roundMentorSlots?.find((s) => s.id === booking.round_mentor_slot_id);
        if (slot) {
          slot.round_mentor_slot_bookings.unshift(booking);
          this.cdr.markForCheck();
        }
        break;
      }
    }
  }

  cancelMentorSlot(): void {
    const slot = this.roundMentorSlots[this.index];
    if (!slot) return;

    this.roundMentorSlotService
      .updateStatus(slot.id, ERoundMentorSlotStatus.CANCELLED)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSlotCancelled = true;
          this.toastrService.successDialog('Slot cancelled successfully');
          this.cdr.markForCheck();
          this.cancelSlot.emit();
        },
      });
  }
}
