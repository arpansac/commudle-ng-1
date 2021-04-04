import {Component, Input, OnInit} from '@angular/core';
import {ILab} from 'projects/shared-models/lab.model';
import {IUser} from 'projects/shared-models/user.model';

@Component({
  selector: 'app-user-lab-card',
  templateUrl: './user-lab-card.component.html',
  styleUrls: ['./user-lab-card.component.scss']
})
export class UserLabCardComponent implements OnInit {

  @Input() user: IUser;
  @Input() lab: ILab;

  constructor() {
  }

  ngOnInit(): void {
  }

  getDesc() {
    // Decode HTML
    const txt = document.createElement('textarea');
    txt.innerHTML = this.lab.description;
    const htmlContent = txt.value;
    // Remove HTML tags, take the first 100 characters and add '...'
    return htmlContent.replace(/<[^>]+>/g, '').substr(0, 100).concat('...');
  }
}