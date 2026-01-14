import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  TemplateRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { NbDialogService, NbToastrService } from '@commudle/theme';
import { IHackathonJudge, IHackathonTeam, IRound } from '@commudle/shared-models';
import { RoundMentorSlotService, ToastrService } from '@commudle/shared-services';

interface SlotAssignment {
  count: number;
  assignedTeams: IHackathonTeam[];
}

@Component({
  selector: 'commudle-mentor-slot-team-assignment',
  templateUrl: './mentor-slot-team-assignment.component.html',
  styleUrls: ['./mentor-slot-team-assignment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MentorSlotTeamAssignmentComponent implements OnInit {
  @Input() slotAssignment: SlotAssignment | null = null;
  @Input() round: IRound;
  @Input() mentor: IHackathonJudge;
  @Input() slotUUID: string;
  @Output() slotClick = new EventEmitter<void>();
  @Output() cancelSlot = new EventEmitter<void>();

  @ViewChild('cancelConfirmDialog') cancelConfirmDialog: TemplateRef<any>;

  readonly icons = { faPlus, faXmark };

  constructor(
    private dialogService: NbDialogService,
    private roundMentorSlotService: RoundMentorSlotService,
    private toastrService: ToastrService,
  ) {}

  ngOnInit() {
    this.roundMentorSlotService.indexByRoundMentor(this.round.id, this.mentor.id).subscribe((slots) => {
      console.log('Round mentor slots:', slots);
    });
  }

  onSlotClick(): void {
    this.slotClick.emit();
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
      },
    });
  }
}
