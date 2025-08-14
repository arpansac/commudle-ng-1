import { Component, OnDestroy, OnInit } from '@angular/core';
import { SeoService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { SpamDetectorService } from '../../services/spam-detector.service';
import { ISpamDetector } from '@commudle/shared-models';
import moment from 'moment';

@Component({
  selector: 'commudle-admin-spam-detectors',
  templateUrl: './admin-spam-detectors.component.html',
  styleUrls: ['./admin-spam-detectors.component.scss'],
})
export class AdminSpamDetectorsComponent implements OnInit, OnDestroy {
  spamDetectors: ISpamDetector[] = [];
  page = 1;
  count = 10;
  total = 0;
  isSpam = false;
  isSpamDecision = false;
  moment = moment;

  constructor(
    private dialogService: NbDialogService,
    private seoService: SeoService,
    private spamDetectorService: SpamDetectorService,
  ) {}

  ngOnInit() {
    this.seoService.noIndex(true);
    this.getSpamDetectorsData();
    this.seoService.setTitle('Spam Detectors | Commudle');
  }

  getSpamDetectorsData() {
    console.log(this.isSpam, this.isSpamDecision);
    this.spamDetectorService
      .getSpamResult(this.page, this.count, this.isSpam, this.isSpamDecision)
      .subscribe((data) => {
        this.spamDetectors = data.values;
        console.log(this.spamDetectors, 'spam');
        this.total = data.total;
        this.page = data.page;
        this.count = data.count;
      });
  }

  create() {
    console.log('create');
  }

  changeSpamDetectorType(data) {
    this.page = 1;
    if (data.value === 'is_spam') {
      this.isSpam = true;
      this.isSpamDecision = false;
    } else {
      this.isSpam = false;
      this.isSpamDecision = true;
    }
    this.getSpamDetectorsData();
  }

  clearFilters(selectElement: HTMLSelectElement) {
    console.log(this.isSpam, this.isSpamDecision, 'clearFilters');
    this.isSpam = false;
    this.isSpamDecision = false;
    selectElement.value = '';
    this.getSpamDetectorsData();
  }

  openDialog(dialog: any) {
    this.dialogService.open(dialog);
  }

  ngOnDestroy() {
    this.seoService.noIndex(false);
  }
}
