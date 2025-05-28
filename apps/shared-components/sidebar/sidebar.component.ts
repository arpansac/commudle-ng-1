import { ESidebarPosition, ESidebarWidth } from './enum/sidebar.enum';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCaretLeft, faBars } from '@fortawesome/free-solid-svg-icons';
import { SidebarService } from 'apps/shared-components/sidebar/service/sidebar.service';

@Component({
  selector: 'commudle-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @ViewChild('sidebarElement') sidebarElement!: ElementRef;
  @Input() isExpanded: boolean = false;
  @Input() showExpandedButton: boolean = true;
  @Input() position: ESidebarPosition = ESidebarPosition.LEFT;
  @Input() expandedWidth: ESidebarWidth = ESidebarWidth.LARGE;
  @Input() heading: string;
  @Input() forWindow = true;
  @Output() toggleSidebar: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() eventName: string;
  @Input() showBorder = false;

  ESidebarPosition = ESidebarPosition;
  ESidebarWidth = ESidebarWidth;
  hideFullSidebar = false;
  expandSidebar = false;

  //font-awesome icons
  faCaretLeft = faCaretLeft;
  faBars = faBars;
  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    if (this.sidebarService.setSidebar$.hasOwnProperty(this.eventName)) {
      this.sidebarService.setSidebar$[this.eventName].subscribe((data) => {
        this.expandSidebar = data;
      });
    }

    if (this.sidebarService.hideSidebar$.hasOwnProperty(this.eventName)) {
      this.sidebarService.hideSidebar$[this.eventName].subscribe((data) => {
        this.hideFullSidebar = data;
      });
    }

    if (this.sidebarService.sidebarPosition$.hasOwnProperty(this.eventName)) {
      this.sidebarService.sidebarPosition$[this.eventName].subscribe((data) => {
        this.position = data;
      });
    }
  }

  handleSidebarToggle() {
    this.sidebarService.toggleSidebarVisibility(this.eventName);
    this.toggleSidebar.emit(!this.isExpanded);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.forWindow) return;

    const clickedInside = this.sidebarElement?.nativeElement.contains(event.target);
    const clickedToggle = (event.target as HTMLElement)?.closest('.home-sidebar');

    if (!clickedInside && !clickedToggle && (this.expandSidebar || this.isExpanded)) {
      this.sidebarService.toggleSidebarVisibility(this.eventName);
      this.toggleSidebar.emit(false);
    }
  }
}
