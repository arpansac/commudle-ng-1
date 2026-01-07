import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EJudgeInvitationStatus, IHackathonJudge } from '@commudle/shared-models';
import { ToastrService } from '@commudle/shared-services';
import { HackathonJudgeService } from 'apps/commudle-admin/src/app/services/hackathon-judge.service';

@Component({
  selector: 'commudle-hackathon-judge-card',
  templateUrl: './hackathon-judge-card.component.html',
  styleUrls: ['./hackathon-judge-card.component.scss'],
})
export class HackathonJudgeCardComponent {
  @Input() judge: IHackathonJudge;
  @Output() editJudgeEvent: EventEmitter<IHackathonJudge> = new EventEmitter();
  @Output() destroyJudgeEvent: EventEmitter<number> = new EventEmitter();
  EInvitationStatus = EJudgeInvitationStatus;
  constructor(private hackathonJudgeService: HackathonJudgeService, private toastrService: ToastrService) {}

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
}
