import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IHackathonTrack, IHackathonProblemStatement, IHackathon } from '@commudle/shared-models';
import { NbDialogService } from '@commudle/theme';
import { faFileImage, faPlus, faXmark, faMinus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { HackathonPrizeFormComponent } from 'apps/commudle-admin/src/app/feature-modules/hackathon-control-panel/components/hackathon-control-panel-tracks-prizes/hackathon-prize-form/hackathon-prize-form.component';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';

@Component({
    selector: 'commudle-hackathon-control-panel-track',
    templateUrl: './hackathon-control-panel-track.component.html',
    styleUrls: ['./hackathon-control-panel-track.component.scss'],
    standalone: false
})
export class HackathonControlPanelTrackComponent implements OnInit {
  trackForm: FormGroup;
  hackathon: IHackathon;
  hackathonTracks: IHackathonTrack[];

  readonly icons = {
    faPlus,
    faFileImage,
    faXmark,
    faMinus,
    faEdit,
  };
  hackathonSlug = '';
  isLoading = true;
  currentTrackIndex: number;
  tinyMCE = {
    min_height: 200,
    menubar: false,
    convert_urls: false,
    placeholder: 'About',
    content_style:
      "@import url('https://fonts.googleapis.com/css?family=Inter'); body {font-family: 'Inter'; font-size: 16px !important;}",
    plugins: ['emoticons', 'lists', 'preview', 'table', 'autoresize', 'media'],
    toolbar: 'bullist numlist emoticons bold italic | backcolor  media table',
    default_link_target: '_blank',
    branding: false,
    license_key: 'gpl',
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private nbDialogService: NbDialogService,
    private fb: FormBuilder,
    private hackathonService: HackathonService,
  ) {
    this.trackForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      problem_statements: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.activatedRoute.parent.parent.paramMap.subscribe((params) => {
      this.hackathonSlug = params.get('hackathon_id');
      this.hackathonService.showHackathon(this.hackathonSlug).subscribe((data) => {
        this.hackathon = data;
      });
      this.indexTracks(params.get('hackathon_id'));
    });
  }

  get problemStatements(): FormArray {
    return this.trackForm.get('problem_statements') as FormArray;
  }

  createProblemStatementGroup(problemStatement?: IHackathonProblemStatement, trackIndex?: number): FormGroup {
    const psIndex = this.problemStatements.length + 1;
    const displayId = problemStatement?.display_id || this.generateDisplayId(trackIndex, psIndex);

    return this.fb.group({
      id: [problemStatement?.id || null],
      title: [problemStatement?.title || '', [Validators.minLength(60)]],
      max_teams_limit: [problemStatement?.max_teams_limit || null, [Validators.min(1)]],
      display_id: [{ value: displayId, disabled: true }],
    });
  }

  generateDisplayId(trackIndex?: number, psIndex?: number): string {
    const tIndex = trackIndex !== undefined ? trackIndex + 1 : this.hackathonTracks?.length + 1 || 1;
    const pIndex = psIndex || 1;
    return `ps${tIndex}${pIndex}`;
  }

  addProblemStatement(): void {
    this.problemStatements.push(this.createProblemStatementGroup(undefined, this.currentTrackIndex));
  }

  removeProblemStatement(index: number): void {
    this.problemStatements.removeAt(index);
    this.trackForm.markAsDirty();
  }

  openSponsorDialogBox(dialog, track?: IHackathonTrack, index?) {
    this.trackForm.reset();
    this.problemStatements.clear();
    this.currentTrackIndex = index;

    if (track) {
      this.trackForm.patchValue({
        name: track.name,
        description: track.description,
      });

      if (track.hackathon_problem_statements?.length) {
        track.hackathon_problem_statements.forEach((ps) => {
          this.problemStatements.push(this.createProblemStatementGroup(ps, index));
        });
      }
    }

    this.nbDialogService.open(dialog, {
      context: { index: index, track: track },
    });

    setTimeout(() => {
      const nameInput = document.querySelector('#name') as HTMLInputElement;
      if (nameInput) {
        nameInput.focus();
      }
    }, 0);
  }

  confirmDeleteDialogBox(dialog, trackId, index) {
    this.nbDialogService.open(dialog, {
      context: { index: index, trackId: trackId },
    });
  }

  indexTracks(hackathonId) {
    this.hackathonService.indexTracks(hackathonId).subscribe((data: IHackathonTrack[]) => {
      this.hackathonTracks = data;
      this.isLoading = false;
    });
  }

  createTrack() {
    const formValue = this.trackForm.getRawValue();
    const filteredProblemStatements = formValue.problem_statements
      .filter((ps) => ps.title?.trim())
      .map((ps) => ({
        ...(ps.id && { id: ps.id }),
        title: ps.title,
        ...(ps.max_teams_limit && { max_teams_limit: ps.max_teams_limit }),
        ...(ps.display_id && { display_id: ps.display_id }),
      }));

    const payload = {
      name: formValue.name,
      description: formValue.description,
      ...(filteredProblemStatements.length && { problem_statements: filteredProblemStatements }),
    };

    this.hackathonService.createTrack(payload, this.hackathonSlug).subscribe((data) => {
      if (data) this.hackathonTracks.unshift(data);
      this.trackForm.reset();
    });
  }

  updateTrack(trackId, index) {
    const formValue = this.trackForm.getRawValue();
    const filteredProblemStatements = formValue.problem_statements
      .filter((ps) => ps.title?.trim())
      .map((ps) => ({
        ...(ps.id && { id: ps.id }),
        title: ps.title,
        ...(ps.max_teams_limit && { max_teams_limit: ps.max_teams_limit }),
        ...(ps.display_id && { display_id: ps.display_id }),
      }));

    const payload = {
      name: formValue.name,
      description: formValue.description,
      ...(filteredProblemStatements.length && { problem_statements: filteredProblemStatements }),
    };

    this.hackathonService.updateTrack(payload, trackId).subscribe((data) => {
      this.hackathonTracks[index] = data;
    });
  }

  destroyTrack(trackId, index) {
    this.hackathonService.destroyTrack(trackId).subscribe((data) => {
      if (data) this.hackathonTracks.splice(index, 1);
    });
  }

  prizeDialogBox(selectedTrackId?: number) {
    const dialogRef = this.nbDialogService.open(HackathonPrizeFormComponent, {
      context: {
        hackathonId: this.hackathon.id,
        selectedTrackId: selectedTrackId,
      },
    });

    dialogRef.onClose.subscribe((result) => {
      const hackathonTrackIndex = this.hackathonTracks.findIndex((track) => track.id === selectedTrackId);
      if (hackathonTrackIndex > -1 && this.hackathonTracks[hackathonTrackIndex]) {
        this.hackathonTracks[hackathonTrackIndex].hackathon_prizes.push(result);
      }
    });
  }
}
