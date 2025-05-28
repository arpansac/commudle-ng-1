import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IHackathon } from '@commudle/shared-models';
import { NbRouteTab } from '@commudle/theme';
import { faArrowRight, faGamepad, faMicrophone, faRectangleList } from '@fortawesome/free-solid-svg-icons';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'commudle-hackathon-control-panel-tracks-prizes',
  templateUrl: './hackathon-control-panel-tracks-prizes.component.html',
  styleUrls: ['./hackathon-control-panel-tracks-prizes.component.scss'],
})
export class HackathonControlPanelTracksPrizesComponent implements OnInit, OnDestroy {
  hackathon: IHackathon;
  tabs: NbRouteTab[] = [
    {
      title: 'Tracks',
      route: './',
    },
    {
      title: 'prizes',
      route: ['./prizes'],
    },
  ];
  subscriptions: Subscription[] = [];
  icons = {
    faArrowRight,
    faGamepad,
    faRectangleList,
    faMicrophone,
  };

  constructor(private activatedRoute: ActivatedRoute, private hackathonService: HackathonService) {}

  ngOnInit() {
    this.activatedRoute.parent.paramMap.subscribe((params) => {
      this.fetchHackathonDetails(params.get('hackathon_id'));
    });
  }

  fetchHackathonDetails(hackathonId) {
    this.subscriptions.push(
      this.hackathonService.showHackathon(hackathonId).subscribe((data) => {
        this.hackathon = data;
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
