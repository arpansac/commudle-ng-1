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
  IRoundMentorSlotBooking,
} from '@commudle/shared-models';
// TODO: try to shift this inside lib
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
// TODO: define path inside app config
import {
  DataTableColumn,
  DataTableRow,
  DataTableConfig,
} from '../../../../app-shared-components/data-table/data-table.component';
import moment from 'moment';
import { SidebarService } from 'apps/shared-components/sidebar/service/sidebar.service';
import { ESidebarPosition, ESidebarWidth } from 'apps/shared-components/sidebar/enum/sidebar.enum';
import { RoundMentorSlotBookingChannel } from 'apps/shared-components/services/websockets/round-mentor-slot-booking.channel';

@Component({
  selector: 'commudle-hackathon-control-panel-mentor-slots',
  templateUrl: './hackathon-control-panel-mentor-slots.component.html',
  styleUrls: ['./hackathon-control-panel-mentor-slots.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HackathonControlPanelMentorSlotsComponent implements OnInit, AfterViewInit, OnDestroy {
  // TODO: recheck all this and remove extra variables if any
  hackathonId: string;
  mentors: IHackathonJudge[] = [];
  rounds: IRound[] = [];
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
  selectedSlot: IRoundMentorSlot;
  searchQuery = '';
  ESidebarPosition = ESidebarPosition;
  ESidebarWidth = ESidebarWidth;
  sidebarEventName = 'mentor-slot-team-assignment';
  teams: IHackathonTeam[] = [];
  filteredUnassignedTeams: IHackathonTeam[] = [];

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
  private destroy$ = new Subject<void>();

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
    private roundMentorSlotBookingChannel: RoundMentorSlotBookingChannel,
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
      this.loadRoundAndMentors();
    });
    this.checkMainSidebarState();
  }

  ngAfterViewInit(): void {
    this.buildTableColumns();
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.unsubscribeFromChannels();
    this.destroy$.next();
    this.destroy$.complete();
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
        const slotCount = round.round_mentor_slot_rule ? round.round_mentor_slot_rule.total_slots : 1;
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

  openUpdateMeetingUrlDialog(template: TemplateRef<unknown>, mentorId: number): void {
    this.meetingUrl = '';
    this.dialogService.open(template, {
      context: { mentorId },
    });
  }

  // TODO: add option to delete and update meeting url
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
    // TODO: get data from round api and remove show by round or extra service to all api
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

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  addTeamToSlot(slot: IRoundMentorSlot, mentorId: number, roundId: number, slotIndex: number): void {
    this.selectedSlot = slot;
    const bookings = slot.round_mentor_slot_bookings;
    this.selectedMentorId = mentorId;
    this.selectedRoundId = roundId;
    this.selectedMentor = this.mentors.find((m) => m.id === mentorId);
    this.selectedRound = this.rounds.find((r) => r.id === roundId);
    this.loadTeamsForRound(roundId, mentorId, bookings);
    this.sidebarService.openSidebar(this.sidebarEventName);
  }

  loadTeamsForRound(roundId: number, mentorId: number, bookings: IRoundMentorSlotBooking[]): void {
    this.hackathonTeamService
      .teamsByEvaluator(roundId, mentorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.teams = data;
          this.updateFilteredTeams(bookings);
          this.cdr.markForCheck();
        },
      });
  }

  updateFilteredTeams(bookings?: IRoundMentorSlotBooking[]): void {
    const query = this.searchQuery.toLowerCase();
    const bookedTeamIds = bookings?.map((b) => b.hackathon_team_id) || [];
    this.filteredUnassignedTeams = this.teams.filter(
      (team) => team.name.toLowerCase().includes(query) && !bookedTeamIds.includes(team.id),
    );
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
    const slot = this.selectedSlot;

    this.roundMentorSlotBookingService
      .createBooking(slotRule.id, teamId, slot.id, this.selectedMentorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastrService.successDialog('Team assigned successfully');
          this.teams = this.teams.filter((team) => team.id !== teamId);
          // TODO: when  team was added the remove it from list like mentor assignment
          this.cdr.markForCheck();
        },
      });
  }

  private loadRoundAndMentors(): void {
    this.isLoading = true;
    this.loadRounds();
    this.loadMentors();
  }

  private loadMentors(): void {
    this.hackathonService
      .indexJudge(this.hackathonId, [EHackathonJudgeType.MENTOR], EJudgeInvitationStatus.ACCEPTED)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.mentors = data || [];
        this.buildTableData();
        this.cdr.markForCheck();
      });
  }

  private loadRounds(): void {
    this.roundService.mentorSlotIndex(this.hackathonId, EDbModels.HACKATHON).subscribe((data) => {
      this.rounds = data;
      if (this.mentorCellTemplate) {
        this.buildTableColumns();
      }
      this.isLoading = false;
      this.subscribeToChannels();
      this.cdr.markForCheck();
    });
  }

  private subscribeToChannels(): void {
    this.roundMentorSlotBookingChannel.subscribe(this.hackathonId);
  }

  private unsubscribeFromChannels(): void {
    this.roundMentorSlotBookingChannel.unsubscribe();
  }

  private checkMainSidebarState(): void {
    this.sidebarService.getSidebarVisibility(this.mainSidebarEventName).subscribe((data) => {
      this.mainSidebarExpanded = data;
      this.cdr.markForCheck();
    });
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
}

// TODO: check all service and all new api remove if not needed from backend as well
