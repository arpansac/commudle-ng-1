import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'commudle-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent {
  @Input() placeholder = 'Enter text';
  @Input() type: 'text' | 'number' | 'datetime-local' = 'text';
  @Input() id: string;
  @Input() name: string;
  @Output() valueChange = new EventEmitter<string | number>();
  inputValue: string | number = '';

  onInputChange(event: any) {
    if (this.type === 'number') {
      this.inputValue = event.target.value ? Number(event.target.value) : '';
    } else {
      this.inputValue = event.target.value;
    }
    this.valueChange.emit(this.inputValue);
  }
}
