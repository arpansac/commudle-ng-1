import { Component, Input, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { ICurrentUser } from 'apps/shared-models/current_user.model';
import { NbDialogRef, NbDialogService } from '@commudle/theme';

@Component({
  selector: 'commudle-navbar-user-context-menu',
  templateUrl: './navbar-user-context-menu.component.html',
  styleUrls: ['./navbar-user-context-menu.component.scss'],
})
export class NavbarUserContextMenuComponent implements OnInit {
  @Input() currentUser: ICurrentUser;
  showUserContextMenu = true;

  constructor(private router: Router, private dialogService: NbDialogService) {}

  ngOnInit(): void {}

  logout(): void {
    this.router.navigate(['/logout']);
    this.showUserContextMenu = false;
  }

  openConfirmDialogBox(dialog: TemplateRef<any>) {
    this.dialogService.open(dialog, {
      closeOnBackdropClick: true,
      closeOnEsc: true,
    });
  }
}
