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
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  faPlus,
  faEdit,
  faTrash,
  faLocationDot,
  faExpand,
  faCompress,
  faCross,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import {
  EDbModels,
  EHackathonJudgeType,
  EJudgeInvitationStatus,
  IHackathonJudge,
  IRound,
  IRoundMentorSlotRule,
  IHackathonTeam,
  IRoundMentorSlot,
} from '@commudle/shared-models';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { HackathonJudgeService } from 'apps/commudle-admin/src/app/services/hackathon-judge.service';
import {
  ToastrService,
  SeoService,
  RoundService,
  RoundMentorSlotRulesService,
  HackathonTeamService,
  RoundMentorSlotBookingService,
} from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import {
  DataTableColumn,
  DataTableRow,
  DataTableConfig,
} from '../../../../app-shared-components/data-table/data-table.component';
import moment from 'moment';
import { SidebarService } from 'apps/shared-components/sidebar/service/sidebar.service';
import { ESidebarPosition, ESidebarWidth } from 'apps/shared-components/sidebar/enum/sidebar.enum';

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
  isFullscreen = false;
  mainSidebarExpanded = true;
  mainSidebarEventName = 'hackathonDashboard';
  tableColumns: DataTableColumn[] = [];
  tableRows: DataTableRow[] = [];
  tableConfig: DataTableConfig = {
    frozenColumns: true,
    resizableColumns: true,
    cellBorders: 'both',
  };
  meetingUrl = '';
  moment = moment;
  slotRuleForm: FormGroup;
  currentRoundId: number;
  currentSlotRule: IRoundMentorSlotRule;
  selectedMentorId: number;
  selectedRoundId: number;
  selectedRound: IRound;
  selectedMentor: IHackathonJudge;
  selectedSlotUUID: string;
  selectedSlot: IRoundMentorSlot;
  searchQuery = '';
  ESidebarPosition = ESidebarPosition;
  ESidebarWidth = ESidebarWidth;
  sidebarEventName = 'mentor-slot-team-assignment';
  teams: IHackathonTeam[] = [];
  filteredUnassignedTeams: IHackathonTeam[] = [];
  slotAssignmentData: {
    [mentorId: number]: {
      [roundId: number]: { [slotUUID: string]: { count: number; assignedTeams: IHackathonTeam[] } };
    };
  } = {};

  @ViewChild('mentorCellTemplate', { static: false }) mentorCellTemplate!: TemplateRef<unknown>;
  @ViewChild('slotCellTemplate', { static: false }) slotCellTemplate!: TemplateRef<unknown>;
  @ViewChild('roundHeaderTemplate', { static: false }) roundHeaderTemplate!: TemplateRef<unknown>;

  readonly icons = {
    faPlus,
    faEdit,
    faTrash,
    faLocationDot,
    faExpand,
    faCompress,
    faXmark,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private hackathonService: HackathonService,
    private hackathonJudgeService: HackathonJudgeService,
    private roundService: RoundService,
    private roundMentorSlotRulesService: RoundMentorSlotRulesService,
    private toastrService: ToastrService,
    private seoService: SeoService,
    private dialogService: NbDialogService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private sidebarService: SidebarService,
    private hackathonTeamService: HackathonTeamService,
    private roundMentorSlotBookingService: RoundMentorSlotBookingService,
  ) {
    this.slotRuleForm = this.fb.group(
      {
        booking_open: [true],
        starts_at: ['', Validators.required],
        ends_at: ['', Validators.required],
        slot_length: [30, [Validators.required, Validators.min(1)]],
        max_teams_per_slot: [1, [Validators.required, Validators.min(1)]],
      },
      { validators: this.dateRangeValidator },
    );
  }

  ngOnInit(): void {
    this.seoService.noIndex(true);
    this.sidebarService.setSidebarVisibility(this.sidebarEventName, false, true, ESidebarPosition.RIGHT);
    this.activatedRoute.parent.parent.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.hackathonId = params.get('hackathon_id');
      this.loadData();
    });
    this.checkMainSidebarState();
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
    this.isLoading = true;
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
        this.checkLoadingComplete();
        this.cdr.markForCheck();
      });
  }

  loadRounds(): void {
    this.roundService.mentorSlotIndex(this.hackathonId, EDbModels.HACKATHON).subscribe((data) => {
      this.rounds = data;
      this.buildSlotAssignmentData();
      if (this.mentorCellTemplate) {
        this.buildTableColumns();
      }
      this.checkLoadingComplete();
      this.cdr.markForCheck();
    });
  }

  private checkLoadingComplete(): void {
    if (this.mentors.length >= 0 && this.rounds.length >= 0) {
      this.isLoading = false;
    }
  }

  buildSlotAssignmentData(): void {
    this.slotAssignmentData = {};
    this.rounds.forEach((round) => {
      if (round.round_mentor_slot_rule?.metadata?.slots) {
        this.mentors.forEach((mentor) => {
          if (!this.slotAssignmentData[mentor.id]) {
            this.slotAssignmentData[mentor.id] = {};
          }
          if (!this.slotAssignmentData[mentor.id][round.id]) {
            this.slotAssignmentData[mentor.id][round.id] = {};
          }
          round.round_mentor_slot_rule.metadata.slots.forEach((slot) => {
            // this.slotAssignmentData[mentor.id][round.id][slot.uuid] = {
            //   // count: slot.bookings?.length || 0,
            //   // assignedTeams: slot.bookings?.map((b) => b.hackathon_team) || [],
            // };
          });
        });
      }
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
      ...this.rounds.map((round) => {
        const slotCount = round.round_mentor_slot_rule ? round.round_mentor_slot_rule.metadata.slots.length : 1;
        const calculatedWidth = round.round_mentor_slot_rule ? `${Math.max(400, slotCount * 160)}px` : '400px';

        return {
          key: `round_${round.id}`,
          title: round.name,
          width: calculatedWidth,
          cellTemplate: this.slotCellTemplate,
          headerTemplate: this.roundHeaderTemplate,
          noPadding: true,
          round: round,
        };
      }),
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
    this.currentRoundId = roundId;
    this.loadSlotRule(roundId);
    this.dialogService.open(template, {
      context: { roundId },
    });
  }

  loadSlotRule(roundId: number): void {
    const currentRound = this.rounds.find((r) => r.id === roundId);
    this.roundMentorSlotRulesService.showByRound(roundId).subscribe({
      next: (data) => {
        this.currentSlotRule = data;
        if (this.currentSlotRule) {
          this.slotRuleForm.patchValue({
            booking_open: data.booking_open,
            starts_at: moment.utc(data.starts_at).local().format('YYYY-MM-DDTHH:mm'),
            ends_at: moment.utc(data.ends_at).local().format('YYYY-MM-DDTHH:mm'),
            slot_length: data.slot_length,
            max_teams_per_slot: data.max_teams_per_slot,
          });
        } else {
          this.slotRuleForm.patchValue({
            booking_open: true,
            starts_at: currentRound?.date ? moment(currentRound.date).format('YYYY-MM-DDTHH:mm') : '',
            ends_at: currentRound?.end_date ? moment(currentRound.end_date).format('YYYY-MM-DDTHH:mm') : '',
            slot_length: 30,
            max_teams_per_slot: 1,
          });
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.slotRuleForm.patchValue({
          booking_open: false,
          starts_at: currentRound?.date ? moment(currentRound.date).format('YYYY-MM-DDTHH:mm') : '',
          ends_at: currentRound?.end_date ? moment(currentRound.end_date).format('YYYY-MM-DDTHH:mm') : '',
          slot_length: 30,
          max_teams_per_slot: 1,
        });
        this.currentSlotRule = null;
        this.cdr.markForCheck();
      },
    });
  }

  saveSlotRules(dialogRef: any): void {
    if (this.slotRuleForm.invalid) {
      this.slotRuleForm.markAllAsTouched();
      this.toastrService.warningDialog('Please fill all required fields correctly');
      return;
    }

    const formData = {
      ...this.slotRuleForm.value,
      starts_at: moment(this.slotRuleForm.value.starts_at).toISOString(),
      ends_at: moment(this.slotRuleForm.value.ends_at).toISOString(),
    };

    if (this.currentSlotRule) {
      this.roundMentorSlotRulesService.update(this.currentRoundId, this.currentSlotRule.id, formData).subscribe({
        next: () => {
          this.toastrService.successDialog('Slot rules updated successfully');
          dialogRef.close();
          this.loadRounds();
        },
      });
    } else {
      this.roundMentorSlotRulesService.create(this.currentRoundId, formData).subscribe({
        next: () => {
          this.toastrService.successDialog('Slot rules created successfully');
          dialogRef.close();
          this.loadRounds();
        },
      });
    }
  }

  calculateTotalSlots(): number {
    const starts_at = this.slotRuleForm.get('starts_at')?.value;
    const ends_at = this.slotRuleForm.get('ends_at')?.value;
    const slot_length = this.slotRuleForm.get('slot_length')?.value;

    if (!starts_at || !ends_at || !slot_length) {
      return 0;
    }
    const start = moment(starts_at);
    const end = moment(ends_at);
    const durationMinutes = end.diff(start, 'minutes');
    return Math.floor(durationMinutes / slot_length);
  }

  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const starts_at = control.get('starts_at')?.value;
    const ends_at = control.get('ends_at')?.value;

    if (!starts_at || !ends_at) {
      return null;
    }

    const start = moment(starts_at);
    const end = moment(ends_at);

    return end.isAfter(start) ? null : { dateRange: true };
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  private checkMainSidebarState(): void {
    this.sidebarService.getSidebarVisibility(this.mainSidebarEventName).subscribe((data) => {
      this.mainSidebarExpanded = data;
      this.cdr.markForCheck();
    });
  }

  addTeamToSlot(mentorId: number, roundId: number, slotIndex: number, slotUUID: string): void {
    this.selectedMentorId = mentorId;
    this.selectedRoundId = roundId;
    this.selectedSlotUUID = slotUUID;
    this.selectedMentor = this.mentors.find((m) => m.id === mentorId);
    this.selectedRound = this.rounds.find((r) => r.id === roundId);
    this.loadTeamsForRound(roundId);
    this.sidebarService.openSidebar(this.sidebarEventName);
  }

  loadTeamsForRound(roundId: number): void {
    this.hackathonTeamService
      .indexTeamsByRound(roundId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.teams = data;
          this.updateFilteredTeams();
          this.cdr.markForCheck();
        },
        error: () => {
          this.toastrService.warningDialog('Failed to load teams');
        },
      });
  }

  updateFilteredTeams(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredUnassignedTeams = this.teams.filter((team) => team.name.toLowerCase().includes(query));
  }

  onSearchChange(): void {
    this.updateFilteredTeams();
  }

  closeSidebar(): void {
    this.sidebarService.closeSidebar(this.sidebarEventName);
    this.searchQuery = '';
  }

  assignTeam(teamId: number): void {
    const round = this.rounds.find((r) => r.id === this.selectedRoundId);
    const slotRule = round?.round_mentor_slot_rule;
    const slot = { id: null };

    this.roundMentorSlotBookingService
      .createBooking(slotRule.id, this.selectedSlotUUID, teamId, slot?.id, this.selectedMentorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastrService.successDialog('Team assigned successfully');
          const assignedTeam = this.teams.find((t) => t.id === teamId);
          this.teams = this.teams.filter((team) => team.id !== teamId);
          this.updateFilteredTeams();
          if (!this.slotAssignmentData[this.selectedMentorId]) {
            this.slotAssignmentData[this.selectedMentorId] = {};
          }
          if (!this.slotAssignmentData[this.selectedMentorId][this.selectedRoundId]) {
            this.slotAssignmentData[this.selectedMentorId][this.selectedRoundId] = {};
          }
          if (!this.slotAssignmentData[this.selectedMentorId][this.selectedRoundId][this.selectedSlotUUID]) {
            this.slotAssignmentData[this.selectedMentorId][this.selectedRoundId][this.selectedSlotUUID] = {
              count: 0,
              assignedTeams: [],
            };
          }
          this.slotAssignmentData[this.selectedMentorId][this.selectedRoundId][this.selectedSlotUUID].count++;
          this.slotAssignmentData[this.selectedMentorId][this.selectedRoundId][
            this.selectedSlotUUID
          ].assignedTeams.push(assignedTeam);
          this.loadRounds();
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.toastrService.warningDialog(error?.error?.errors?.[0] || 'Failed to assign team');
        },
      });
  }

  cancelSlot(mentorId: number, roundId: number, slotIndex: number): void {
    // TODO: Implement cancel slot logic
    console.log('Cancel slot', { mentorId, roundId, slotIndex });
  }
}
