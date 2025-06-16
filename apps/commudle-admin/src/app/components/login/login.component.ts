import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'commudle-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  redirectUrl: string;
  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.redirectUrl = this.activatedRoute.snapshot.queryParams?.redirect || '/';
  }
}
