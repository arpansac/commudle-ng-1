import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { NbIconModule } from '@commudle/theme';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule, NbIconModule],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
})
export class BadgeComponent implements OnInit {
  @Input() text: string | number;
  @Input() fontSize: 'small' | 'x-small' | 'xx-small' | 'regular';
  @Input() color: string = 'com-bg-Bright-Gray';
  @Input() fontColor: string = 'com-text-tWhite';
  @Input() nbIcon: string;
  @Input() dotMode: boolean;
  @Input() position: 'top right' | 'top left' | 'right center' | 'left center' | 'center right' | 'center left';
  @Input() borderRadius: 'rectangle' | 'semi-round' | 'round' | 'full-round' = 'rectangle';

  // bg;

  @HostBinding('class')
  get themeClass(): string {
    return this.position || '';
  }

  ngOnInit(): void {}
}
