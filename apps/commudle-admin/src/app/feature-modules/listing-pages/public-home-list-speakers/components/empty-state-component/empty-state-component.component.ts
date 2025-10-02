import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'commudle-empty-state-component',
    templateUrl: './empty-state-component.component.html',
    styleUrls: ['./empty-state-component.component.scss'],
    standalone: false
})
export class EmptyStateComponent implements OnInit {
  @Input() parentType: string;
  constructor() {}

  ngOnInit(): void {}
}
