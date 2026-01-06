import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { faPlus, faEdit, faTrash, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import {
  EDbModels,
  EHackathonJudgeType,
  EJudgeInvitationStatus,
  IHackathonJudge,
  IRound,
} from '@commudle/shared-models';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { HackathonJudgeService } from 'apps/commudle-admin/src/app/services/hackathon-judge.service';
import { ToastrService, SeoService, RoundService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import {
  DataTableColumn,
  DataTableRow,
  DataTableConfig,
} from 'apps/commudle-admin/src/app/app-shared-components/data-table/data-table.component';
import moment from 'moment';

@Component({
  selector: 'commudle-hackathon-control-panel-mentor-slots',
  templateUrl: './hackathon-control-panel-mentor-slots.component.html',
  styleUrls: ['./hackathon-control-panel-mentor-slots.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HackathonControlPanelMentorSlotsComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  hackathonId: string;
  mentors: IHackathonJudge[] = [];
  rounds: IRound[] = [];
  // mentorSlots: Map<string, IMentorSlot[]> = new Map();
  isLoading = false;
  tableColumns: DataTableColumn[] = [];
  tableRows: DataTableRow[] = [];
  tableConfig: DataTableConfig = {
    frozenColumns: true,
    resizableColumns: true,
  };
  meetingUrl = '';
  moment = moment;

  @ViewChild('mentorCellTemplate', { static: false }) mentorCellTemplate!: TemplateRef<unknown>;
  @ViewChild('slotCellTemplate', { static: false }) slotCellTemplate!: TemplateRef<unknown>;
  @ViewChild('roundHeaderTemplate', { static: false }) roundHeaderTemplate!: TemplateRef<unknown>;

  readonly icons = {
    faPlus,
    faEdit,
    faTrash,
    faLocationDot,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private hackathonService: HackathonService,
    private hackathonJudgeService: HackathonJudgeService,
    private roundService: RoundService,
    private toastrService: ToastrService,
    private seoService: SeoService,
    private dialogService: NbDialogService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.seoService.noIndex(true);
    this.activatedRoute.parent.parent.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.hackathonId = params.get('hackathon_id');
      this.loadData();
    });
  }

  ngAfterViewInit(): void {
    this.buildTableColumns();
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loadRounds();
    this.loadMentors();
  }

  loadMentors(): void {
    this.hackathonService
      .indexJudge(this.hackathonId, [EHackathonJudgeType.MENTOR], EJudgeInvitationStatus.ACCEPTED)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.mentors = data || [];
        this.buildTableData();
        this.cdr.markForCheck();
      });
  }

  loadRounds(): void {
    this.roundService.indexRounds(this.hackathonId, EDbModels.HACKATHON).subscribe((data) => {
      this.rounds = data;
      if (this.mentorCellTemplate) {
        this.buildTableColumns();
      }
      this.cdr.markForCheck();
    });
  }

  buildTableColumns(): void {
    if (!this.mentorCellTemplate || !this.slotCellTemplate || !this.roundHeaderTemplate) {
      return;
    }
    this.tableColumns = [
      {
        key: 'mentor',
        title: 'Mentors',
        frozen: true,
        width: '250px',
        cellTemplate: this.mentorCellTemplate,
      },
      ...this.rounds.map((round) => ({
        key: `round_${round.id}`,
        title: round.name,
        cellTemplate: this.slotCellTemplate,
        headerTemplate: this.roundHeaderTemplate,
        round: round,
      })),
    ];
    this.buildTableData();
  }

  buildTableData(): void {
    if (this.mentors.length === 0 || this.rounds.length === 0) {
      return;
    }
    this.tableRows = this.mentors.map((mentor) => ({
      id: mentor.id,
      mentor: mentor,
      ...this.rounds.reduce((acc, round) => {
        acc[`round_${round.id}`] = {
          mentorId: mentor.id,
          roundId: round.id,
          mentor: mentor,
          roundName: round.name,
        };
        return acc;
      }, {}),
    }));
    this.cdr.markForCheck();
  }

  addSlot(mentorId: number, roundId: number): void {
    // const key = `${mentorId}_${roundId}`;
    // const slots = this.mentorSlots.get(key) || [];
    // const newSlot: IMentorSlot = {
    //   mentor_id: mentorId,
    //   round_id: roundId,
    //   slot_name: `Slot ${slots.length + 1}`,
    // };
    // slots.push(newSlot);
    // this.mentorSlots.set(key, slots);
    // this.cdr.markForCheck();
  }

  openUpdateMeetingUrlDialog(template: TemplateRef<unknown>, mentorId: number): void {
    this.meetingUrl = '';
    this.dialogService.open(template, {
      context: { mentorId },
    });
  }

  updateMeetingUrl(mentorId: number, dialogRef: any): void {
    if (!this.meetingUrl.trim()) {
      this.toastrService.warningDialog('Please enter a meeting URL');
      return;
    }

    this.hackathonJudgeService.updateMeetingUrl(mentorId, this.meetingUrl).subscribe({
      next: () => {
        this.toastrService.successDialog('Meeting URL updated successfully');
        dialogRef.close();
        this.mentors.find((mentor) => mentor.id === mentorId).meeting_location = this.meetingUrl;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toastrService.warningDialog('Failed to update meeting URL');
      },
    });
  }

  openSlotRulesDialog(template: TemplateRef<unknown>, roundId: number): void {
    this.dialogService.open(template, {
      context: { roundId },
    });
  }
}
