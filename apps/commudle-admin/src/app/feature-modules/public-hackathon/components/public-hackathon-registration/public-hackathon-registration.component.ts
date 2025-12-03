import { Component, Input, OnInit } from '@angular/core';
import {
  EHackathonRegistrationStatus,
  IHackathon,
  IHackathonTeam,
  IRound,
  EDbModels,
  ERoundType,
} from '@commudle/shared-models';
import { RoundService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-public-hackathon-registration',
  templateUrl: './public-hackathon-registration.component.html',
  styleUrls: ['./public-hackathon-registration.component.scss'],
})
export class PublicHackathonRegistrationComponent implements OnInit {
  @Input() hrgId: number; // ID of the hackathon response group
  @Input() userTeamDetails: IHackathonTeam;
  @Input() hackathon: IHackathon;
  EHackathonRegistrationStatus = EHackathonRegistrationStatus;
  currentDate: Date;
  hackathonApplicationEndDate: Date;
  hackathonEndDate: Date;
  canSubmitProject = false;
  canEditForm = false;
  rounds: IRound[] = [];
  ERoundType = ERoundType;

  constructor(private roundService: RoundService) {}

  ngOnInit() {
    this.calculateHackathonDatesStatus();
    this.loadRounds();
  }

  loadRounds() {
    this.roundService.pIndexRounds(this.hackathon.id, EDbModels.HACKATHON).subscribe({
      next: (rounds) => {
        this.rounds = rounds;
      },
      error: (error) => {
        console.error('Error loading rounds:', error);
      },
    });
  }

  calculateHackathonDatesStatus() {
    this.currentDate = new Date();
    this.hackathonApplicationEndDate = new Date(this.hackathon.application_end_date);
    this.hackathonEndDate = new Date(this.hackathon.end_date);

    // Add 5 days to hackathonEndDate
    const hackathonEndDatePlusFiveDays = new Date(this.hackathonEndDate);
    hackathonEndDatePlusFiveDays.setDate(this.hackathonEndDate.getDate() + 5);

    if (this.currentDate <= this.hackathonEndDate) {
      this.canSubmitProject = true;
    }
    if (this.currentDate <= hackathonEndDatePlusFiveDays) {
      this.canEditForm = true;
    }
  }
}
