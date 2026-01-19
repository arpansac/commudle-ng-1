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

  cancelMentorSlot(): void {
    // TODO: call api and get data from anycable and disable add team button in case of slot was cancel
  }
}
