import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IWhatsNew } from 'apps/shared-models/whats-new.model';
import { CmsService } from 'apps/shared-services/cms.service';
import { BadgeComponent } from 'apps/shared-components/badge/badge.component';

@Component({
  selector: 'commudle-whats-new-card',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './whats-new-card.component.html',
  styleUrls: ['./whats-new-card.component.scss'],
})
export class WhatsNewCardComponent implements OnInit {
  @Input() update: IWhatsNew;
  richText: string;
  constructor(private cmsService: CmsService) {}

  ngOnInit(): void {
    this.richText = this.cmsService.getHtmlFromBlock(this.update);
  }

  imageUrl(source: any) {
    return this.cmsService.getImageUrl(source);
  }
}
