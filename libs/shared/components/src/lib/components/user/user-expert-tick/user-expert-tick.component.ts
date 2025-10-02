import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'commudle-user-expert-tick',
    templateUrl: './user-expert-tick.component.html',
    styleUrls: ['./user-expert-tick.component.scss'],
    standalone: false
})
export class UserExpertTickComponent implements OnInit {
  staticAssets: any;
  constructor() {}

  ngOnInit() {
    this.staticAssets = {
      expert_tick:
        'https://json.commudle.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBL25pQXc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--59f8c841f2235ca8f35ad2f3343e7ddaa92c6a2b/Expert%20Blue%20Tick.svg',
    };
  }
}
