import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from '@commudle/shared-services';
@Component({
  selector: 'commudle-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  redirectUrl: string;
  currentUrl: string;

  constructor(private activatedRoute: ActivatedRoute, private seoService: SeoService) {}

  ngOnInit() {
    this.redirectUrl = this.activatedRoute.snapshot.queryParams?.redirect || '/';
    this.currentUrl = this.activatedRoute.snapshot.url[0]?.path || '';
    this.setMeta();
  }

  setMeta() {
    this.seoService.setTags(
      this.currentUrl === 'signup' ? 'Create Account | Your Developer Profile' : 'Login | Enter Your Developer Network',
      this.currentUrl === 'signup'
        ? 'Sign up on Commudle to build your developer profile and join developer communities'
        : 'Welcome back, login to your developer network and communities.',
      'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }
}
