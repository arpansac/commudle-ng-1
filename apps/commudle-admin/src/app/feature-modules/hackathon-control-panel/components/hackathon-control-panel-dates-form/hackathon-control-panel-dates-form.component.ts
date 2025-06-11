import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IHackathon } from 'apps/shared-models/hackathon.model';
import { Subscription } from 'rxjs';
import * as momentTimezone from 'moment-timezone';
import { ActivatedRoute } from '@angular/router';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from '@commudle/shared-services';
import { faArrowRight, faAward, faGamepad, faRectangleList } from '@fortawesome/free-solid-svg-icons';
import { ICommunity } from 'apps/shared-models/community.model';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';
import { SeoService } from 'apps/shared-services/seo.service';

@Component({
  selector: 'commudle-hackathon-control-panel-dates-form',
  templateUrl: './hackathon-control-panel-dates-form.component.html',
  styleUrls: ['./hackathon-control-panel-dates-form.component.scss'],
})
export class HackathonControlPanelDatesFormComponent implements OnInit, OnDestroy {
  hackathonDatesForm: FormGroup;
  hackathonSlug = '';

  subscriptions: Subscription[] = [];
  hackathon: IHackathon;
  parent: ICommunity | ICommunityGroup;

  allTimeZones;
  userTimeZone;
  invalidFormFields = false;

  icons = {
    faArrowRight,
    faAward,
    faGamepad,
    faRectangleList,
  };

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private hackathonService: HackathonService,
    private datePipe: DatePipe,
    private toastrService: ToastrService,
    private seoService: SeoService,
  ) {
    this.hackathonDatesForm = this.fb.group({
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      application_start_date: ['', Validators.required],
      application_end_date: ['', Validators.required],
      timezone: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.seoService.noIndex(true);
    this.allTimeZones = momentTimezone.tz.names();

    this.subscriptions.push(
      this.activatedRoute.parent.paramMap.subscribe((params) => {
        this.fetchHackathonDetails(params.get('hackathon_id'));
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  fetchHackathonDetails(hackathonId) {
    this.subscriptions.push(
      this.hackathonService.showHackathon(hackathonId).subscribe((data) => {
        this.hackathon = data;
        // TODO: Add Community Group in Future
        if (data.community) {
          this.parent = data.community;
        }
        this.setMeta();
        if (!this.hackathon.timezone) {
          this.hackathonDatesForm.patchValue({
            timezone: momentTimezone.tz.guess(),
          });
        } else {
          this.patchDatesValue(data);
        }
      }),
    );
  }

  createOrUpdate() {
    const formData = new FormData();
    Object.keys(this.hackathonDatesForm.value).forEach((key) => {
      key === 'timezone'
        ? formData.append('hackathon[' + key + ']', this.hackathonDatesForm.value[key])
        : formData.append('hackathon[' + key + ']', this.convertDateToLocal(this.hackathonDatesForm.value[key]));
    });
    this.hackathonService.updateHackathonDates(formData, this.hackathon.id).subscribe((data) => {
      if (data) {
        this.toastrService.successDialog('Hackathon dates was updated');
      }
    });
  }

  patchDatesValue(hackathon) {
    this.hackathonDatesForm.patchValue({
      start_date: this.datePipe.transform(hackathon.start_date, 'yyyy-MM-ddTHH:mm:ss'),
      end_date: this.datePipe.transform(hackathon.end_date, 'yyyy-MM-ddTHH:mm:ss'),
      application_start_date: this.datePipe.transform(hackathon.application_start_date, 'yyyy-MM-ddTHH:mm:ss'),
      application_end_date: this.datePipe.transform(hackathon.application_end_date, 'yyyy-MM-ddTHH:mm:ss'),
      timezone: hackathon.timezone,
    });
  }

  convertDateToLocal(submissionDeadlineLocal) {
    return new Date(submissionDeadlineLocal).toISOString();
  }

  validateApplicationClosedDates() {
    const applicationStartDate = new Date(this.hackathonDatesForm.controls['application_start_date'].value);
    const applicationCloseDate = new Date(this.hackathonDatesForm.controls['application_end_date'].value);
    if (applicationStartDate >= applicationCloseDate) {
      this.invalidFormFields = true;
      this.toastrService.warningDialog(
        'Invalid: Application close Date and Time must greater than Application start Date and Time',
      );
    } else {
      this.invalidFormFields = false;
    }
  }

  validateEndsDates() {
    const startDateTime = new Date(this.hackathonDatesForm.controls['start_date'].value);
    const endDateTime = new Date(this.hackathonDatesForm.controls['end_date'].value);
    if (startDateTime >= endDateTime) {
      this.invalidFormFields = true;
      this.toastrService.warningDialog('Invalid: End Date and Time must greater than Start Date and Time');
    } else {
      this.invalidFormFields = false;
    }
  }

  setMeta() {
    this.seoService.setTitle(`Dates | Dashboard | ${this.hackathon.name} | ${this.parent.name}`);
  }
}
