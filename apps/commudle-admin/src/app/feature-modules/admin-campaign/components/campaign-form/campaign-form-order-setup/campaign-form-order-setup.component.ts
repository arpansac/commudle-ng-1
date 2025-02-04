import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'commudle-campaign-form-order-setup',
  templateUrl: './campaign-form-order-setup.component.html',
  styleUrls: ['./campaign-form-order-setup.component.scss'],
})
export class CampaignFormOrderSetupComponent implements OnInit {
  fragment: string;
  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.fragment.subscribe((fragment) => {
      this.fragment = fragment || '';
      console.log(this.fragment); // Output: 'user-info' if clicked
    });
  }
}
