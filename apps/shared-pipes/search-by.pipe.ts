import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'searchBy',
    standalone: false
})
export class SearchByPipe implements PipeTransform {
  transform(value: Array<any>, args?: any): any {
    if (!value) return null;
    if (!args) return value;

    args = args.toLowerCase();

    return value.filter((data) => JSON.stringify(data).toLowerCase().includes(args));
  }
}
