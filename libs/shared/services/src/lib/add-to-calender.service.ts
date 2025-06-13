import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class AddToCalenderService {
  constructor() {}

  addToGoogleCalendar(sDate, eDate, title, location, details) {
    const startDate = moment(sDate).format('YYYYMMDDTHHmmss');
    const endDate = moment(eDate).format('YYYYMMDDTHHmmss');
    const eventName = encodeURIComponent(title);
    const encodedLocation = location ? encodeURIComponent(location) : '';
    const encodedDetails = encodeURIComponent(details);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventName}&dates=${startDate}/${endDate}&details=${encodedDetails}&location=${encodedLocation}`;
  }

  addToAppleCalendar(sDate, eDate, title, location, details) {
    this.downloadIcsFile(sDate, eDate, title, location, details);
  }

  addToOutlookCalendar(sDate, eDate, title, location, details) {
    // "2025-06-13T14:00:00.000Z"
    const startDate = moment(sDate).toISOString();
    const endDate = moment(eDate).toISOString();

    const plainDetails = details
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p>/gi, '\n\n')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .trim();

    const encodedDetails = encodeURIComponent(plainDetails);

    const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
      title,
    )}&body=${encodeURIComponent(encodedDetails)}&startdt=${encodeURIComponent(startDate)}&enddt=${encodeURIComponent(
      endDate,
    )}&location=${encodeURIComponent(location || '')}`;

    return url;
  }

  addToMicrosoftCalendar(sDate, eDate, title, location, details) {
    const startDate = moment(sDate).format('YYYY-MM-DDTHH:mm:ss');
    const endDate = moment(eDate).format('YYYY-MM-DDTHH:mm:ss');
    const eventName = encodeURIComponent(title);
    const encodedLocation = location ? encodeURIComponent(location) : '';
    const encodedDetails = encodeURIComponent(details);

    return `https://outlook.office.com/calendar/0/deeplink/compose?subject=${eventName}&startdt=${startDate}&enddt=${endDate}&body=${encodedDetails}&location=${encodedLocation}`;
  }

  downloadIcsFile(sDate, eDate, title, location, details) {
    const startDate = moment(sDate).format('YYYY-MM-DDTHH:mm:ss');
    const endDate = moment(eDate).format('YYYY-MM-DDTHH:mm:ss');
    const eventName = title;
    const encodedLocation = location ? encodeURIComponent(location) : '';
    const plainDetails = details.replace(/<\/?[^>]+(>|$)/g, '').replace(/\r?\n|\r/g, '\\n');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${startDate.replace(/[-:]/g, '')}`,
      `DTEND:${endDate.replace(/[-:]/g, '')}`,
      `SUMMARY:${eventName}`,
      `DESCRIPTION:${plainDetails}`,
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
