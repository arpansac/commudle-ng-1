import { Component, OnInit, Input } from '@angular/core';
import { ICommunity, IHackathon, IUser } from '@commudle/shared-models';
import * as moment from 'moment';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import {
  faArrowUpRightFromSquare,
  faCalendarDays,
  faCalendarPlus,
  faLocationDot,
  faSackDollar,
  faShareNodes,
} from '@fortawesome/free-solid-svg-icons';
import { faApple, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { countries_details, ShareService } from '@commudle/shared-services';
import { environment } from '@commudle/shared-environments';
import { NbDialogService } from '@commudle/theme';
import { AddToCalendarComponent } from '@commudle/shared-components';

@Component({
  selector: 'commudle-hackathon-registered-card',
  templateUrl: './hackathon-registered-card.component.html',
  styleUrls: ['./hackathon-registered-card.component.scss'],
})
export class HackathonRegisteredCardComponent implements OnInit {
  @Input() hackathon: IHackathon;
  @Input() community: ICommunity;
  @Input() showRegisteredIcon = true;
  @Input() showAddToCalendarButton = true;
  moment = moment;
  interestedUsers: IUser[];
  interestedUsersCount: number;
  hackathonUrl: string;
  totalPrizesByCurrency: { currency: any; amount: number }[];
  countryDetails = countries_details;

  readonly icons = {
    faCalendarDays,
    faLocationDot,
    faCalendarPlus,
    faShareNodes,
    faArrowUpRightFromSquare,
    faCircleCheck,
    faSackDollar,
  };

  constructor(
    private hackathonService: HackathonService,
    private shareService: ShareService,
    private dialogService: NbDialogService,
  ) {}

  ngOnInit(): void {
    this.fetchInterestedMembers();
    if (this.hackathon.total_prize_amount) {
      this.totalPrizesByCurrency = Object.keys(this.hackathon.total_prize_amount).map((currency) => ({
        currency: this.countryDetails.find((detail) => detail.currency === currency),
        amount: this.hackathon.total_prize_amount[currency],
      }));
    }
  }

  fetchInterestedMembers() {
    this.hackathonService.pInterestedUsers(this.hackathon.id).subscribe((data) => {
      this.interestedUsers = data.users;
      this.interestedUsersCount = data.total_count;
    });
  }

  shareHackathon() {
    const hackathonUrl = `${environment.app_url}/communities/${this.hackathon.community.id}/hackathons/${this.hackathon.slug}`;
    const shareText = `Check out this hackathon: ${this.hackathon.name}`;
    this.shareService.shareContent(hackathonUrl, this.hackathon.name, shareText, hackathonUrl);
  }

  addToCalendar() {
    this.dialogService.open(AddToCalendarComponent, {
      context: {
        startDate: this.hackathon.start_date,
        endDate: this.hackathon.end_date,
        title: this.hackathon.name,
        location: this.hackathon.location_name,
        details: this.hackathon.description,
      },
    });
  }
}
