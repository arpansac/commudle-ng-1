import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRightLeft } from '@fortawesome/free-solid-svg-icons';
import { SidebarService } from 'apps/shared-components/sidebar/service/sidebar.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ESidebarPosition, ESidebarWidth, ESidebarHeading } from './enum/sidebar.enum';

@Component({
  selector: 'commudle-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
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
  @Input() textSize: ESidebarHeading = ESidebarHeading.XL;

  ESidebarPosition = ESidebarPosition;
  ESidebarWidth = ESidebarWidth;
  ESidebarHeading = ESidebarHeading;
  hideFullSidebar = false;
  expandSidebar = false;

  private destroy$ = new Subject<void>();
  private documentClickListener?: (event: MouseEvent) => void;

  //font-awesome icons
  faRightLeft = faRightLeft;

  constructor(
    private sidebarService: SidebarService,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit(): void {
    if (this.eventName && this.sidebarService.setSidebar$[this.eventName]) {
      this.sidebarService.setSidebar$[this.eventName].pipe(takeUntil(this.destroy$)).subscribe((data) => {
        this.expandSidebar = data;
      });
    }

    if (this.eventName && this.sidebarService.hideSidebar$[this.eventName]) {
      this.sidebarService.hideSidebar$[this.eventName].pipe(takeUntil(this.destroy$)).subscribe((data) => {
        this.hideFullSidebar = data;
      });
    }

    if (this.eventName && this.sidebarService.sidebarPosition$[this.eventName]) {
      this.sidebarService.sidebarPosition$[this.eventName].pipe(takeUntil(this.destroy$)).subscribe((data) => {
        this.position = data;
      });
    }

    // Set up document click listener manually for better control
    if (this.forWindow) {
      this.documentClickListener = this.onDocumentClick.bind(this);
      this.document.addEventListener('mousedown', this.documentClickListener);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.documentClickListener) {
      this.document.removeEventListener('mousedown', this.documentClickListener);
      this.documentClickListener = undefined;
    }
  }

  handleSidebarToggle() {
    this.sidebarService.toggleSidebarVisibility(this.eventName);
    this.toggleSidebar.emit(!this.isExpanded);
  }

  private onDocumentClick(event: MouseEvent): void {
    if (!this.forWindow || !(this.expandSidebar || this.isExpanded)) return;

    const clickedInside = this.sidebarElement?.nativeElement.contains(event.target);
    const clickedToggle = (event.target as HTMLElement)?.closest('.home-sidebar');

    if (!clickedInside && !clickedToggle) {
      this.sidebarService.toggleSidebarVisibility(this.eventName);
      this.toggleSidebar.emit(false);
    }
  }
}
