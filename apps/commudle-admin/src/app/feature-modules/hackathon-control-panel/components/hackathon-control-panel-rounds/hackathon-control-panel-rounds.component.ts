import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IRound, EDbModels, IHackathon, ICommunity, ERoundType, IMarkingCriteria } from '@commudle/shared-models';
import { RoundService, ToastrService, SeoService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import {
  faPlus,
  faFileImage,
  faXmark,
  faArrowRight,
  faRectangleList,
  faMicrophone,
  faSackDollar,
  faHashtag,
  faEdit,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { Subscription } from 'rxjs';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import * as moment from 'moment';

@Component({
    selector: 'commudle-hackathon-control-panel-rounds',
    templateUrl: './hackathon-control-panel-rounds.component.html',
    styleUrls: ['./hackathon-control-panel-rounds.component.scss'],
    standalone: false
})
export class HackathonControlPanelRoundsComponent implements OnInit, OnDestroy {
  roundForm: FormGroup;
  rounds: IRound[];
  hackathon: IHackathon;
  ERoundType = ERoundType;
  markingCriteria: IMarkingCriteria[] = [];
  isLoading = true;
  readonly icons = {
    faPlus,
    faFileImage,
    faXmark,
    faArrowRight,
    faRectangleList,
    faMicrophone,
    faSackDollar,
    faHashtag,
    faEdit,
    faTrash,
  };

  moment = moment;

  hackathonSlug = '';
  dialogRef: any;

  parent: ICommunity | ICommunityGroup;
  subscriptions: Subscription[] = [];

  today: string = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format

  constructor(
    private roundService: RoundService,
    private activatedRoute: ActivatedRoute,
    private nbDialogService: NbDialogService,
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private datePipe: DatePipe,
    private hackathonService: HackathonService,
    private seoService: SeoService,
  ) {
    this.roundForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      order: ['', [Validators.required, Validators.min(1)]],
      end_date: [''],
      round_type: [ERoundType.GENERAL],
      has_marking_criteria: [true],
    });
  }

  ngOnInit() {
    this.seoService.noIndex(true);
    this.loadDefaultMarkingCriteria();

    this.subscriptions.push(
      this.activatedRoute.parent.paramMap.subscribe((params) => {
        this.hackathonSlug = params.get('hackathon_id');
        this.fetchHackathon();
        this.indexRounds(params.get('hackathon_id'));
      }),
    );
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  indexRounds(hackathonId) {
    this.isLoading = true;
    this.roundService.indexRounds(hackathonId, EDbModels.HACKATHON).subscribe((data: IRound[]) => {
      this.rounds = data;
      this.isLoading = false;
    });
  }

  fetchHackathon() {
    this.hackathonService.showHackathon(this.hackathonSlug).subscribe((data) => {
      // TODO: Add Community Group in Future
      if (data.community) {
        this.parent = data.community;
      }
      this.hackathon = data;
      this.setMeta();
    });
  }

  openRoundDialogBox(dialog, round?: IRound, index?) {
    if (round) {
      this.roundForm = this.fb.group({
        name: round.name,
        description: round.description,
        date: this.datePipe.transform(round.date, 'yyyy-MM-ddTHH:mm:ss'),
        order: round.order,
        end_date: this.datePipe.transform(round.end_date, 'yyyy-MM-ddTHH:mm:ss'),
        round_type: round.round_type,
        has_marking_criteria: round.has_marking_criteria ?? true,
      });
      this.markingCriteria = round.marking_criteria ? [...round.marking_criteria] : [];
    } else {
      this.resetRoundForm();
      this.loadDefaultMarkingCriteria();
    }

    this.dialogRef = this.nbDialogService.open(dialog, {
      context: { index: index, round: round },
    });

    setTimeout(() => {
      const nameInput = document.querySelector('#name') as HTMLInputElement;
      if (nameInput) {
        nameInput.focus();
      }
    }, 0);
  }

  openConfirmDeleteDialogBox(dialog, roundId, index) {
    this.nbDialogService.open(dialog, {
      context: { index: index, roundId: roundId },
    });
  }

  createRound() {
    if (this.roundForm.value.has_marking_criteria && this.markingCriteria.length === 0) {
      this.toastrService.warningDialog('Please add at least one marking criteria or uncheck Has Marking Criteria');
      return;
    }
    const formData = {
      ...this.roundForm.value,
      date: this.convertDateToLocal(this.roundForm.value.date),
      end_date: this.roundForm.value.end_date ? this.convertDateToLocal(this.roundForm.value.end_date) : null,
      marking_criteria: this.markingCriteria,
    };
    this.roundService.createRound(formData, EDbModels.HACKATHON, this.hackathonSlug).subscribe((data: IRound) => {
      if (data) {
        this.rounds.unshift(data);
        this.toastrService.successDialog('Round Created');
        this.dialogRef.close();
        this.resetRoundForm();
      }
    });
  }

  updateRound(round, index) {
    if (this.roundForm.value.has_marking_criteria && this.markingCriteria.length === 0) {
      this.toastrService.warningDialog('Please add at least one marking criteria or uncheck Has Marking Criteria');
      return;
    }
    const formData = {
      ...this.roundForm.value,
      date: this.convertDateToLocal(this.roundForm.value.date),
      end_date: this.roundForm.value.end_date ? this.convertDateToLocal(this.roundForm.value.end_date) : null,
      marking_criteria: this.markingCriteria,
    };
    this.roundService.updateRound(formData, round.id).subscribe((data) => {
      if (data) {
        this.toastrService.successDialog('Round was updated');
        this.rounds[index] = data;
        this.dialogRef.close();
      }
    });
  }

  destroyRound(roundId, index) {
    this.roundService.destroyRound(roundId).subscribe((data) => {
      if (data) this.rounds.splice(index, 1);
    });
  }

  createChannel(round: IRound, index: number) {
    this.roundService.createChannelForRound(round.id).subscribe((data) => {
      if (data) {
        this.toastrService.successDialog('Channel Created');
        this.rounds[index] = data;
      }
    });
  }

  resetRoundForm() {
    this.roundForm.reset(); // Reset form completely
    this.roundForm.setValidators(null); // Remove any previous validators
    this.markingCriteria = []; // Reset marking criteria

    // Reinitialize with validators
    this.roundForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      order: ['', [Validators.required, Validators.min(1)]],
      end_date: [''],
      round_type: ['general'],
      has_marking_criteria: [true],
    });
  }

  setMeta() {
    this.seoService.setTitle(`Rounds | Dashboard | ${this.hackathon.name} | ${this.parent.name}`);
  }

  addMarkingCriteria() {
    this.markingCriteria.push({ text: '', min: 0, max: 10 });
  }

  removeMarkingCriteria(index: number) {
    this.markingCriteria.splice(index, 1);
  }

  updateMarkingCriteria(index: number, field: keyof IMarkingCriteria, value: any) {
    (this.markingCriteria[index] as any)[field] = value;
  }

  loadDefaultMarkingCriteria() {
    this.roundService.getMarkingCriteria().subscribe((criteria: IMarkingCriteria[]) => {
      this.markingCriteria = criteria || [];
    });
  }

  convertDateToLocal(dateTime: string): string {
    return new Date(dateTime).toISOString();
  }
}
