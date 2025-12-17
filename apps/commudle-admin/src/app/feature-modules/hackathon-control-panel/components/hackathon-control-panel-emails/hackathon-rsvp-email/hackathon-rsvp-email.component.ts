import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@commudle/theme';
import { IHackathonTeam } from '@commudle/shared-models';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { ToastrService } from '@commudle/shared-services';
import { IHackathon } from 'apps/shared-models/hackathon.model';

@Component({
  selector: 'commudle-hackathon-rsvp-email',
  templateUrl: './hackathon-rsvp-email.component.html',
  styleUrls: ['./hackathon-rsvp-email.component.scss'],
})
export class HackathonRsvpEmailComponent implements OnInit {
  rsvpForm: FormGroup;
  team: IHackathonTeam;
  hackathon: IHackathon;
  isBulkEmail = false;
  resend = false;

  tinyMCE = {
    min_height: 300,
    menubar: false,
    convert_urls: false,
    placeholder: 'Write Message (Optional)',
    content_style:
      "@import url('https://fonts.googleapis.com/css?family=Inter'); body {font-family: 'Inter'; font-size: 16px !important;}",
    plugins: ['advlist', 'lists', 'autolink', 'link', 'charmap', 'preview', 'anchor', 'wordcount', 'autoresize'],
    toolbar:
      'bold italic underline | link | alignleft aligncenter alignright alignjustify | bullist numlist | removeformat',
    default_link_target: '_blank',
    branding: false,
    license_key: 'gpl',
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<HackathonRsvpEmailComponent>,
    private hackathonService: HackathonService,
    private toastrService: ToastrService,
  ) {}

  ngOnInit() {
    const subject = `🚀 Confirm Your Participation:: ${this.hackathon.name}`;
    this.rsvpForm = this.fb.group({
      subject: [subject, Validators.required],
      message: [''],
      resend: [false],
    });
  }

  sendRsvpEmail() {
    if (this.rsvpForm.invalid) return;
    const apiCall = this.isBulkEmail
      ? this.hackathonService.sendRsvpToAllTeams(
          this.hackathon.id,
          this.rsvpForm.value.subject,
          this.rsvpForm.value.message,
          this.rsvpForm.value.resend,
        )
      : this.hackathonService.sendRsvpEmail(
          this.team.id,
          this.rsvpForm.value.subject,
          this.rsvpForm.value.message,
          this.rsvpForm.value.resend,
        );

    apiCall.subscribe((data) => {
      if (data) {
        this.toastrService.successDialog('RSVP email sent successfully!');
        this.dialogRef.close();
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
