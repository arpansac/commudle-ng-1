import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { SeoService, ToastrService } from '@commudle/shared-services';
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
    private toastrService: ToastrService,
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
      });
  }

  updateSpamDetector(selectedValue, id) {
    selectedValue === 'true' ? (selectedValue = true) : (selectedValue = false);
    this.spamDetectorService.updateSpamDetector(selectedValue, id).subscribe(() => {
      this.toastrService.successDialog('Spam Detector Updated');
    });
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

  openDialog(selectedValue: string, spamDetector: ISpamDetector, dialog: any) {
    const previousValue = spamDetector.is_spam_decision;
    spamDetector.is_spam_decision = selectedValue === 'true' ? true : selectedValue === 'false' ? false : null;
    this.changeDetectorRef.detectChanges();

    this.dialogService
      .open(dialog, {
        context: {
          selectedValue: selectedValue,
          spamDetector: spamDetector,
        },
      })
      .onClose.subscribe((result) => {
        if (result === false) {
          spamDetector.is_spam_decision = previousValue;
          this.changeDetectorRef.detectChanges();
          this.changeDetectorRef.markForCheck();
        } else {
          spamDetector.is_spam_decision = selectedValue === 'true' ? true : false;
          this.changeDetectorRef.detectChanges();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  ngOnDestroy() {
    this.seoService.noIndex(false);
  }
}
