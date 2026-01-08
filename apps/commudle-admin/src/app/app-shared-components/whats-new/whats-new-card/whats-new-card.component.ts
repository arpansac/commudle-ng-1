import { Component, Input, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IWhatsNew } from 'apps/shared-models/whats-new.model';
import { CmsService } from 'apps/shared-services/cms.service';
import { BadgeComponent } from 'apps/shared-components/badge/badge.component';
import { NbDialogService, NbButtonModule, NbCardModule, NbIconModule } from '@commudle/theme';

@Component({
  selector: 'commudle-whats-new-card',
  standalone: true,
  imports: [CommonModule, BadgeComponent, NbButtonModule, NbCardModule, NbIconModule],
  templateUrl: './whats-new-card.component.html',
  styleUrls: ['./whats-new-card.component.scss'],
})
export class WhatsNewCardComponent implements OnInit {
  @Input() update: IWhatsNew;
  @ViewChild('imageTemplate') imageTemplate: TemplateRef<any>;
  richText: string;

  constructor(private cmsService: CmsService, private dialogService: NbDialogService) {}

  ngOnInit(): void {
    this.richText = this.cmsService.getHtmlFromBlock(this.update);
  }

  imageUrl(source: any) {
    return this.cmsService.getImageUrl(source);
  }

  openImage(image: any) {
    this.dialogService.open(this.imageTemplate, {
      context: {
        image: this.imageUrl(image)?.url(),
        title: this.update.title,
      },
    });
  }
}
