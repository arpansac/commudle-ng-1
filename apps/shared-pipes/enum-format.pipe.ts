import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'enumFormat',
    standalone: false
})
export class EnumFormatPipe implements PipeTransform {
  transform(value: string): string {
    // remove underscore and capitalize first letter
    return value
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
}
