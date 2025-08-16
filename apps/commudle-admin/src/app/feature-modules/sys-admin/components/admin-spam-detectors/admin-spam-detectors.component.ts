import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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
  isSpam: boolean | null = null;
  isSpamDecision: boolean | null = null;
  moment = moment;

  constructor(
    private dialogService: NbDialogService,
    private seoService: SeoService,
    private spamDetectorService: SpamDetectorService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.seoService.noIndex(true);
    this.getSpamDetectorsData();
    this.seoService.setTitle('Spam Detectors | Commudle');
  }

  getSpamDetectorsData() {
    console.log(this.isSpam, this.isSpamDecision, 'isSpam, isSpamDecision');
    this.spamDetectorService
      .getSpamResult(this.page, this.count, this.isSpam, this.isSpamDecision)
      .subscribe((data) => {
        this.spamDetectors = data.values;
        this.total = data.total;
        this.page = data.page;
        this.count = data.count;
      });
  }

  updateSpamDetector(selectedValue, spamDetector) {
    if (selectedValue === 'true') {
      selectedValue = true;
    } else if (selectedValue === 'false') {
      selectedValue = false;
    }
    this.spamDetectorService.updateSpamDetector(selectedValue, spamDetector.id).subscribe(() => {});
  }

  changeSpamDetectorType(data) {
    this.page = 1;
    data.value === 'true' ? (this.isSpam = true) : (this.isSpam = false);
    this.getSpamDetectorsData();
  }

  changeSpamDecisionType(data) {
    this.page = 1;
    data.value === 'true' ? (this.isSpamDecision = true) : (this.isSpamDecision = false);
    this.getSpamDetectorsData();
  }

  clearFilters() {
    this.isSpam = null;
    this.isSpamDecision = null;
    this.page = 1;
    this.getSpamDetectorsData();
  }

  openDialog(selectedValue: string, previousValue: boolean, id: number, dialog: any) {
    console.log(selectedValue, 'selectedValue');
    console.log(typeof previousValue, 'originalValue 1');

    this.dialogService.open(dialog, {
      context: {
        selectedValue: selectedValue,
        id: id,
      },
    });
    // .onClose.subscribe((result) => {
    //   if (result === 'cancelled') {
    //     console.log(previousValue, 'originalValue');
    //     console.log(typeof previousValue, 'originalValue 2');
    //     if (previousValue === true) {
    //       // console.log('true');
    //       // spamDetector.is_spam_decision = true;
    //     } else if (originalValue === false) {
    //       // console.log('false');
    //       // spamDetector.is_spam_decision = false;
    //     } else {
    //       // console.log('null');
    //       // spamDetector.is_spam_decision = null;
    //     }
    //     this.changeDetectorRef.detectChanges();
    //   } else {
    //     console.log(selectedValue, 'selectedValue');
    //     // spamDetector.is_spam_decision = selectedValue === 'true' ? true : false;
    //   }
    // }
    // );
  }

  cancelDialog(previousValue, id) {
    console.log(previousValue, 'previousValue');
    console.log(id, 'id');
    // spamDetector.is_spam_decision = previousValue.is_spam_decision;
    // console.log(previousValue.is_spam_decision, 'previousValue');
    const spamDetector = this.spamDetectors.find((spamDetector) => spamDetector.id === id);
    if (spamDetector) {
      spamDetector.is_spam_decision = previousValue;
    }
  }

  ngOnDestroy() {
    this.seoService.noIndex(false);
  }
}
