import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IProfanity } from '@commudle/shared-models';
import { NbDialogService } from '@commudle/theme';
import { ProfanityService } from 'apps/commudle-admin/src/app/feature-modules/sys-admin/services/profanity.service';

@Component({
  selector: 'commudle-admin-profanity',
  templateUrl: './admin-profanity.component.html',
  styleUrls: ['./admin-profanity.component.scss'],
})
export class AdminProfanityComponent implements OnInit {
  profanityTerms: IProfanity[];
  profanityTermForm: FormGroup;
  constructor(
    private profanityService: ProfanityService,
    private dialogService: NbDialogService,
    private fb: FormBuilder,
  ) {
    this.profanityTermForm = this.fb.group({
      word: [''],
      domain: [''],
      has_word: [true, Validators.required],
    });
  }

  ngOnInit() {
    this.getProfanityTerms();
  }

  getProfanityTerms() {
    this.profanityService.indexProfanity().subscribe((res) => {
      this.profanityTerms = res;
    });
  }

  openDialog(dialog) {
    this.dialogService.open(dialog);
  }

  create() {
    this.profanityService.createProfanityTerm(this.profanityTermForm.value).subscribe((res) => {
      this.profanityTerms.push(res);
    });
  }
}
