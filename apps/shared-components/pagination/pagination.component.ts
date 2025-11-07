import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnChanges {
  @Input() current: number = 0;
  @Input() count: number = 0; // items per page
  @Input() total: number = 0; // all items
  @Input() showJumpTo: boolean = false;

  @Output() goTo: EventEmitter<number> = new EventEmitter<number>();
  @Output() next: EventEmitter<number> = new EventEmitter<number>();
  @Output() previous: EventEmitter<number> = new EventEmitter<number>();

  public pages: number[] = [];
  public totalPage: number;

  private static getPages(current: number, total: number): number[] {
    if (total <= 7) {
      return [...Array(total).keys()].map((x) => x + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, -1, total];
    }

    if (current >= total - 3) {
      return [1, -1, total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, -1, current - 1, current, current + 1, -1, total];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.current || changes.total || changes.count) {
      // get the number of pages
      this.totalPage = Math.ceil(this.total / this.count);
      this.pages = PaginationComponent.getPages(this.current, this.totalPage);
    }
  }

  public onGoTo(page: number | string): void {
    const pageNumber = typeof page === 'string' ? parseInt(page, 10) : page;
    this.goTo.emit(pageNumber);
  }

  public onNext(): void {
    this.next.emit(this.current + 1);
  }

  public onPrevious(): void {
    this.previous.emit(this.current - 1);
  }

  public getAllPages(): number[] {
    return Array.from({ length: this.totalPage }, (_, i) => i + 1);
  }
}
