import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { IHackathonJudge, IRound, IRoundMentorSlot, IRoundMentorSlotBooking } from '@commudle/shared-models';
import { RoundMentorSlotService } from '@commudle/shared-services';
import { RoundMentorSlotBookingChannel } from 'apps/shared-components/services/websockets/round-mentor-slot-booking.channel';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'commudle-mentor-slot-list',
  templateUrl: './mentor-slot-list.component.html',
  styleUrl: './mentor-slot-list.component.scss',
  standalone: false,
})
export class MentorSlotListComponent implements OnInit, OnDestroy {
  @Input() round: IRound;
  @Input() mentor: IHackathonJudge;
  @Input() mentorId: number;
  @Output() slotClick = new EventEmitter<{ slot: IRoundMentorSlot; index: number }>();

  roundMentorSlots: IRoundMentorSlot[];
  private destroy$ = new Subject<void>();

  constructor(
    private roundMentorSlotService: RoundMentorSlotService,
    private cdr: ChangeDetectorRef,
    private roundMentorSlotBookingChannel: RoundMentorSlotBookingChannel,
  ) {}

  ngOnInit(): void {
    this.roundMentorSlotService
      .indexByRoundMentor(this.round.id, this.mentor.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((slots) => {
        this.roundMentorSlots = slots;
        this.cdr.markForCheck();
      });
    this.receivedChannelData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSlotClick(slot: IRoundMentorSlot, index: number): void {
    this.slotClick.emit({ slot, index });
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
          const existingIndex = slot.round_mentor_slot_bookings.findIndex((b) => b.id === booking.id);
          if (existingIndex !== -1) {
            slot.round_mentor_slot_bookings[existingIndex] = booking;
          } else {
            slot.round_mentor_slot_bookings = [booking, ...slot.round_mentor_slot_bookings];
          }
          this.roundMentorSlots = [...this.roundMentorSlots];
          this.cdr.markForCheck();
        }
        break;
      }
      case this.roundMentorSlotBookingChannel.ACTIONS.DESTROY: {
        const bookingId = data.booking_id;
        this.roundMentorSlots?.forEach((slot) => {
          slot.round_mentor_slot_bookings = slot.round_mentor_slot_bookings.filter((b) => b.id !== bookingId);
        });
        this.roundMentorSlots = [...this.roundMentorSlots];
        this.cdr.markForCheck();
        break;
      }
    }
  }
}
