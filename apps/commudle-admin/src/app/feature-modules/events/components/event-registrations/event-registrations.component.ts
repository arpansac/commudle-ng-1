import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IEvent, ICommunity, EDbModels } from '@commudle/shared-models';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { ICustomPage } from 'apps/shared-models/custom-page.model';
import { CustomPageService } from 'apps/commudle-admin/src/app/services/custom-page.service';
import { SeoService } from '@commudle/shared-services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'commudle-event-registrations',
  templateUrl: './event-registrations.component.html',
  styleUrls: ['./event-registrations.component.scss'],
})
export class EventRegistrationsComponent implements OnInit, OnDestroy {
  event: IEvent;
  community: ICommunity;
  refundPolicy: ICustomPage;
  showDiscountComponent = false;
  icons = {
    faArrowRight,
    faCalendar,
  };
  EDbModels = EDbModels;

  subscriptions: Subscription[] = [];
  constructor(
    private activatedRoute: ActivatedRoute,
    private eventsService: EventsService,
    private customPageService: CustomPageService,
    private seoService: SeoService,
  ) {}

  ngOnInit(): void {
    this.seoService.noIndex(true);
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((data) => {
        this.community = data.community;
        this.event = data.event;
        if (this.community.has_refund_policy) this.getRefundPolicyPage();
        this.setMeta();
      }),
    );
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  updateRegistrationType(value) {
    this.eventsService.updateCustomRegistration(this.event.id, value).subscribe((data) => {
      this.event = data;
    });
  }

  getRefundPolicyPage() {
    this.customPageService.getRefundPolicyPage(this.community.id, EDbModels.KOMMUNITY).subscribe((data) => {
      if (data) {
        this.community.has_refund_policy = true;
        this.refundPolicy = data;
      }
    });
  }

  setMeta() {
    this.seoService.setTitle(`Registrations | Dashboard | ${this.event.name} | ${this.community.name}`);
  }
}
