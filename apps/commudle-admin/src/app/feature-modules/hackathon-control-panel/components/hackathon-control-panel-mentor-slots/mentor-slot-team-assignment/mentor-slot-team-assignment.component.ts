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
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { faPlus, faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';
import { NbDialogService } from '@commudle/theme';
import { ERoundMentorSlotStatus, IHackathonJudge, IRound, IRoundMentorSlot } from '@commudle/shared-models';
import { RoundMentorSlotService, ToastrService } from '@commudle/shared-services';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'commudle-mentor-slot-team-assignment',
  templateUrl: './mentor-slot-team-assignment.component.html',
  styleUrls: ['./mentor-slot-team-assignment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MentorSlotTeamAssignmentComponent implements OnInit, OnChanges, OnDestroy {
  @Input() round: IRound;
  @Input() mentor: IHackathonJudge;
  @Input() index: number;
  @Input() roundMentorSlots: IRoundMentorSlot[];
  @Output() slotClick = new EventEmitter<IRoundMentorSlot>();
  @Output() cancelSlot = new EventEmitter<void>();

  isSlotCancelled = false;

  @ViewChild('cancelConfirmDialog') cancelConfirmDialog: TemplateRef<any>;
  @ViewChild('activateConfirmDialog') activateConfirmDialog: TemplateRef<any>;

  readonly icons = { faPlus, faXmark, faCheck };
  private destroy$ = new Subject<void>();

  constructor(
    private dialogService: NbDialogService,
    private roundMentorSlotService: RoundMentorSlotService,
    private toastrService: ToastrService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.isSlotCancelled =
      this.roundMentorSlots?.[this.index]?.status === ERoundMentorSlotStatus.CANCELLED ||
      this.roundMentorSlots?.[this.index]?.status === ERoundMentorSlotStatus.CANCELLED_BY_MENTOR;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roundMentorSlots']) {
      this.isSlotCancelled =
        this.roundMentorSlots?.[this.index]?.status === ERoundMentorSlotStatus.CANCELLED ||
        this.roundMentorSlots?.[this.index]?.status === ERoundMentorSlotStatus.CANCELLED_BY_MENTOR;
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSlotClick(): void {
    if (this.isSlotCancelled) return;
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

  onActivateSlot(event: Event): void {
    event.stopPropagation();
    this.dialogService.open(this.activateConfirmDialog).onClose.subscribe((confirmed) => {
      if (confirmed) {
        this.activateMentorSlot();
      }
    });
  }

  activateMentorSlot(): void {
    const slot = this.roundMentorSlots[this.index];
    if (!slot) return;

    this.roundMentorSlotService
      .updateStatus(slot.id, ERoundMentorSlotStatus.OPEN)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSlotCancelled = false;
          this.toastrService.successDialog('Slot activated successfully');
          this.cdr.markForCheck();
          this.cancelSlot.emit();
        },
      });
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
