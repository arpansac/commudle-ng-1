import { Component, OnInit } from '@angular/core';
import { SeoService } from 'apps/shared-services/seo.service';
import { faRectangleAd } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-community-controls',
  templateUrl: './community-controls.component.html',
  styleUrls: ['./community-controls.component.scss'],
})
export class CommunityControlsComponent implements OnInit {
  icons = {
    faRectangleAd,
  };
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.setTitle('Admin: Community Controls');
  }
}
