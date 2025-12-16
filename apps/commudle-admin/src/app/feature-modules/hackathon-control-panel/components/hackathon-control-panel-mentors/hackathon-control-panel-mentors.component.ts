import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { faPlus, faMinus, faArrowRight, faUserCircle, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import { EDbModels, IHackathonTeam, IRound } from '@commudle/shared-models';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { HackathonJudgeService } from 'apps/commudle-admin/src/app/services/hackathon-judge.service';
import { ToastrService, SeoService, RoundService, HackathonTeamRoundScoreService } from '@commudle/shared-services';
import { NbDialogService, NbMenuItem, NbMenuService } from '@commudle/theme';
import { MentorDashboardLinkDialogComponent } from '../hackathon-control-panel-emails/mentor-dashboard-link-dialog/mentor-dashboard-link-dialog.component';
import { MentorCustomEmailDialogComponent } from '../hackathon-control-panel-emails/mentor-custom-email-dialog/mentor-custom-email-dialog.component';
import { filter, map } from 'rxjs/operators';
import { EHackathonJudgeType, EInvitationStatus, IHackathonJudge } from 'apps/shared-models/hackathon-judge.model';
import {
  DataTableColumn,
  DataTableRow,
  DataTableConfig,
} from 'apps/commudle-admin/src/app/app-shared-components/data-table/data-table.component';
import { ESidebarPosition, ESidebarWidth } from 'apps/shared-components/sidebar/enum/sidebar.enum';
import { SidebarService } from 'apps/shared-components/sidebar/service/sidebar.service';

@Component({
  selector: 'commudle-hackathon-control-panel-mentors',
  templateUrl: './hackathon-control-panel-mentors.component.html',
  styleUrls: ['./hackathon-control-panel-mentors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HackathonControlPanelMentorsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  hackathonId: string;
  mentors: IHackathonJudge[] = [];
  teams: IHackathonTeam[] = [];
  rounds: IRound[] = [];
  mentorAssignments: Map<string, number[]> = new Map();
  isLoading = false;
  tableColumns: DataTableColumn[] = [];
  tableRows: DataTableRow[] = [];
  tableConfig: DataTableConfig = {
    frozenColumns: true,
    resizableColumns: true,
  };
  @ViewChild('roundCellTemplate') roundCellTemplate!: TemplateRef<unknown>;
  @ViewChild('mentorCellTemplate') mentorCellTemplate!: TemplateRef<unknown>;
  @ViewChild('mentorHeaderTemplate') mentorHeaderTemplate!: TemplateRef<unknown>;
  @ViewChild('roundHeaderTemplate') roundHeaderTemplate!: TemplateRef<unknown>;
  @ViewChild('distributeTeamsEvenly') distributeTeamsEvenlyTemplate!: TemplateRef<unknown>;
  @ViewChild('fullScreenLoading') fullScreenLoadingTemplate!: TemplateRef<unknown>;

  selectedMentorId: number;
  selectedRoundId: number;
  selectedRoundName: string;
  selectedMentor: IHackathonJudge;
  searchQuery = '';
  ESidebarPosition = ESidebarPosition;
  ESidebarWidth = ESidebarWidth;
  sidebarEventName = 'mentor-team-assignment';

  teamAssignmentData: {
    [mentorId: number]: {
      [roundId: number]: {
        assignedTeams: IHackathonTeam[];
        count: number;
      };
    };
  } = {};

  teamMentorCounts: Map<number, number> = new Map();
  filteredUnassignedTeams: IHackathonTeam[] = [];

  readonly icons = {
    faPlus,
    faMinus,
    faArrowRight,
    faUserCircle,
    faExpand,
    faCompress,
  };

  isFullscreen = false;

  moment = moment;
  mainSidebarEventName = 'hackathonDashboard';
  mainSidebarExpanded = true;
  mentorFilter: 'all' | 'mentors' | 'judges' = 'all';
  filteredMentors: IHackathonJudge[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private hackathonService: HackathonService,
    private roundService: RoundService,
    private toastrService: ToastrService,
    private seoService: SeoService,
    private hackathonTeamRoundScoreService: HackathonTeamRoundScoreService,
    private sidebarService: SidebarService,
    private cdr: ChangeDetectorRef,
    private dialogService: NbDialogService,
    private hackathonJudgeService: HackathonJudgeService,
    private nbMenuService: NbMenuService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.seoService.noIndex(true);
    this.sidebarService.setSidebarVisibility(this.sidebarEventName, false, true, ESidebarPosition.RIGHT);
    this.sidebarService.getSidebarVisibility(this.mainSidebarEventName).subscribe((data) => {
      this.mainSidebarExpanded = data;
      this.cdr.markForCheck();
    });
    this.activatedRoute.parent.parent.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.hackathonId = params.get('hackathon_id');
      this.loadRounds();
    });

    this.activatedRoute.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const filter = params.get('filter') as 'all' | 'mentors' | 'judges';
      this.mentorFilter = filter || 'all';
      this.applyMentorFilter();
    });

    this.setupContextMenuListener();
  }

  setupContextMenuListener(): void {
    this.nbMenuService
      .onItemClick()
      .pipe(
        filter(({ tag }) => tag.startsWith('mentor-') || tag === 'header-actions'),
        map(({ item, tag }) => ({ item, tag })),
        takeUntil(this.destroy$),
      )
      .subscribe(({ item, tag }) => {
        if (tag === 'header-actions') {
          const index = item.data.index;
          if (index === 0) {
            this.openBulkDashboardLinkDialog();
          } else if (index === 1) {
            this.openBulkCustomEmailDialog();
          }
        } else {
          const mentor = item.data.mentor;
          const index = item.data.index;
          if (index === 0) {
            this.openIndividualDashboardLinkDialog(mentor);
          } else if (index === 1) {
            this.openIndividualCustomEmailDialog(mentor);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMentors(): void {
    let query: string[];
    if (this.mentorFilter === 'all') {
      query = [EHackathonJudgeType.MENTOR, EHackathonJudgeType.JUDGE];
    } else if (this.mentorFilter === 'judges') {
      query = [EHackathonJudgeType.JUDGE];
    } else if (this.mentorFilter === 'mentors') {
      query = [EHackathonJudgeType.MENTOR];
    }
    this.hackathonService
      .indexJudge(this.hackathonId, query, EInvitationStatus.ACCEPTED)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.mentors = data || [];
        this.filteredMentors = data || [];
        this.buildTableDataIfReady();
        this.cdr.markForCheck();
      });
  }

  loadRounds(): void {
    this.roundService.indexRounds(this.hackathonId, EDbModels.HACKATHON).subscribe((data) => {
      this.rounds = data;
      this.buildTableColumns();
      this.loadAllTeams();
      this.cdr.markForCheck();
    });
  }

  loadAllTeams(): void {
    this.isLoading = true;
    this.hackathonService
      .indexTeams(this.hackathonId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.teams = data;
          this.loadExistingAssignments();
          this.buildTableDataIfReady();
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoading = false;
          this.toastrService.warningDialog('Failed to load teams');
          this.cdr.markForCheck();
        },
      });
  }

  loadExistingAssignments(): void {
    this.hackathonTeamRoundScoreService
      .assignmentSummary(this.hackathonId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summaries) => {
          this.mentorAssignments.clear();
          summaries.forEach((summary) => {
            const key = `${summary.mentor_id}_${summary.round_id}`;
            this.mentorAssignments.set(key, summary.team_ids || []);
          });
          this.buildTableDataIfReady();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to load assignments:', err);
        },
      });
  }

  buildTableDataIfReady(): void {
    if (this.rounds.length > 0) {
      this.buildTableData();
      if (this.teams.length > 0 && this.mentors.length > 0) {
        this.buildTeamAssignmentData();
      }
    }
  }

  addTeamToMentor(mentorId: number, teamId: number, roundId: number): void {
    this.hackathonTeamRoundScoreService
      .assignJudge(mentorId, teamId, roundId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const key = `${mentorId}_${roundId}`;
          const teams = this.mentorAssignments.get(key) || [];
          if (!teams.includes(teamId)) {
            teams.push(teamId);
            this.mentorAssignments.set(key, teams);
          }
          this.buildTeamAssignmentData();
          this.updateFilteredTeams();
          this.toastrService.successDialog('Team assigned successfully');
          this.cdr.markForCheck();
        },
        error: () => {
          this.toastrService.warningDialog('Failed to assign team');
        },
      });
  }

  removeTeamFromMentor(mentorId: number, teamId: number, roundId: number): void {
    this.hackathonTeamRoundScoreService
      .unassignMentor(mentorId, teamId, roundId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const key = `${mentorId}_${roundId}`;
          const teams = this.mentorAssignments.get(key) || [];
          const index = teams.indexOf(teamId);
          if (index > -1) {
            teams.splice(index, 1);
            this.mentorAssignments.set(key, teams);
          }
          this.buildTeamAssignmentData();
          this.updateFilteredTeams();
          this.toastrService.successDialog('Team removed successfully');
          this.cdr.markForCheck();
        },
        error: () => {
          this.toastrService.warningDialog('Failed to remove team');
        },
      });
  }

  buildTeamAssignmentData(): void {
    this.teamAssignmentData = {};
    this.teamMentorCounts.clear();

    this.mentors.forEach((mentor) => {
      this.teamAssignmentData[mentor.id] = {};
      this.rounds.forEach((round) => {
        const key = `${mentor.id}_${round.id}`;
        const teamIds = this.mentorAssignments.get(key) || [];
        const assignedTeams = this.teams.filter((team) => teamIds.includes(team.id));
        this.teamAssignmentData[mentor.id][round.id] = {
          assignedTeams,
          count: assignedTeams.length,
        };

        teamIds.forEach((teamId) => {
          this.teamMentorCounts.set(teamId, (this.teamMentorCounts.get(teamId) || 0) + 1);
        });
      });
    });
  }

  getUnassignedTeamsForRound(mentorId: number, roundId: number): IHackathonTeam[] {
    const key = `${mentorId}_${roundId}`;
    const teamIds = this.mentorAssignments.get(key) || [];
    return this.teams.filter((team) => !teamIds.includes(team.id));
  }

  openTeamSelector(mentorId: number, roundId: number, mentor: IHackathonJudge, roundName: string): void {
    this.selectedMentorId = mentorId;
    this.selectedRoundId = roundId;
    this.selectedRoundName = roundName;
    this.selectedMentor = mentor;
    this.searchQuery = '';
    this.updateFilteredTeams();
    this.sidebarService.openSidebar(this.sidebarEventName);
    this.cdr.markForCheck();
  }

  closeSidebar(): void {
    this.sidebarService.closeSidebar(this.sidebarEventName);
    this.selectedMentorId = null;
    this.selectedRoundId = null;
    this.selectedRoundName = null;
    this.selectedMentor = null;
    this.searchQuery = '';
    this.filteredUnassignedTeams = [];
    this.cdr.markForCheck();
  }

  updateFilteredTeams(): void {
    if (!this.selectedMentorId || !this.selectedRoundId) {
      this.filteredUnassignedTeams = [];
      return;
    }
    const teams = this.getUnassignedTeamsForRound(this.selectedMentorId, this.selectedRoundId).filter(
      (team) => team.round?.id === this.selectedRoundId,
    );
    if (!this.searchQuery) {
      this.filteredUnassignedTeams = teams;
    } else {
      this.filteredUnassignedTeams = teams.filter((team) =>
        team.name.toLowerCase().includes(this.searchQuery.toLowerCase()),
      );
    }
  }

  onSearchChange(): void {
    this.updateFilteredTeams();
    this.cdr.markForCheck();
  }

  assignTeam(teamId: number): void {
    if (!teamId || !this.selectedMentorId || !this.selectedRoundId) {
      this.toastrService.warningDialog('Invalid selection');
      return;
    }
    this.addTeamToMentor(this.selectedMentorId, teamId, this.selectedRoundId);
  }

  buildTableColumns(): void {
    this.tableColumns = [
      {
        key: 'mentor',
        title: 'Mentors ⬇️ / Rounds ➡️',
        width: '250px',
        frozen: true,
        cellTemplate: this.mentorCellTemplate,
        headerTemplate: this.mentorHeaderTemplate,
      },
      ...this.rounds.map((round) => ({
        key: `round_${round.id}`,
        title: round.name,
        width: '200px',
        cellTemplate: this.roundCellTemplate,
        headerTemplate: this.roundHeaderTemplate,
        round: round,
      })),
    ];
  }

  onRoundActionChange(event: Event, roundId: number): void {
    const select = event.target as HTMLSelectElement;
    const action = select.value;

    if (action === 'distribute') {
      this.openDistributeTeamsDialog(roundId);
    }

    select.value = '';
  }

  openDistributeTeamsDialog(roundId: number): void {
    this.dialogService.open(this.distributeTeamsEvenlyTemplate, {
      context: { roundId },
    });
  }

  confirmDistributeTeams(roundId: number): void {
    const dialogRef = this.dialogService.open(this.fullScreenLoadingTemplate);
    let judgeTypes: string[];
    if (this.mentorFilter === 'all') {
      judgeTypes = [EHackathonJudgeType.MENTOR, EHackathonJudgeType.JUDGE];
    } else if (this.mentorFilter === 'judges') {
      judgeTypes = [EHackathonJudgeType.JUDGE];
    } else {
      judgeTypes = [EHackathonJudgeType.MENTOR];
    }
    this.hackathonTeamRoundScoreService
      .distributeTeamsEvenly(this.hackathonId, roundId, judgeTypes)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastrService.successDialog('Teams distributed successfully');
          this.loadExistingAssignments();
          dialogRef.close();
          this.cdr.markForCheck();
        },
        error: () => {
          this.toastrService.warningDialog('Failed to distribute teams');
          dialogRef.close();
        },
      });
  }

  buildTableData(): void {
    this.tableRows = this.filteredMentors.map((mentor) => ({
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
  }

  onMentorFilterChange(filter: 'all' | 'mentors' | 'judges'): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { filter },
      queryParamsHandling: 'merge',
    });
  }

  applyMentorFilter(): void {
    if (this.hackathonId) {
      this.loadMentors();
    }
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    this.cdr.markForCheck();
  }

  getMentorActions(mentor: IHackathonJudge): NbMenuItem[] {
    return [
      {
        title: 'Send Dashboard Link',
        icon: 'link-outline',
      },
      {
        title: 'Send Custom Email',
        icon: 'email-outline',
      },
    ].map((item, index) => ({
      ...item,
      data: { mentor, index },
    }));
  }

  getHeaderActions(): NbMenuItem[] {
    return [
      {
        title: 'Send Dashboard Link to All',
        icon: 'link-2-outline',
      },
      {
        title: 'Send Email to All',
        icon: 'email-outline',
      },
    ].map((item, index) => ({
      ...item,
      data: { index },
    }));
  }

  openBulkDashboardLinkDialog(): void {
    this.dialogService.open(MentorDashboardLinkDialogComponent, {
      context: {
        hackathonId: Number(this.hackathonId),
        isBulk: true,
      },
    });
  }

  openBulkCustomEmailDialog(): void {
    this.dialogService.open(MentorCustomEmailDialogComponent, {
      context: {
        hackathonId: Number(this.hackathonId),
        isBulk: true,
      },
    });
  }

  openIndividualDashboardLinkDialog(mentor: IHackathonJudge): void {
    this.dialogService.open(MentorDashboardLinkDialogComponent, {
      context: {
        mentor,
        isBulk: false,
      },
    });
  }

  openIndividualCustomEmailDialog(mentor: IHackathonJudge): void {
    this.dialogService.open(MentorCustomEmailDialogComponent, {
      context: {
        mentor,
        isBulk: false,
      },
    });
  }

  areAllTeamsAssignedForRound(roundId: number): boolean {
    const teamsInRound = this.teams.filter((team) => team.round?.id === roundId);
    if (teamsInRound.length === 0) return true;

    const assignedTeamIds = new Set<number>();
    this.mentorAssignments.forEach((teamIds, key) => {
      if (key.endsWith(`_${roundId}`)) {
        teamIds.forEach((id) => assignedTeamIds.add(id));
      }
    });

    return teamsInRound.every((team) => assignedTeamIds.has(team.id));
  }
}
