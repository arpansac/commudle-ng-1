import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EJudgeInvitationStatus, IHackathonJudge } from '@commudle/shared-models';
import { ToastrService } from '@commudle/shared-services';
import { HackathonJudgeService } from 'apps/commudle-admin/src/app/services/hackathon-judge.service';
import { NbDialogService } from '@commudle/theme';
import { faStickyNote, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { MentorNotesDialogComponent } from '../../mentor-notes-dialog/mentor-notes-dialog.component';

@Component({
  selector: 'commudle-hackathon-judge-card',
  templateUrl: './hackathon-judge-card.component.html',
  styleUrls: ['./hackathon-judge-card.component.scss'],
  standalone: false,
})
export class HackathonJudgeCardComponent {
  @Input() judge: IHackathonJudge;
  @Input() hackathonId: string;
  @Output() editJudgeEvent: EventEmitter<IHackathonJudge> = new EventEmitter();
  @Output() destroyJudgeEvent: EventEmitter<number> = new EventEmitter();
  EInvitationStatus = EJudgeInvitationStatus;
  icons = { faStickyNote, faEdit, faTrash };

  constructor(
    private hackathonJudgeService: HackathonJudgeService,
    private toastrService: ToastrService,
    private dialogService: NbDialogService,
  ) {}

  editJudge(judge) {
    this.editJudgeEvent.emit(judge);
  }
  deleteJudge(judgeId) {
    this.destroyJudgeEvent.emit(judgeId);
  }
  resendJudgeInvite() {
    this.hackathonJudgeService.resendJudgeInvite(this.judge.id).subscribe((data) => {
      if (data) {
        this.toastrService.successDialog('Invite for hackathon judge sent');
      }
    });
  }

  openNotesDialog(): void {
    this.dialogService.open(MentorNotesDialogComponent, {
      context: {
        mentor: this.judge,
        hackathonId: this.hackathonId,
      },
    });
  }
}
