import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'commudle-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent {
  @Input() placeholder = 'Enter text';
  @Output() valueChange = new EventEmitter<string>();
  inputValue = '';

  onInputChange() {
    this.valueChange.emit(this.inputValue);
  }
}
