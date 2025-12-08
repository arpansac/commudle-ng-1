import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@commudle/theme';
import { IMarkingCriteria } from '@commudle/shared-models';
import { HackathonTeamRoundScoreService, ToastrService, RoundService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-mentor-scoring-dialog',
  templateUrl: './mentor-scoring-dialog.component.html',
  styleUrls: ['./mentor-scoring-dialog.component.scss'],
})
export class MentorScoringDialogComponent implements OnInit {
  @Input() teamData: any;

  scoreForm: FormGroup;
  isSubmitting = false;
  isLoadingCriteria = true;
  markingCriteria: IMarkingCriteria[] = [];
  hasMarkingCriteria = false;
  totalScore = 0;

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
    this.roundService.showMarkingCriteria(this.teamData.round_id).subscribe({
      next: (response) => {
        this.hasMarkingCriteria = response.has_marking_criteria;
        this.markingCriteria = response.marking_criteria || [];
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

    if (this.hasMarkingCriteria && this.markingCriteria.length > 0) {
      this.markingCriteria.forEach((criteria: IMarkingCriteria, index: number) => {
        formControls[`criteria_${index}`] = ['', [Validators.required]];
      });
    } else {
      formControls['total_score'] = ['', [Validators.required]];
    }

    formControls['feedback'] = [''];
    this.scoreForm = this.fb.group(formControls);

    if (this.hasMarkingCriteria && this.markingCriteria.length > 0) {
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

  submitScore(): void {
    if (this.scoreForm.invalid) {
      this.toastrService.warningDialog('Please fill all required fields');
      return;
    }

    this.isSubmitting = true;
    const scoreData = this.prepareScoreData();

    this.hackathonTeamRoundScoreService
      .submitScore(this.teamData.team_id, this.teamData.round_id, scoreData)
      .subscribe({
        next: () => {
          this.toastrService.successDialog('Score submitted successfully');
          this.dialogRef.close(true);
        },
        error: () => {
          this.toastrService.errorDialog('Failed to submit score');
          this.isSubmitting = false;
        },
      });
  }

  prepareScoreData(): any {
    const formValue = this.scoreForm.value;
    const scoreData: any = {
      feedback: formValue.feedback,
    };

    if (this.hasMarkingCriteria && this.markingCriteria.length > 0) {
      scoreData.criteria_scores = this.markingCriteria.map((criteria: IMarkingCriteria, index: number) => ({
        text: criteria.text,
        score: formValue[`criteria_${index}`],
        max: criteria.max,
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
