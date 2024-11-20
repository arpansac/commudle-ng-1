import { Component, Input, OnInit } from '@angular/core';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { ILab } from 'apps/shared-models/lab.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-labs-card',
  templateUrl: './labs-card.component.html',
  styleUrls: ['./labs-card.component.scss'],
})
export class LabsCardComponent implements OnInit {
  @Input() lab: ILab;
  staticAssets = staticAssets;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  onNavigate() {
    setTimeout(() => {
      this.router.navigate(['/labs', this.lab.slug]);
    }, 100);
  }
}
