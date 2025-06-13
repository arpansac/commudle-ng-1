import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class AddToCalenderService {
  constructor() {}

  addToGoogleCalendar(sDate, eDate, title, location, details) {
    const startDate = moment(sDate).format('YYYYMMDDTHHmmss');
    const endDate = moment(eDate).add(1, 'hours').format('YYYYMMDDTHHmmss');
    const eventName = encodeURIComponent(title);
    const encodedLocation = location ? encodeURIComponent(location) : '';
    const encodedDetails = encodeURIComponent(details);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventName}&dates=${startDate}/${endDate}&details=${encodedDetails}&location=${encodedLocation}`;
  }

  addToAppleCalendar(sDate, eDate, title, location, details) {
    this.downloadIcsFile(sDate, eDate, title, location, details);
  }

  addToOutlookCalendar(sDate, eDate, title, location, details) {
    const startDate = moment(sDate).format('YYYYMMDDTHHmmss');
    const endDate = moment(eDate).add(1, 'hours').format('YYYYMMDDTHHmmss');
    const eventName = encodeURIComponent(title);
    const encodedLocation = location ? encodeURIComponent(location) : '';
    const encodedDetails = encodeURIComponent(details);

    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${eventName}&startdt=${startDate}&enddt=${endDate}&body=${encodedDetails}&location=${encodedLocation}`;
  }

  addToMicrosoftCalendar(sDate, eDate, title, location, details) {
    const startDate = moment(sDate).format('YYYY-MM-DDTHH:mm:ss');
    const endDate = moment(eDate).add(1, 'hours').format('YYYY-MM-DDTHH:mm:ss');
    const eventName = encodeURIComponent(title);
    const encodedLocation = location ? encodeURIComponent(location) : '';
    const encodedDetails = encodeURIComponent(details);

    return `https://outlook.office.com/calendar/0/deeplink/compose?subject=${eventName}&startdt=${startDate}&enddt=${endDate}&body=${encodedDetails}&location=${encodedLocation}`;
  }

  downloadIcsFile(sDate, eDate, title, location, details) {
    const startDate = moment(sDate).format('YYYY-MM-DDTHH:mm:ss');
    const endDate = moment(eDate).add(1, 'hours').format('YYYY-MM-DDTHH:mm:ss');
    const eventName = encodeURIComponent(title);
    const encodedLocation = location ? encodeURIComponent(location) : '';
    const encodedDetails = encodeURIComponent(details);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${startDate.replace(/[-:]/g, '')}`,
      `DTEND:${endDate.replace(/[-:]/g, '')}`,
      `SUMMARY:${eventName}`,
      `DESCRIPTION:${encodedDetails}`,
      `LOCATION:${encodedLocation}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${eventName}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
