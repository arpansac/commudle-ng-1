/* eslint-disable @nx/enforce-module-boundaries */
import { EDbModels, ICommunity, IHackathon } from '@commudle/shared-models';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService, SeoService } from '@commudle/shared-services';
import { DataFormsService } from 'apps/commudle-admin/src/app/services/data_forms.service';
import { HackathonResponseGroupService } from 'apps/commudle-admin/src/app/services/hackathon-response-group.service';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { IHackathonResponseGroup } from 'apps/shared-models/hackathon-response-group.model';
import { faArrowRight, faCircleQuestion, faMicrophone, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { ICommunityGroup } from 'apps/shared-models/community-group.model';

@Component({
  selector: 'commudle-hackathon-control-panel-registrations',
  templateUrl: './hackathon-control-panel-registrations.component.html',
  styleUrls: ['./hackathon-control-panel-registrations.component.scss'],
})
export class HackathonControlPanelRegistrationsComponent implements OnInit, OnDestroy {
  userDetailsForm: FormGroup;
  registrationTypeId = 1;
  hackathon: IHackathon;
  EDbModels = EDbModels;
  dataFormId: number;
  hackathonResponseGroupDetails: IHackathonResponseGroup;
  filled_by_only_team_lead = true;
  allow_track_problem_statement_selection = true;
  icons = {
    faUpRightFromSquare,
    faArrowRight,
    faMicrophone,
    faCircleQuestion,
  };

  subscriptions: Subscription[] = [];
  parent: ICommunity | ICommunityGroup;

  isFormInclude = false;
  constructor(
    private fb: FormBuilder,
    private hrgService: HackathonResponseGroupService,
    private activatedRoute: ActivatedRoute,
    private hackathonService: HackathonService,
    private dataFormsService: DataFormsService,
    private toastrService: ToastrService,
    private seoService: SeoService,
  ) {
    this.userDetailsForm = this.fb.group({
      name: true,
      profile_image: true,
      email: true,
      designation: false,
      about_me: false,
      location: false,
      work_experience_months: false,
      education: false,
      phone: false,
      twitter: false,
      linkedin: false,
      dribbble: false,
      youtube: false,
      medium: false,
      behance: false,
      gitlab: false,
      github: false,
      facebook: false,
      tshirt_size: false,
    });
  }

  ngOnInit() {
    this.seoService.noIndex(true);

    this.subscriptions.push(
      this.activatedRoute.parent.params.subscribe((params) => {
        this.fetchHackathonDetails(params['hackathon_id']);
      }),
    );
  }

  ngOnDestroy(): void {
    this.seoService.noIndex(false);
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  fetchHackathonDetails(hackathonId) {
    this.hackathonService.showHackathon(hackathonId).subscribe((data) => {
      this.hackathon = data;
      // TODO: Add Community Group in Future
      if (data.community) {
        this.parent = data.community;
      }
      this.setMeta();
      this.fetchHackathonResponseGroup();
    });
  }

  fetchHackathonResponseGroup() {
    this.hrgService.showHackathonResponseGroup(this.hackathon.id).subscribe((data: IHackathonResponseGroup) => {
      if (data) {
        this.hackathonResponseGroupDetails = data;
        this.dataFormId = data.data_form_id;
        if (this.dataFormId) {
          this.isFormInclude = true;
        }
        this.filled_by_only_team_lead = data.filled_by_only_team_lead;
        this.allow_track_problem_statement_selection = data.allow_track_problem_statement_selection ?? true;
        this.userDetailsForm.patchValue({
          name: data.user_details.name,
          designation: data.user_details.designation,
          about_me: data.user_details.about_me,
          location: data.user_details.location,
          work_experience_months: data.user_details.work_experience_months,
          education: data.user_details.education,
          phone: data.user_details.phone,
          email: data.user_details.email,
          twitter: data.user_details.twitter,
          linkedin: data.user_details.linkedin,
          dribbble: data.user_details.dribbble,
          youtube: data.user_details.youtube,
          medium: data.user_details.medium,
          behance: data.user_details.behance,
          gitlab: data.user_details.gitlab,
          github: data.user_details.github,
          facebook: data.user_details.facebook,
          tshirt_size: data.user_details.tshirt_size,
        });
      }
    });
  }

  submit(formResponse) {
    if (formResponse.questions.length > 0) {
      this.dataFormsService.createDataForm(formResponse, this.hackathon.id, EDbModels.HACKATHON).subscribe((data) => {
        if (data) {
          this.hackathonResponseGroupDetails
            ? this.updateHackathonResponseGroup(data)
            : this.createHackathonResponseGroup(data);
        }
      });
    } else {
      this.updateOrCreateHackathonUserResponse();
    }
  }

  updateData(formResponse) {
    this.dataFormsService.updateDataForm(formResponse).subscribe((data) => {
      if (data) {
        this.updateHackathonResponseGroup(data);
      }
    });
  }

  updateOrCreateHackathonUserResponse() {
    this.hackathonResponseGroupDetails ? this.updateHackathonResponseGroup() : this.createHackathonResponseGroup();
  }

  createHackathonResponseGroup(data?) {
    this.hrgService
      .createHackathonResponseGroup(
        JSON.stringify(this.userDetailsForm.value),
        this.hackathon.id,
        this.registrationTypeId,
        `${this.hackathon.name} - Registration`,
        this.filled_by_only_team_lead,
        this.allow_track_problem_statement_selection,
        data ? data.id : '',
      )
      .subscribe((data) => {
        if (data) {
          this.hackathonResponseGroupDetails = data;
          this.toastrService.successDialog('Information Updated');
        }
      });
  }

  updateHackathonResponseGroup(data?) {
    this.hrgService
      .updateHackathonResponseGroup(
        JSON.stringify(this.userDetailsForm.value),
        this.hackathonResponseGroupDetails.id,
        this.filled_by_only_team_lead,
        this.allow_track_problem_statement_selection,
        data ? data.id : '',
      )
      .subscribe((data) => {
        if (data) {
          this.hackathonResponseGroupDetails = data;
          this.toastrService.successDialog('Information Updated');
        }
      });
  }

  setMeta() {
    this.seoService.setTitle(`Registration Form | Dashboard | ${this.hackathon.name} | ${this.parent.name}`);
  }
}
