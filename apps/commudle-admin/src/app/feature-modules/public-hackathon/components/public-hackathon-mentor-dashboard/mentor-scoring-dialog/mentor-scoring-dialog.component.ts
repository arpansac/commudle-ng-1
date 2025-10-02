import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@commudle/theme';
import { IHackathon, IHackathonTeamRoundScore, IMarkingCriteria } from '@commudle/shared-models';
import { HackathonTeamRoundScoreService, ToastrService, RoundService } from '@commudle/shared-services';

@Component({
  standalone: false,
  selector: 'commudle-mentor-scoring-dialog',
  templateUrl: './mentor-scoring-dialog.component.html',
  styleUrls: ['./mentor-scoring-dialog.component.scss'],
})
export class MentorScoringDialogComponent implements OnInit {
  @Input() teamData: any;
  @Input() hackathon: IHackathon;

  scoreForm: FormGroup;
  isSubmitting = false;
  isLoadingCriteria = true;
  markingCriteria: IMarkingCriteria[] = [];
  hasMarkingCriteria = false;
  totalScore = 0;
  maxTotalScore = 0;

  constructor(
    private dialogRef: NbDialogRef<MentorScoringDialogComponent>,
    private fb: FormBuilder,
    private hackathonTeamRoundScoreService: HackathonTeamRoundScoreService,
    private toastrService: ToastrService,
    private roundService: RoundService,
  ) {}

  ngOnInit(): void {
    this.loadMarkingCriteria();
  }

  loadMarkingCriteria(): void {
    this.roundService.showMarkingCriteria(this.teamData.team.round.id).subscribe({
      next: (response) => {
        this.hasMarkingCriteria = response.has_marking_criteria;
        this.markingCriteria = response.marking_criteria || [];
        this.maxTotalScore = this.markingCriteria.reduce((sum, criteria) => sum + criteria.max, 0);
        this.isLoadingCriteria = false;
        this.initForm();
      },
      error: () => {
        this.isLoadingCriteria = false;
        this.initForm();
      },
    });
  }

  initForm(): void {
    const formControls = {};
    const existingScore = this.teamData?.score;

    if (this.hasMarkingCriteria && this.markingCriteria.length > 0) {
      this.markingCriteria.forEach((criteria: IMarkingCriteria, index: number) => {
        const existingValue = existingScore?.score?.[index]?.score || criteria.min;
        formControls[`criteria_${index}`] = [existingValue, [Validators.required]];
      });
    } else {
      const existingTotal = existingScore?.total_score || 1;
      formControls['total_score'] = [existingTotal, [Validators.required]];
    }

    formControls['remarks'] = [existingScore?.remarks || ''];
    this.scoreForm = this.fb.group(formControls);

    if (this.hasMarkingCriteria && this.markingCriteria.length > 0) {
      this.calculateTotalScore();
      this.scoreForm.valueChanges.subscribe(() => this.calculateTotalScore());
    }
  }

  calculateTotalScore(): void {
    let sum = 0;
    this.markingCriteria.forEach((criteria, index) => {
      const value = this.scoreForm.get(`criteria_${index}`)?.value;
      if (value) {
        sum += Number(value);
      }
    });
    this.totalScore = sum;
  }

  getScoreOptions(min: number, max: number): number[] {
    const options = [];
    for (let i = min; i <= max; i++) {
      options.push(i);
    }
    return options;
  }

  submitScore(status: 'submitted' | 'draft'): void {
    if (status === 'submitted' && this.scoreForm.invalid) {
      this.toastrService.warningDialog('Please fill all required fields');
      return;
    }

    this.isSubmitting = true;
    const scoreData = this.prepareScoreData(status);

    this.hackathonTeamRoundScoreService.submitScore(scoreData, this.teamData.score.id, this.hackathon.id).subscribe({
      next: (score: IHackathonTeamRoundScore) => {
        this.toastrService.successDialog(
          status === 'submitted' ? 'Score submitted successfully' : 'Score saved as draft',
        );
        this.dialogRef.close(score);
      },
      error: () => {
        this.toastrService.errorDialog(status === 'submitted' ? 'Failed to submit score' : 'Failed to save draft');
        this.isSubmitting = false;
      },
    });
  }

  prepareScoreData(status: 'submitted' | 'draft'): any {
    const formValue = this.scoreForm.value;
    const scoreData: any = {
      remarks: formValue.remarks,
      status: status,
    };

    if (this.hasMarkingCriteria && this.markingCriteria.length > 0) {
      scoreData.score = this.markingCriteria.map((criteria: IMarkingCriteria, index: number) => ({
        text: criteria.text,
        score: formValue[`criteria_${index}`],
      }));
      scoreData.total_score = this.totalScore;
    } else {
      scoreData.total_score = formValue.total_score;
    }

    return scoreData;
  }

  close(): void {
    this.dialogRef.close();
  }
}
