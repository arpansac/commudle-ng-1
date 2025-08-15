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
  actionSelectValue: string[] = [];
  lastConfirmedValues: any[] = []; // Track the last confirmed value for each row

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
    this.spamDetectorService
      .getSpamResult(this.page, this.count, this.isSpam, this.isSpamDecision)
      .subscribe((data) => {
        this.spamDetectors = data.values;
        this.total = data.total;
        this.page = data.page;
        this.count = data.count;
        this.actionSelectValue = new Array(this.spamDetectors.length).fill('');
        this.lastConfirmedValues = new Array(this.spamDetectors.length).fill('');
      });
  }

  updateSpamDetector(selectedValue, id, index) {
    this.actionSelectValue[index] = selectedValue;
    this.lastConfirmedValues[index] = selectedValue;
    this.spamDetectorService.updateSpamDetector(selectedValue, id).subscribe(() => {});
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
    this.isSpam = false;
    this.isSpamDecision = false;
    selectElement.value = '';
    this.getSpamDetectorsData();
  }

  openDialog(selectedValue, id, index, dialog) {
    if (selectedValue === true || selectedValue === false) {
      const previousValue = this.lastConfirmedValues[index];

      this.dialogService.open(dialog, {
        context: {
          selectedValue,
          id,
          index,
          previousValue,
        },
      });
    }
  }

  onCancel(index: number, previousValue: any) {
    this.actionSelectValue[index] = previousValue;
  }

  ngOnDestroy() {
    this.seoService.noIndex(false);
  }
}
