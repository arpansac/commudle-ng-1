import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripHtmlExceptLinks',
  standalone: false,
})
export class StripHtmlExceptLinksPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Remove all HTML tags except <a> tags
    return value.replace(/<(?!\/?a\b)[^>]*>/gi, '');
  }
}
