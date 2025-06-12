import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import { faArrowRight, faTag } from '@fortawesome/free-solid-svg-icons';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { IEvent, ICommunity } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'commudle-event-agenda',
  templateUrl: './event-agenda.component.html',
  styleUrls: ['./event-agenda.component.scss'],
})
export class EventAgendaComponent implements OnInit, OnDestroy {
  event: IEvent;
  community: ICommunity;
  icons = {
    faArrowRight,
    faStar,
    faTag,
  };

  subscriptions: Subscription[] = [];
  constructor(
    private activatedRoute: ActivatedRoute,
    private eventsService: EventsService,
    private seoService: SeoService,
  ) {}

  ngOnInit(): void {
    this.seoService.noIndex(true);
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((data) => {
        this.community = data.community;
        this.event = data.event;
        this.setMeta();
      }),
    );
  }
  updateAgendaType(value) {
    this.eventsService.updateCustomAgenda(this.event.id, value).subscribe((data) => {
      this.event = data;
    });
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  setMeta() {
    this.seoService.setTitle(`Location & Agenda | Dashboard | ${this.event.name} | ${this.community.name}`);
  }
}
