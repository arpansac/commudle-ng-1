import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { IHackathonTrack, IHackathonUserResponse } from '@commudle/shared-models';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { IHackathon } from 'apps/shared-models/hackathon.model';

@Component({
  selector: 'commudle-public-hackathon-project-details-form',
  templateUrl: './public-hackathon-project-details-form.component.html',
  styleUrls: ['./public-hackathon-project-details-form.component.scss'],
})
export class PublicHackathonProjectDetailsFormComponent implements OnInit {
  @Input() hackathon: IHackathon;
  @Input() hackathonUserResponse: IHackathonUserResponse;
  @Output() createOrUpdateProjectDetails = new EventEmitter<any>();
  @Output() previousButtonEvent = new EventEmitter<any>();

  hackathonTracks: IHackathonTrack[];
  hackathonProjectDetailsForm: FormGroup;
  selectedTrackProblemStatement = '';

  constructor(private hackathonService: HackathonService, private fb: FormBuilder) {
    this.hackathonProjectDetailsForm = this.fb.group({
      hackathon_track_id: '',
      project_description: [''],
    });
  }

  ngOnInit() {
    this.fetchHackathonTracks();
    if (
      this.hackathonUserResponse &&
      (this.hackathonUserResponse.track_id || this.hackathonUserResponse.project_description)
    ) {
      this.hackathonProjectDetailsForm.patchValue({
        hackathon_track_id: this.hackathonUserResponse.track_id,
        project_description: this.hackathonUserResponse.project_description,
      });
    }
  }

  minWordsValidator(minWords: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return { minWords: true };

      const words = control.value.trim().split(/\s+/); // Split by spaces
      return words.length >= minWords ? null : { minWords: { requiredWords: minWords, actualWords: words.length } };
    };
  }

  updateProblemStatement() {
    const selectedTrackId = this.hackathonProjectDetailsForm.get('hackathon_track_id').value;
    const selectedTrack = this.hackathonTracks.find((track) => track.id == selectedTrackId);
    if (selectedTrack) {
      this.selectedTrackProblemStatement = selectedTrack.problem_statement;
    } else {
      this.selectedTrackProblemStatement = '';
    }
  }

  fetchHackathonTracks() {
    this.hackathonService.pIndexHackathonTracks(this.hackathon.id).subscribe((data: IHackathonTrack[]) => {
      this.hackathonTracks = data.sort((a, b) => a.name.localeCompare(b.name));
      const hackathonTrackIdControl = this.hackathonProjectDetailsForm.get('hackathon_track_id');
      if (hackathonTrackIdControl && this.hackathonTracks.length > 0) {
        // hackathonTrackIdControl.setValidators([Validators.required]);
      } else if (hackathonTrackIdControl) {
        hackathonTrackIdControl.clearValidators();
      }
      hackathonTrackIdControl.updateValueAndValidity();
    });
  }

  submitProjectDetails() {
    this.createOrUpdateProjectDetails.emit(this.hackathonProjectDetailsForm.value);
  }

  previousButton() {
    this.previousButtonEvent.emit();
  }
}
