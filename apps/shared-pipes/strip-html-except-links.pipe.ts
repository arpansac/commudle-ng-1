import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripHtmlExceptLinks',
  standalone: false,
})
export class StripHtmlExceptLinksPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Decode HTML entities
    const el = document.createElement('span');
    el.innerHTML = value;
    const decoded = el.innerHTML;

    // Remove all HTML tags except <a> tags
    return decoded.replace(/<(?!\/?a\b)[^>]*>/gi, '');
  }
}
