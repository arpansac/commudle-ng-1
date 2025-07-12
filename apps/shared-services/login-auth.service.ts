import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { NbDialogRef, NbDialogService } from '@commudle/theme';
import { LoginSignupComponent } from 'apps/commudle-admin/src/app/components/login-signup/login-signup.component';

@Injectable({
  providedIn: 'root',
})
export class LoginAuthService {
  private dialogRef: NbDialogRef<LoginSignupComponent>;

  constructor(private router: Router, private nbDialogService: NbDialogService) {}

  openLoginSignupTemplate() {
    const currentUrl = this.router.url;
    this.dialogRef = this.nbDialogService.open(LoginSignupComponent, {
      context: { redirectUrl: currentUrl },
      closeOnBackdropClick: false,
      closeOnEsc: false,
      hasScroll: true,
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (this.dialogRef) {
          this.dialogRef.close();
        }
      }
    });
  }

  openLoginPage() {
    this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } });
  }
}
