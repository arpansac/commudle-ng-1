import { Component, Input, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { ToastrService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { NewsletterService } from 'apps/commudle-admin/src/app/services/newsletter.service';
import { INewsletter } from 'apps/shared-models/newsletter.model';
import { Subscription } from 'rxjs';
import {
  faPlus,
  faClock,
  faEnvelopeOpenText,
  faArrowUpRightFromSquare,
  faListCheck,
  faEnvelopeCircleCheck,
  faEnvelopeOpen,
  faMousePointer,
  faEdit,
  faEnvelope,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';

@Component({
    selector: 'commudle-newsletter',
    templateUrl: './newsletter.component.html',
    styleUrls: ['./newsletter.component.scss'],
    standalone: false
})
export class NewsletterComponent implements OnInit, OnDestroy {
  @Input() parentId: string | number;
  @Input() parentType: 'CommunityGroup' | 'Kommunity';
  subscriptions: Subscription[] = [];
  newsletters: INewsletter[];
  newScheduleDateTime: Date;
  isLoading = true;
  icons = {
    faPlus,
    faClock,
    faEnvelopeOpenText,
    faArrowUpRightFromSquare,
    faListCheck,
    faEnvelopeCircleCheck,
    faEnvelopeOpen,
    faMousePointer,
    faEdit,
    faEnvelope,
    faTrash,
  };
  moment = moment;
  staticAssets = staticAssets;
  testEmailsForms;
  constructor(
    private newsletterService: NewsletterService,
    private dialogService: NbDialogService,
    private toastrService: ToastrService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.testEmailsForms = this.fb.group({
      emails: ['', [Validators.required, this.maxEmails(5)]],
    });
  }

  ngOnInit() {
    this.getNewsletters();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  maxEmails(max: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const emails = control.value.split(',').map((email) => email.trim());
      return emails.length <= max ? null : { maxEmails: { max } };
    };
  }

  getNewsletters() {
    this.isLoading = true;
    this.subscriptions.push(
      this.newsletterService.getIndex(this.parentId, this.parentType).subscribe((data: INewsletter[]) => {
        this.newsletters = data;
        this.isLoading = false;
        for (let i = 0; i < this.newsletters.length; i++) {
          const newsletter = this.newsletters[i];
          this.newsletterService.emailStats(newsletter.id).subscribe((data) => {
            this.newsletters[i].stats = data;
          });
        }
      }),
    );
  }

  togglePublished(id, index) {
    this.newsletterService.togglePublished(!this.newsletters[index].published, id).subscribe((data) => {
      this.newsletters[index].published = data.published;
    });
  }

  openConfirmDialogBox(dialog: TemplateRef<any>, id, index) {
    this.dialogService.open(dialog, { context: { id, index } });
  }

  destroy(id, index) {
    this.newsletterService.destroy(id).subscribe((data) => {
      if (data) {
        this.toastrService.successDialog('Deleted Successfully');
        this.newsletters.splice(index, 1);
      }
    });
  }

  redirectTo(slug) {
    let redirectUrl = '';
    if (this.parentType === 'Kommunity') {
      redirectUrl = '/communities/' + this.parentId + '/newsletters/' + slug;
    }
    if (this.parentType === 'CommunityGroup') {
      redirectUrl = '/orgs/' + this.parentId + '/newsletters/' + slug;
    }
    const url = this.router.serializeUrl(this.router.createUrlTree([redirectUrl]));
    window.open(url, '_blank');
  }

  openScheduleDialogBox(dialog: TemplateRef<any>, id, index) {
    this.newScheduleDateTime = new Date();
    this.dialogService.open(dialog, { context: { id, index } });
  }

  setSchedule(id, index) {
    const scheduleDate = new Date(this.newScheduleDateTime).toISOString();
    this.newsletterService.setSchedule(id, scheduleDate).subscribe((data) => {
      if (data) this.newsletters[index].scheduled_for = this.newScheduleDateTime;
    });
  }

  resetSchedule(id, index) {
    this.newsletterService.resetSchedule(id).subscribe((data) => {
      if (data) this.newsletters[index].scheduled_for = null;
    });
  }

  sendTestMail(newsletterId) {
    this.newsletterService
      .sendTestEmail(
        newsletterId,
        this.testEmailsForms.value.emails
          .replaceAll(' ', '')
          .split(',')
          .filter((x) => x),
      )
      .subscribe((data) => {
        if (data) {
          this.toastrService.successDialog('Test Email send successfully');
          this.testEmailsForms.reset();
        }
      });
  }
}
