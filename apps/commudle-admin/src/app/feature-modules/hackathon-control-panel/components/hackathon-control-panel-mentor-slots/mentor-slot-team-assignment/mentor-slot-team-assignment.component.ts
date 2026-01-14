import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { IHackathonTeam } from '@commudle/shared-models';

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
export class MentorSlotTeamAssignmentComponent {
  @Input() slotAssignment: SlotAssignment | null = null;
  @Output() slotClick = new EventEmitter<void>();

  readonly icons = { faPlus };

  onSlotClick(): void {
    this.slotClick.emit();
  }
}
