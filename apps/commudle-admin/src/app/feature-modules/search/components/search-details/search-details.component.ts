import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'commudle-search-details',
  templateUrl: './search-details.component.html',
  styleUrls: ['./search-details.component.scss'],
})
export class SearchDetailsComponent implements OnInit {
  @Input() option: any;

  constructor() {}

  ngOnInit(): void {
    // Remove HTML tags from the about field
    if (this.option.type === 'Community' && this.option.about) {
      this.option.about = this.option.about.replace(/<[^>]*>/g, '');
    }
  }
}
