import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IProfanity } from '@commudle/shared-models';
import { SeoService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { ProfanityService } from 'apps/commudle-admin/src/app/feature-modules/sys-admin/services/profanity.service';

@Component({
  selector: 'commudle-admin-profanity',
  templateUrl: './admin-profanity.component.html',
  styleUrls: ['./admin-profanity.component.scss'],
})
export class AdminProfanityComponent implements OnInit, OnDestroy {
  profanityTerms: IProfanity[];
  profanityTermForm: FormGroup;
  showAllResults = '';
  page = 1;
  count = 10;
  total = 0;
  constructor(
    private profanityService: ProfanityService,
    private dialogService: NbDialogService,
    private fb: FormBuilder,
    private seoService: SeoService,
  ) {
    this.profanityTermForm = this.fb.group({
      word: [''],
      domain: [''],
      has_word: [true, Validators.required],
    });
  }

  ngOnInit() {
    this.seoService.noIndex(true);
    this.getProfanityTerms();
    this.seoService.setTitle('Profanity Words Handler | Commudle');
  }

  getProfanityTerms() {
    this.profanityService.indexProfanity(this.showAllResults, this.page, this.count).subscribe((res) => {
      this.profanityTerms = res.values;
      this.total = res.total;
      this.page = res.page;
      this.count = res.count;
    });
  }

  changeProfanityType() {
    this.page = 1;
    this.getProfanityTerms();
  }

  openDialog(dialog) {
    this.dialogService.open(dialog);
  }

  create() {
    this.profanityService.createProfanityTerm(this.profanityTermForm.value).subscribe((res) => {
      this.profanityTerms.push(res);
    });
  }

  ngOnDestroy() {
    this.seoService.noIndex(false);
  }
}
