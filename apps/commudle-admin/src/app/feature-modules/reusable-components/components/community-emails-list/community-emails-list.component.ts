import {
  Component,
  OnInit,
  Input,
  ViewChild,
  TemplateRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { StatsCommunitiesService } from 'apps/commudle-admin/src/app/services/stats/stats-communities.service';
import { IFixedEmail } from 'apps/shared-models/fixed-email.model';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { NbDialogService } from '@commudle/theme';
import { ICommunity, IEvent } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-community-emails-list',
  templateUrl: './community-emails-list.component.html',
  styleUrls: ['./community-emails-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityEmailsListComponent implements OnInit, OnDestroy {
  @ViewChild('emailMessageTemplate') emailMessageTemplate: TemplateRef<any>;
  @Input() communityId;
  moment = moment;
  emails: IFixedEmail[] = [];
  isLoading = true;

  community: ICommunity;
  event: IEvent;

  subscriptions: Subscription[] = [];
  constructor(
    private statsCommunitiesService: StatsCommunitiesService,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private dialogService: NbDialogService,
    private seoService: SeoService,
  ) {}

  ngOnInit() {
    this.seoService.noIndex(true);
    this.subscriptions.push(
      this.activatedRoute.parent.data.subscribe((data) => {
        this.community = data.community;
        this.event = data.event;
        if (!this.communityId) {
          this.communityId = data.community.id;
        }
        this.getEmails();
        this.setMeta();

        this.changeDetectorRef.markForCheck();
      }),
    );
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  setMeta() {
    this.seoService.setTitle(`Mails Sent Stats | Dashboard | ${this.event.name} | ${this.community.name}`);
  }

  getEmails() {
    this.isLoading = true;
    this.emails = [];
    this.statsCommunitiesService.emails(this.communityId).subscribe((data) => {
      this.emails = data.fixed_emails;
      this.isLoading = false;
      this.changeDetectorRef.markForCheck();
    });
  }

  openEmailPreview(email) {
    this.dialogService.open(this.emailMessageTemplate, {
      context: {
        title: email.subject,
        message: email.message,
      },
    });
  }
}
