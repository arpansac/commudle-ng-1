import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class AddToCalenderService {
  private formatDate(date: Date, format = 'YYYYMMDDTHHmmss'): string {
    return moment(date).format(format);
  }

  private sanitizeHtml(html: string): string {
    if (!html) {
      return '';
    }
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p>/gi, '\n\n')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .trim();
  }

  addToGoogleCalendar(sDate: Date, eDate: Date, title: string, location: string, details: string): string {
    const startDate = this.formatDate(sDate);
    const endDate = this.formatDate(eDate);
    const eventName = encodeURIComponent(title || '');
    const encodedLocation = location ? encodeURIComponent(location) : '';
    const encodedDetails = encodeURIComponent(this.sanitizeHtml(details));

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventName}&dates=${startDate}/${endDate}&details=${encodedDetails}&location=${encodedLocation}`;
  }

  addToAppleCalendar(sDate: Date, eDate: Date, title: string, location: string, details: string): void {
    this.downloadIcsFile(sDate, eDate, title, location, details);
  }

  addToOutlookCalendar(sDate: Date, eDate: Date, title: string, location: string, details: string): string {
    const startDate = encodeURIComponent(moment(sDate).toISOString());
    const endDate = encodeURIComponent(moment(eDate).toISOString());
    const plainDetails = encodeURIComponent(this.sanitizeHtml(details));
    const eventName = encodeURIComponent(title || '');
    const encodedLocation = location ? encodeURIComponent(location) : '';

    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${eventName}&body=${plainDetails}&startdt=${startDate}&enddt=${endDate}&location=${encodedLocation}`;
  }

  addToMicrosoftCalendar(sDate: Date, eDate: Date, title: string, location: string, details: string): string {
    const startDate = this.formatDate(sDate, 'YYYY-MM-DDTHH:mm:ss');
    const endDate = this.formatDate(eDate, 'YYYY-MM-DDTHH:mm:ss');
    const eventName = encodeURIComponent(title || '');
    const encodedLocation = location ? encodeURIComponent(location) : '';
    const encodedDetails = encodeURIComponent(this.sanitizeHtml(details));

    return `https://outlook.office.com/calendar/0/deeplink/compose?subject=${eventName}&startdt=${startDate}&enddt=${endDate}&body=${encodedDetails}&location=${encodedLocation}`;
  }

  downloadIcsFile(sDate: Date, eDate: Date, title: string, location: string, details: string): void {
    const startDate = this.formatDate(sDate, 'YYYY-MM-DDTHH:mm:ss');
    const endDate = this.formatDate(eDate, 'YYYY-MM-DDTHH:mm:ss');
    const plainDetails = this.sanitizeHtml(details).replace(/\r?\n|\r/g, '\\n');
    const encodedLocation = location || '';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${startDate.replace(/[-:]/g, '')}`,
      `DTEND:${endDate.replace(/[-:]/g, '')}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${plainDetails}`,
      `LOCATION:${encodedLocation}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${title}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
