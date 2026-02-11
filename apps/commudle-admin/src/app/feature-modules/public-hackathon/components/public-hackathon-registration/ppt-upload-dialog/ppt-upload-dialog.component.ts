import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IRound, IHackathonTeamRoundSubmission } from '@commudle/shared-models';

import { Subject } from 'rxjs';
import { faUpload, faFile, faXmark } from '@fortawesome/free-solid-svg-icons';
import { NbDialogRef } from '@commudle/theme';
import { HackathonTeamRoundSubmissionService } from '@commudle/shared-services';

@Component({
  standalone: false,
  selector: 'commudle-ppt-upload-dialog',
  templateUrl: './ppt-upload-dialog.component.html',
  styleUrls: ['./ppt-upload-dialog.component.scss'],
})
export class PptUploadDialogComponent implements OnInit {
  @Input() round: IRound;
  @Input() teamId: number;
  @Input() existingSubmission: IHackathonTeamRoundSubmission;

  uploadForm: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;
  private destroy$ = new Subject<void>();

  readonly icons = {
    faUpload,
    faFile,
    faXmark,
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<PptUploadDialogComponent>,
    private submissionService: HackathonTeamRoundSubmissionService,
  ) {
    this.uploadForm = this.fb.group({
      comments: [''],
    });
  }

  ngOnInit() {
    if (this.existingSubmission) {
      this.uploadForm.patchValue({
        comments: this.existingSubmission.comments || '',
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/pdf',
    ];

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload .ppt, .pptx, or .pdf files only.');
        return;
      }
      if (file.size > maxSize) {
        alert('File size exceeds 10MB. Please upload a smaller file.');
        return;
      }
      this.selectedFile = file;
    }
  }

  onSubmit() {
    this.isUploading = true;
    const formData = new FormData();

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }
    formData.append('hackathon_team_round_submission[comments]', this.uploadForm.get('comments')?.value || '');

    const request = this.existingSubmission
      ? this.submissionService.updateSubmission(formData, this.existingSubmission.id)
      : this.submissionService.createSubmission(formData, this.teamId, this.round.id);

    request.subscribe({
      next: (response) => {
        this.isUploading = false;
        this.dialogRef.close(response);
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
