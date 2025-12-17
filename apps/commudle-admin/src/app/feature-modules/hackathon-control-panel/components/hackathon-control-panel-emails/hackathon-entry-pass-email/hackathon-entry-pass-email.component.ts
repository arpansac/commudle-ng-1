import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@commudle/theme';
import { IHackathonTeam } from '@commudle/shared-models';
import { HackathonService } from 'apps/commudle-admin/src/app/services/hackathon.service';
import { ToastrService } from '@commudle/shared-services';
import { IHackathon } from 'apps/shared-models/hackathon.model';
import { IHackathonUserResponses } from 'apps/shared-models/hackathon-user-responses.model';

@Component({
  selector: 'commudle-hackathon-entry-pass-email',
  templateUrl: './hackathon-entry-pass-email.component.html',
  styleUrls: ['./hackathon-entry-pass-email.component.scss'],
})
export class HackathonEntryPassEmailComponent implements OnInit {
  entryPassForm: FormGroup;
  hackathon: IHackathon;
  hackathonUserResponses: IHackathonUserResponses;
  isBulkEmail = false;

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
    private dialogRef: NbDialogRef<HackathonEntryPassEmailComponent>,
    private hackathonService: HackathonService,
    private toastrService: ToastrService,
  ) {}

  ngOnInit() {
    const subject = `🎟️ Entry Pass:: ${this.hackathon.name}`;
    this.entryPassForm = this.fb.group({
      subject: [subject, Validators.required],
      message: [''],
    });
  }

  sendEntryPassEmail() {
    if (this.entryPassForm.invalid) return;
    const apiCall = this.isBulkEmail
      ? this.hackathonService.sendEntryPassesToAllTeams(
          this.hackathon.id,
          this.entryPassForm.value.subject,
          this.entryPassForm.value.message,
        )
      : this.hackathonService.sendEntryPassEmail(
          this.hackathonUserResponses.team.id,
          this.entryPassForm.value.subject,
          this.entryPassForm.value.message,
        );

    apiCall.subscribe((data) => {
      if (data) {
        this.toastrService.successDialog('Entry pass email sent successfully!');
        this.dialogRef.close();
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
