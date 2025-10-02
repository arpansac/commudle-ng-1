import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'sortBy',
    standalone: false
})
export class SortByPipe implements PipeTransform {
  transform(value: Array<any>, args: Array<string>, order: Array<'asc' | 'desc'>): any {
    return _.sortBy(value, args, order);
  }
}
