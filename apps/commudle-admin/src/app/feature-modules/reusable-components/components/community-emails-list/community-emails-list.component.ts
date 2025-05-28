import {
  Component,
  OnInit,
  Input,
  ViewChild,
  TemplateRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { StatsCommunitiesService } from 'apps/commudle-admin/src/app/services/stats/stats-communities.service';
import { IFixedEmail } from 'apps/shared-models/fixed-email.model';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { NbDialogService } from '@commudle/theme';

@Component({
  selector: 'app-community-emails-list',
  templateUrl: './community-emails-list.component.html',
  styleUrls: ['./community-emails-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityEmailsListComponent implements OnInit {
  @ViewChild('emailMessageTemplate') emailMessageTemplate: TemplateRef<any>;
  @Input() communityId;
  moment = moment;
  emails: IFixedEmail[] = [];
  isLoading = true;
  constructor(
    private statsCommunitiesService: StatsCommunitiesService,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private dialogService: NbDialogService,
  ) {}

  ngOnInit() {
    this.activatedRoute.parent.data.subscribe((data) => {
      if (!this.communityId) this.communityId = data.community.id;
      this.getEmails();
    });
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
