import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { LibErrorHandlerService } from 'apps/lib-error-handler/src/public-api';
import { AuthService, ToastrService } from '@commudle/shared-services';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private authService: AuthService,
    private errorHandlerService: LibErrorHandlerService,
    private toasterService: ToastrService,
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.authService.currentUserVerified$.subscribe((verified) => {
      if (verified === false) {
        this.router.navigate(['/login'], { queryParams: { redirect: state.url } });
        return false;
      }

      if (verified && next.data.expectedRoles) {
        this.authService.currentUser$.subscribe((currentUser) => {
          const matchingRoles = currentUser.user_roles.filter((value) => -1 !== next.data.expectedRoles.indexOf(value));
          if (matchingRoles.length === 0) {
            this.toasterService.errorDialog('You do not have permission to access this page');
            this.errorHandlerService.handleError(403, 'Unauthorized');
          }
        });
      }
    });
    return true;
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(route, state);
  }
}
