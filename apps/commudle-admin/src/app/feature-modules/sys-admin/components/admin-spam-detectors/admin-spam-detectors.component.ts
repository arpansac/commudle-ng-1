import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';

@Component({
  selector: 'commudle-admin-spam-detectors',
  templateUrl: './admin-spam-detectors.component.html',
  styleUrls: ['./admin-spam-detectors.component.scss'],
})
export class AdminSpamDetectorsComponent implements OnInit, OnDestroy {
  //   spamDetectors: any[] = [];
  //   spamDetectorForm: FormGroup;
  //   showAllResults = '';
  //   page = 1;
  //   count = 10;
  //   total = 0;

  constructor(private dialogService: NbDialogService, private fb: FormBuilder, private seoService: SeoService) {
    // this.spamDetectorForm = this.fb.group({
    //   name: ['', Validators.required],
    //   type: ['', Validators.required],
    //   enabled: [true, Validators.required],
    //   threshold: [0.8, [Validators.required, Validators.min(0), Validators.max(1)]],
    // });
  }

  ngOnInit() {
    // this.seoService.noIndex(true);
    // this.getSpamDetectors();
    // this.seoService.setTitle('Spam Detectors | Commudle');
  }

  getSpamDetectors() {
    // TODO: Implement service call to get spam detectors
    // For now, using mock data
    // this.spamDetectors = [
    //   {
    //     id: 1,
    //     name: 'Content Filter',
    //     type: 'text_analysis',
    //     enabled: true,
    //     threshold: 0.8,
    //     description: 'Analyzes text content for spam patterns',
    //   },
    //   {
    //     id: 2,
    //     name: 'User Behavior',
    //     type: 'behavior_analysis',
    //     enabled: true,
    //     threshold: 0.7,
    //     description: 'Monitors user behavior patterns',
    //   },
    // ];
    // this.total = this.spamDetectors.length;
  }

  changeSpamDetectorType() {
    // this.page = 1;
    // this.getSpamDetectors();
  }

  openDialog(dialog: any) {
    // this.dialogService.open(dialog);
  }

  create() {
    // if (this.spamDetectorForm.valid) {
    //   // TODO: Implement service call to create spam detector
    //   const newDetector = {
    //     id: Date.now(),
    //     ...this.spamDetectorForm.value,
    //   };
    //   this.spamDetectors.push(newDetector);
    //   this.total = this.spamDetectors.length;
    //   this.spamDetectorForm.reset({
    //     enabled: true,
    //     threshold: 0.8,
    //   });
    // }
  }

  toggleDetector(detector: any) {
    // detector.enabled = !detector.enabled;
    // TODO: Implement service call to update detector status
  }

  deleteDetector(detector: any) {
    // const index = this.spamDetectors.findIndex((d) => d.id === detector.id);
    // if (index > -1) {
    //   this.spamDetectors.splice(index, 1);
    //   this.total = this.spamDetectors.length;
    //   // TODO: Implement service call to delete detector
    // }
  }

  ngOnDestroy() {
    // this.seoService.noIndex(false);
  }
}
