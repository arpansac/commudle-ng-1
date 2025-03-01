import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ITag } from '@commudle/shared-models';
import { TagService } from '@commudle/shared-services';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { debounceTime, fromEvent, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
})
export class TagComponent implements OnInit, OnDestroy {
  @Input() tags: string[];
  @Input() editable: boolean;
  @Input() inputDisabled: boolean;
  @Input() minimumTags: number = 5;
  @Input() backgroundColor: string = 'com-bg-[#F7F9FC]';
  @Input() fontColor: string;
  @Input() maximumTag;
  @Input() size; //It can be tiny;
  @Input() minTagLimit = true;

  @Output() tagAdd: EventEmitter<string> = new EventEmitter<string>();
  @Output() tagDelete: EventEmitter<string> = new EventEmitter<string>();

  subscription: Subscription;
  faXmark = faXmark;
  searchForm: FormGroup;
  query = '';
  suggestedTags: ITag[];
  constructor(private tagService: TagService, private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      q: [''],
    });
  }
  ngOnInit(): void {
    this.subscription = this.searchForm.valueChanges
      .pipe(
        debounceTime(800),
        switchMap(() => {
          this.query = this.searchForm.get('q')?.value || '';
          return this.tagService.index(this.query, true);
        }),
      )
      .subscribe((data) => {
        this.suggestedTags = data.values;
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getTags() {
    let tags = this.tags.filter(Boolean);

    if (this.maximumTag) {
      tags = tags.slice(0, this.maximumTag);
    }

    return tags;
  }

  onTagAdd({ value, input }): void {
    this.tagAdd.emit(value);

    if (input) {
      input.nativeElement.value = '';
      this.subscription = fromEvent(input.nativeElement.parentNode, 'keypress', { capture: true }).subscribe(
        (e: any) => {
          if (e.target === input.nativeElement && e.key === 'Enter') {
            e.stopPropagation();
            e.preventDefault();
          }
        },
      );
    }
  }

  onTagRemove(tag): void {
    this.tagDelete.emit(tag);
  }

  onKeyDown(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;

    // Check if Backspace is pressed and input is empty
    if (event.key === 'Backspace' && inputElement.value === '' && this.tags.length > 0) {
      const lastTag = this.tags[this.tags.length - 1];
      this.onTagRemove(lastTag);
    }
  }
}
