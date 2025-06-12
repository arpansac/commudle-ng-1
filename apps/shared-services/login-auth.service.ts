import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NbDialogService } from '@commudle/theme';
import { LoginSignupComponent } from 'apps/commudle-admin/src/app/components/login-signup/login-signup.component';

@Injectable({
  providedIn: 'root',
})
export class LoginAuthService {
  constructor(private router: Router, private nbDialogService: NbDialogService) {}

  openLoginSignupTemplate() {
    const currentUrl = this.router.url;
    this.nbDialogService.open(LoginSignupComponent, {
      context: { redirectUrl: currentUrl },
      closeOnBackdropClick: false,
      closeOnEsc: false,
      hasScroll: true,
    });
  }
}
