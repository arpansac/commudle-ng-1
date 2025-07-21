import { Component, OnDestroy, OnInit } from '@angular/core';
import { SeoService } from '@commudle/shared-services';
import { faRectangleAd } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'commudle-community-controls',
  templateUrl: './community-controls.component.html',
  styleUrls: ['./community-controls.component.scss'],
})
export class CommunityControlsComponent implements OnInit, OnDestroy {
  icons = {
    faRectangleAd,
  };
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.noIndex(true);
    this.seoService.setTitle('System Administration | Commudle');
  }

  ngOnDestroy() {
    this.seoService.noIndex(false);
  }
}
