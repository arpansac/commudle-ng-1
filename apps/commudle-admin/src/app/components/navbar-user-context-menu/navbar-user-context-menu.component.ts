import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ICurrentUser } from 'apps/shared-models/current_user.model';

@Component({
  selector: 'commudle-navbar-user-context-menu',
  templateUrl: './navbar-user-context-menu.component.html',
  styleUrls: ['./navbar-user-context-menu.component.scss'],
})
export class NavbarUserContextMenuComponent implements OnInit, OnDestroy {
  @Input() currentUser: ICurrentUser;
  showUserContextMenu = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  logout(): void {
    this.router.navigate(['/logout']);
    this.showUserContextMenu = false;
  }

  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const contextMenu = document.querySelector('.user-profile-dropdown');
    if (contextMenu && !contextMenu.contains(target)) {
      this.showUserContextMenu = false;
    }
  }
}
