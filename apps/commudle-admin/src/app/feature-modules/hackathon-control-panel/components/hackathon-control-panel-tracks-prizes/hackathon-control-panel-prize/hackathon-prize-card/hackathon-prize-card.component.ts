/* eslint-disable @nx/enforce-module-boundaries */
import { ToastrService } from '@commudle/shared-services';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { IHackathonUserResponses } from 'apps/shared-models/hackathon-user-responses.model';
import { HackathonWinnerService } from 'apps/commudle-admin/src/app/services/hackathon-winner.service';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { countries_details } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { IHackathonPrize, IHackathonTeam, IHackathonWinner } from '@commudle/shared-models';

@Component({
    selector: 'commudle-hackathon-prize-card',
    templateUrl: './hackathon-prize-card.component.html',
    styleUrls: ['./hackathon-prize-card.component.scss'],
    standalone: false
})
export class HackathonPrizeCardComponent implements OnInit {
  @Input() hackathonPrize: IHackathonPrize;
  @Output() editPrizeEvent: EventEmitter<IHackathonPrize> = new EventEmitter();
  @Output() destroyPrizeEvent: EventEmitter<number> = new EventEmitter();
  countryDetails = countries_details;
  prizeCurrencySymbol: any;
  hackathonUserResponses: IHackathonUserResponses[];
  icons = {
    faXmark,
  };

  page = 1;
  total: number;
  count = 10;

  constructor(
    private nbDialogService: NbDialogService,
    private hackathonService: HackathonService,
    private hackathonWinnerService: HackathonWinnerService,
    private toastrService: ToastrService,
  ) {}

  ngOnInit() {
    this.prizeCurrencySymbol = this.countryDetails.find(
      (detail) => detail.currency === this.hackathonPrize.currency_type,
    );

    if (!this.prizeCurrencySymbol) {
      this.prizeCurrencySymbol = {
        symbol: this.hackathonPrize.currency_type,
      };
    }
  }

  editPrize(prize) {
    this.editPrizeEvent.emit(prize);
  }

  deletePrize(hackathonPrizeId) {
    this.destroyPrizeEvent.emit(hackathonPrizeId);
  }

  openPrizeDistributionDialogBox(dialog) {
    this.fetchHackathonUserResponses();
    this.nbDialogService.open(dialog, {});
  }

  fetchHackathonUserResponses() {
    this.hackathonService
      .indexUserResponses(this.hackathonPrize.hackathon_id, this.page, this.count)
      .subscribe((data) => {
        if (data) {
          this.hackathonUserResponses = data.values;
          this.page = data.page;
          this.total = data.total;

          for (const hur of this.hackathonUserResponses) {
            for (const hw of hur.team.hackathon_winners) {
              if (hw.hackathon_prize.id === this.hackathonPrize.id) {
                hur.team.prize_selected = true;
                break;
              } else {
                hur.team.prize_selected = false;
              }
            }
          }
        }
      });
  }

  addWinner(team: IHackathonTeam, index: number) {
    this.hackathonWinnerService
      .addHackathonWinner(this.hackathonPrize.id, team.id)
      .subscribe((data: IHackathonWinner) => {
        this.hackathonUserResponses[index].team.hackathon_winners.push(data);
        this.hackathonUserResponses[index].team.prize_selected = true;
        this.toastrService.successDialog('Winner Selected');
      });
  }

  removeWinner(winnerId, userResponseIndex, winnerIndex) {
    this.hackathonWinnerService.removeHackathonWinner(winnerId).subscribe((data) => {
      if (data) {
        const team = this.hackathonUserResponses[userResponseIndex].team;
        this.hackathonUserResponses[userResponseIndex].team.prize_selected = false;
        const winners = team.hackathon_winners;
        winners.splice(winnerIndex, 1);
        this.toastrService.successDialog('Winner Removed');
      }
    });
  }

  openAddWinnerConfirmationDialogBox(dialog, team: IHackathonTeam, index: number) {
    this.nbDialogService.open(dialog, {
      context: {
        team: team,
        index: index,
      },
    });
  }

  removeWinnerConfirmationDialogBox(dialog, winnerId, userResponseIndex, winnerIndex) {
    this.nbDialogService.open(dialog, {
      context: {
        winnerId: winnerId,
        userResponseIndex: userResponseIndex,
        winnerIndex: winnerIndex,
      },
    });
  }
}
