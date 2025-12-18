import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HackathonEntryPassesService } from '@commudle/shared-services';
import { IHackathon } from '@commudle/shared-models';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';

@Component({
  selector: 'commudle-hackathon-checked-in-list',
  templateUrl: './hackathon-checked-in-list.component.html',
  styleUrl: './hackathon-checked-in-list.component.scss',
})
export class HackathonCheckedInListComponent implements OnInit, OnDestroy {
  hackathonId: number | string;
  hackathon: IHackathon;
  attendanceStats: any;
  isLoading = true;
  page = 1;
  count = 10;
  total = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private hackathonEntryPassesService: HackathonEntryPassesService,
    private hackathonService: HackathonService,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.hackathonId = params['hackathon_id'];
      this.hackathonService.showHackathon(this.hackathonId).subscribe((data) => {
        this.hackathon = data;
        this.loadAttendanceStats();
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAttendanceStats(): void {
    this.isLoading = true;
    this.hackathonEntryPassesService
      .attendanceStats(this.hackathonId, this.count, this.page)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.attendanceStats = response;
        this.total = response.checked_in_teams?.total || 0;
        this.count = response.checked_in_teams?.count || 10;
        this.isLoading = false;
      });
  }
}
