import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IRound } from '@commudle/shared-models';
import { NbDialogRef } from '@commudle/theme';
import { HackathonTeamRoundSubmissionService } from 'libs/shared/services/src/lib/hackathon-team-round-submission.service';
import { takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'commudle-ppt-upload-dialog',
  templateUrl: './ppt-upload-dialog.component.html',
  styleUrls: ['./ppt-upload-dialog.component.scss'],
})
export class PptUploadDialogComponent {
  @Input() round: IRound;
  @Input() teamId: number;

  uploadForm: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<PptUploadDialogComponent>,
    private submissionService: HackathonTeamRoundSubmissionService,
  ) {
    this.uploadForm = this.fb.group({
      comments: [''],
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (
      file &&
      (file.type === 'application/vnd.ms-powerpoint' ||
        file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
    ) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    const formData = new FormData();
    formData.append('ppt', this.selectedFile);
    formData.append('hackathon_team_round_submission[comments]', this.uploadForm.get('comments')?.value || '');

    this.submissionService.createSubmission(formData, this.teamId, this.round.id).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.close();
      },
      error: (error) => {
        console.error('Error uploading PPT:', error);
        this.isUploading = false;
      },
    });
  }

  close() {
    this.dialogRef.close();
  }
}
