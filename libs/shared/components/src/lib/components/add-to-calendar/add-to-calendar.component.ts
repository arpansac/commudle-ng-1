import { Component, Input, OnInit } from '@angular/core';
import { AddToCalenderService } from '@commudle/shared-services';

@Component({
  selector: 'commudle-add-to-calendar',
  templateUrl: './add-to-calendar.component.html',
  styleUrls: ['./add-to-calendar.component.scss'],
})
export class AddToCalendarComponent implements OnInit {
  @Input() startDate: Date;
  @Input() endDate: Date;
  @Input() title: string;
  @Input() location: string;
  @Input() details: string;

  constructor(private addToCalendarService: AddToCalenderService) {}

  ngOnInit(): void {}

  addToGoogle(): void {
    const url = this.addToCalendarService.addToGoogleCalendar(
      this.startDate,
      this.endDate,
      this.title,
      this.location,
      this.details,
    );
    window.open(url, '_blank');
  }

  addToApple(): void {
    this.addToCalendarService.addToAppleCalendar(this.startDate, this.endDate, this.title, this.location, this.details);
  }

  addToOutlook(): void {
    const url = this.addToCalendarService.addToOutlookCalendar(
      this.startDate,
      this.endDate,
      this.title,
      this.location,
      this.details,
    );
    window.open(url, '_blank');
  }

  addToMicrosoft(): void {
    const url = this.addToCalendarService.addToMicrosoftCalendar(
      this.startDate,
      this.endDate,
      this.title,
      this.location,
      this.details,
    );
    window.open(url, '_blank');
  }

  downloadIcsFile(): void {
    this.addToCalendarService.downloadIcsFile(this.startDate, this.endDate, this.title, this.location, this.details);
  }
}
