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
} from '@angular/core';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { NbDialogService } from '@commudle/theme';
import { IHackathonJudge, IRound, IRoundMentorSlot } from '@commudle/shared-models';
import { RoundMentorSlotService, ToastrService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-mentor-slot-team-assignment',
  templateUrl: './mentor-slot-team-assignment.component.html',
  styleUrls: ['./mentor-slot-team-assignment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MentorSlotTeamAssignmentComponent implements OnInit {
  @Input() round: IRound;
  @Input() mentor: IHackathonJudge;
  @Input() slotUUID: string;
  @Input() index: number;
  @Output() slotClick = new EventEmitter<IRoundMentorSlot>();
  @Output() cancelSlot = new EventEmitter<void>();

  roundMentorSlots: IRoundMentorSlot[];

  @ViewChild('cancelConfirmDialog') cancelConfirmDialog: TemplateRef<any>;

  readonly icons = { faPlus, faXmark };

  constructor(
    private dialogService: NbDialogService,
    private roundMentorSlotService: RoundMentorSlotService,
    private toastrService: ToastrService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.roundMentorSlotService.indexByRoundMentor(this.round.id, this.mentor.id).subscribe((slots) => {
      this.roundMentorSlots = slots;
      this.cdr.markForCheck();
    });
  }

  onSlotClick(): void {
    if (
      this.roundMentorSlots[this.index]?.round_mentor_slot_bookings?.length >=
      this.round.round_mentor_slot_rule.max_teams_per_slot
    ) {
      this.toastrService.warningDialog('This slot has reached maximum capacity');
      return;
    }
    this.slotClick.emit(this.roundMentorSlots[this.index] ? this.roundMentorSlots[this.index] : null);
  }

  onCancelSlot(event: Event): void {
    event.stopPropagation();
    this.dialogService.open(this.cancelConfirmDialog).onClose.subscribe((confirmed) => {
      if (confirmed) {
        this.createMentorSlot();
      }
    });
  }

  createMentorSlot(): void {
    const data = {
      round_mentor_slot_rule_id: this.round.round_mentor_slot_rule?.id,
      slot_uuid: this.slotUUID,
      round_id: this.round.id,
      round_mentor_slot: {
        hackathon_judge_id: this.mentor.id,
        status: 'cancelled_by_mentor',
      },
    };

    this.roundMentorSlotService.create(data).subscribe({
      next: () => {
        this.toastrService.successDialog('Slot was canceled');
        this.cdr.markForCheck();
      },
    });
  }
}
